import { searchBoyerMoore } from "../algorithms/boyerMoore";
import { searchKMP } from "../algorithms/kmp"
import { searchRegex } from "../algorithms/RegexMatcher";
import { searchWeightedLevenshtein } from "../algorithms/weightedLevenshtein";
import { writeScanStatistics } from "../storage/statsStore";
import { readBlurEnabled, readOcrEnabled, subscribeBlurEnabled, subscribeOcrEnabled } from "../storage/settingsStore";
import type { AlgorithmResult, AlgorithmName, MatchResult } from "../types/match";
import type { ScanAlgorithmSummary, ScanStatistics } from "../storage/statsStore";
import { createWorker } from "tesseract.js";
import keywordsRaw from "../../keywords/keywords.txt?raw";

const keywords: string[] = keywordsRaw
.split(/\r?\n/)
.map(s => s.trim())
.filter(Boolean);

// frek global
const algorithmNames: AlgorithmName[] = ["Boyer-Moore", "KMP", "Regex", "Weighted-Levenshtein", "OCR"];
const wordFrequencies = new Map<string, number>();
const ocrWordFrequencies = new Map<string, number>();
const algorithmExecTimes = new Map<AlgorithmName, number>();
const algorithmMatchCounts = new Map<AlgorithmName, number>();
const algorithmComparisons = new Map<AlgorithmName, number>();
const OCR_MAX_IMAGES_PER_SCAN = 12;
const OCR_MIN_IMAGE_SIZE = 80;
const OCR_RETRY_DELAY_MS = 500;
const OCR_NEXT_BATCH_DELAY_MS = 200;
const OCR_MAX_IMAGE_FAILURES = 2;
const OCR_PREPROCESS_MIN_TARGET_DIMENSION = 900;
const OCR_PREPROCESS_MAX_DIMENSION = 1600;
const OCR_WORKER_TIMEOUT_MS = 60000;
const OCR_RECOGNIZE_TIMEOUT_MS = 45000;

algorithmNames.forEach(algo => {
    algorithmExecTimes.set(algo, 0);
    algorithmMatchCounts.set(algo, 0);
});

type ChromeRuntimeApi = {
  runtime?: {
    getURL?: (path: string) => string;
    sendMessage?: <TResponse>(message: unknown, callback: (response?: TResponse) => void) => void;
    lastError?: {
      message?: string;
    };
  };
};

type TesseractWorker = Awaited<ReturnType<typeof createWorker>>;
type FetchImageResponse =
  | {
      ok: true;
      dataUrl: string;
    }
  | {
      ok: false;
      error?: string;
    };

let textHighlightMatchTotal = 0;
let ocrWorkerPromise: Promise<TesseractWorker> | null = null;
let ocrScanInProgress = false;
let ocrScanQueued = false;
let ocrScanTimer: number | undefined;
let currentBlurEnabled = false;
let currentOcrEnabled = false;
const processedScreenshotSegments = new Set<string>();

const tooltip = document.createElement("div");
tooltip.style.position = "absolute";
tooltip.style.display = "none";
tooltip.style.backgroundColor = "#333";
tooltip.style.color = "#fff";
tooltip.style.padding = "8px";
tooltip.style.borderRadius = "4px";
tooltip.style.fontSize = "12px";
tooltip.style.zIndex = "999999";
tooltip.style.pointerEvents = "none";
tooltip.style.lineHeight = "1.5";
document.body.appendChild(tooltip);

function handleMultipleAlgorithms(text: string, results: AlgorithmResult[], node: Text): number {
    let localMatchCount = 0; 
    const allMatches: (MatchResult & { algorithms: Set<string> })[] = [];

    for (const res of results) {
        const currentExecTime = algorithmExecTimes.get(res.algorithm) || 0;
        algorithmExecTimes.set(res.algorithm, currentExecTime + res.stats.executionTimeMs);
        
        const currentMatchCount = algorithmMatchCounts.get(res.algorithm) || 0;
        algorithmMatchCounts.set(res.algorithm, currentMatchCount + res.matches.length);

        if (typeof res.stats.comparisons === "number") {
          const currentComparisons = algorithmComparisons.get(res.algorithm) || 0;
          algorithmComparisons.set(res.algorithm, currentComparisons + res.stats.comparisons);
        }

        for (const m of res.matches) {
            allMatches.push({ ...m, algorithms: new Set([res.algorithm]) });
        }
    }

    if (allMatches.length > 0) {
      allMatches.sort((a, b) => a.startIndex - b.startIndex);
      
      const groupedMatches: typeof allMatches = [];
      for (const m of allMatches) {
          const last = groupedMatches[groupedMatches.length - 1];
          if (last && last.startIndex === m.startIndex && last.endIndex === m.endIndex) {
              m.algorithms.forEach(algo => last.algorithms.add(algo));
          } else {
              groupedMatches.push(m);
          }
      }

      const validMatches = [];
      let lastEnd = -1;
      
      for (const m of groupedMatches) {
        if (m.startIndex >= lastEnd) {
          validMatches.push(m);
          lastEnd = m.endIndex;
        }
      }

      if (validMatches.length === 0) return 0;
      
      const fragment = document.createDocumentFragment();
      let currentIndex = 0;
      
      for (const match of validMatches) {
        const beforeText = text.slice(currentIndex, match.startIndex);
        if (beforeText) {
          fragment.appendChild(document.createTextNode(beforeText));
        }
        
        const mark = document.createElement("mark");
        mark.className = "sweetbonanza-highlighted-word";
        mark.style.backgroundColor = "red";
        mark.style.color = "white";
        mark.style.cursor = "help";
        mark.dataset.sweetbonanzaTextHighlight = "true";

        const matchedWord = text.slice(match.startIndex, match.endIndex);
        mark.textContent = matchedWord;

        const normalWord = matchedWord.toLowerCase();
        wordFrequencies.set(normalWord, (wordFrequencies.get(normalWord) || 0) + 1);

        mark.dataset.keyword = matchedWord;
        mark.dataset.algorithms = Array.from(match.algorithms).join(", ");
        if (currentBlurEnabled) {
          mark.style.filter = "blur(4px)";
          mark.dataset.sweetbonanzaBlurred = "true";
        }

        fragment.appendChild(mark);
        
        currentIndex = match.endIndex;
        localMatchCount++; 
      }
      
      const afterText = text.slice(currentIndex);
      if (afterText) {
        fragment.appendChild(document.createTextNode(afterText));
      }

      node.parentNode?.replaceChild(fragment, node);
    }
    return localMatchCount;
}

function getChromeRuntimeUrl(path: string): string {
  const chromeApi = getChromeApi();
  return chromeApi?.runtime?.getURL?.(path) || path;
}

function getChromeApi(): ChromeRuntimeApi | undefined {
  return (globalThis as { chrome?: ChromeRuntimeApi }).chrome;
}

async function getOcrWorker(): Promise<TesseractWorker> {
  if (!ocrWorkerPromise) {
    const options = {
      workerPath: getChromeRuntimeUrl("tesseract/worker.min.js"),
      corePath: getChromeRuntimeUrl("tesseract-core"),
    };

    ocrWorkerPromise = createWorker("eng", 1, {
      ...options,
      workerBlobURL: true,
    }).catch((error) => {
      console.warn("OCR worker blob gagal dibuat, mencoba worker langsung:", error);
      return createWorker("eng", 1, {
        ...options,
        workerBlobURL: false,
      });
    });
  }

  return ocrWorkerPromise;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutId: number | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (typeof timeoutId === "number") {
      window.clearTimeout(timeoutId);
    }
  });
}

function getTotalMatchCount(): number {
  return textHighlightMatchTotal + (algorithmMatchCounts.get("OCR") || 0);
}

function buildAlgorithmSummary(algorithm: AlgorithmName): ScanAlgorithmSummary {
  const summary: ScanAlgorithmSummary = {
    algorithm,
    matchCount: algorithmMatchCounts.get(algorithm) || 0,
    executionTimeMs: algorithmExecTimes.get(algorithm) || 0,
  };

  const comparisons = algorithmComparisons.get(algorithm);
  if (typeof comparisons === "number") {
    summary.comparisons = comparisons;
  }

  return summary;
}

function buildScanStatistics(totalMatches: number): ScanStatistics {
  return {
    totalMatches,
    keywordFrequencies: Array.from(wordFrequencies.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((first, second) => second.count - first.count),
    algorithms: algorithmNames.map(buildAlgorithmSummary),
    scannedAt: new Date().toISOString(),
    pageUrl: window.location.href,
    pageTitle: document.title,
  };
}

function persistCurrentScanStatistics() {
  persistScanStatistics(buildScanStatistics(getTotalMatchCount()));
}

function persistScanStatistics(statistics: ScanStatistics) {
  writeScanStatistics(statistics).catch((error) => {
    console.error("Gagal menyimpan statistik scan:", error);
  });
}

function resetStatistics() {
  wordFrequencies.clear();
  algorithmExecTimes.clear();
  algorithmMatchCounts.clear();
  algorithmComparisons.clear();
  algorithmNames.forEach(algorithm => {
    algorithmExecTimes.set(algorithm, 0);
    algorithmMatchCounts.set(algorithm, 0);
    algorithmComparisons.set(algorithm, 0);
  }
  );
}

function getImageSource(image: HTMLImageElement): string {
  return image.currentSrc || image.src;
}

function requestImageDataUrl(url: string): Promise<string | null> {
  const chromeApi = getChromeApi();
  const sendMessage = chromeApi?.runtime?.sendMessage;

  if (!sendMessage) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    sendMessage<FetchImageResponse>({ type: "SWEETBONANZA_FETCH_IMAGE", url }, (response) => {
      const errorMessage = chromeApi?.runtime?.lastError?.message;
      if (errorMessage || !response?.ok) {
        if (errorMessage || response?.error) {
          console.warn("Gambar OCR tidak dapat diambil lewat background:", errorMessage || response?.error);
        }
        resolve(null);
        return;
      }

      resolve(response.dataUrl);
    });
  });
}

function requestVisibleTabScreenshotDataUrl(): Promise<string | null> {
  const chromeApi = getChromeApi();
  const sendMessage = chromeApi?.runtime?.sendMessage;

  if (!sendMessage) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    sendMessage<FetchImageResponse>({ type: "SWEETBONANZA_CAPTURE_VISIBLE_TAB" }, (response) => {
      const errorMessage = chromeApi?.runtime?.lastError?.message;
      if (errorMessage || !response?.ok) {
        if (errorMessage || response?.error) {
          console.warn("Screenshot OCR tidak dapat diambil:", errorMessage || response?.error);
        }
        resolve(null);
        return;
      }

      resolve(response.dataUrl);
    });
  });
}

async function getOcrImageInput(image: HTMLImageElement): Promise<string | HTMLImageElement> {
  const source = getImageSource(image);

  if (source.startsWith("data:")) {
    return source;
  }

  if (source.startsWith("http://") || source.startsWith("https://")) {
    return (await requestImageDataUrl(source)) || image;
  }

  return image;
}

function applyTextBlur(enabled: boolean) {
  currentBlurEnabled = enabled;
  document.querySelectorAll<HTMLElement>(".sweetbonanza-highlighted-word").forEach((mark) => {
    if (enabled) {
      mark.style.filter = "blur(4px)";
      mark.dataset.sweetbonanzaBlurred = "true";
    } else {
      mark.style.filter = "";
      delete mark.dataset.sweetbonanzaBlurred;
    }
  });
}

function applyOcrImageEffect(image: HTMLImageElement, matchedKeywords: string[]) {
  image.dataset.sweetbonanzaOcrDetected = "true";
  image.dataset.sweetbonanzaOcrKeywords = matchedKeywords.join(", ");
  delete image.dataset.sweetbonanzaOcrFailures;
  image.style.filter = "blur(8px)";
  image.style.outline = "3px solid #b42318";
  image.style.outlineOffset = "2px";
  image.title = `Judol terdeteksi dari OCR: ${matchedKeywords.join(", ")}`;
}

function clearOcrImageState(image: HTMLImageElement) {
  delete image.dataset.sweetbonanzaOcrProcessed;
  delete image.dataset.sweetbonanzaOcrDetected;
  delete image.dataset.sweetbonanzaOcrKeywords;
  delete image.dataset.sweetbonanzaOcrFailures;
  image.style.filter = "";
  image.style.outline = "";
  image.style.outlineOffset = "";
  image.removeAttribute("title");
}

function clearOcrImageEffects() {
  document
    .querySelectorAll<HTMLImageElement>(
      "img[data-sweetbonanza-ocr-processed='true'], img[data-sweetbonanza-ocr-detected='true'], img[data-sweetbonanza-ocr-failures]"
    )
    .forEach(clearOcrImageState);
}

function resetOcrStatistics() {
  algorithmMatchCounts.set("OCR", 0);
  algorithmExecTimes.set("OCR", 0);
  algorithmComparisons.set("OCR", 0);
  processedScreenshotSegments.clear();

  for (const [keyword, count] of ocrWordFrequencies.entries()) {
    const nextCount = (wordFrequencies.get(keyword) || 0) - count;
    if (nextCount > 0) {
      wordFrequencies.set(keyword, nextCount);
    } else {
      wordFrequencies.delete(keyword);
    }
  }

  ocrWordFrequencies.clear();
  persistCurrentScanStatistics();
}

function isVisibleImage(image: HTMLImageElement): boolean {
  const rect = image.getBoundingClientRect();
  const style = window.getComputedStyle(image);

  return (
    image.complete &&
    image.naturalWidth >= OCR_MIN_IMAGE_SIZE &&
    image.naturalHeight >= OCR_MIN_IMAGE_SIZE &&
    rect.width >= OCR_MIN_IMAGE_SIZE &&
    rect.height >= OCR_MIN_IMAGE_SIZE &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  );
}

function getOcrFailureCount(image: HTMLImageElement): number {
  const count = Number(image.dataset.sweetbonanzaOcrFailures || "0");
  return Number.isFinite(count) ? count : 0;
}

function recordOcrImageFailure(image: HTMLImageElement, error: unknown) {
  const nextCount = getOcrFailureCount(image) + 1;
  image.dataset.sweetbonanzaOcrFailures = String(nextCount);
  recordOcrAttempt(0);
  persistCurrentScanStatistics();
  console.warn(`OCR gambar gagal diproses (${nextCount}/${OCR_MAX_IMAGE_FAILURES}):`, error);
}

function isOcrCandidateImage(image: HTMLImageElement): boolean {
  return (
    !image.dataset.sweetbonanzaOcrProcessed &&
    getOcrFailureCount(image) < OCR_MAX_IMAGE_FAILURES &&
    isVisibleImage(image)
  );
}

function getOcrCandidateImages(): HTMLImageElement[] {
  return Array.from(document.images)
    .filter(isOcrCandidateImage)
    .sort((first, second) => first.getBoundingClientRect().top - second.getBoundingClientRect().top)
    .slice(0, OCR_MAX_IMAGES_PER_SCAN);
}

function hasRemainingOcrCandidateImages(): boolean {
  return Array.from(document.images).some(isOcrCandidateImage);
}

function getUniqueMatches(results: AlgorithmResult[]): MatchResult[] {
  const matches = results.flatMap((result) => result.matches);
  const seen = new Set<string>();
  const uniqueMatches: MatchResult[] = [];

  for (const match of matches) {
    const key = `${match.startIndex}:${match.endIndex}:${match.keyword.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueMatches.push(match);
  }

  return uniqueMatches;
}

function findOcrTextMatches(text: string): MatchResult[] {
  return getUniqueMatches([
    searchBoyerMoore(text, keywords),
    searchKMP(text, keywords),
    searchRegex(text),
    searchWeightedLevenshtein(text, keywords),
  ]);
}

function loadImageDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Data gambar OCR tidak dapat dimuat."));
    image.src = dataUrl;
  });
}

async function preprocessImageDataUrl(dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith("data:image/")) {
    return dataUrl;
  }

  const image = await loadImageDataUrl(dataUrl);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const maxSourceDimension = Math.max(sourceWidth, sourceHeight);

  if (sourceWidth <= 0 || sourceHeight <= 0 || maxSourceDimension <= 0) {
    return dataUrl;
  }

  let scale = 1;
  if (maxSourceDimension < OCR_PREPROCESS_MIN_TARGET_DIMENSION) {
    scale = Math.min(3, OCR_PREPROCESS_MIN_TARGET_DIMENSION / maxSourceDimension);
  } else if (maxSourceDimension > OCR_PREPROCESS_MAX_DIMENSION) {
    scale = OCR_PREPROCESS_MAX_DIMENSION / maxSourceDimension;
  }

  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    return dataUrl;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.filter = "grayscale(1) contrast(1.35)";
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL("image/png");
}

async function prepareOcrInput(input: string | HTMLImageElement): Promise<string | HTMLImageElement> {
  if (typeof input !== "string") {
    return input;
  }

  try {
    return await preprocessImageDataUrl(input);
  } catch (error) {
    console.warn("Preprocessing OCR gagal, memakai gambar asli:", error);
    return input;
  }
}

function recordOcrMatches(matches: MatchResult[], executionTimeMs: number) {
  algorithmComparisons.set("OCR", (algorithmComparisons.get("OCR") || 0) + 1);
  algorithmExecTimes.set("OCR", (algorithmExecTimes.get("OCR") || 0) + executionTimeMs);
  algorithmMatchCounts.set("OCR", (algorithmMatchCounts.get("OCR") || 0) + matches.length);

  for (const match of matches) {
    const keyword = match.keyword.toLowerCase();
    wordFrequencies.set(keyword, (wordFrequencies.get(keyword) || 0) + 1);
    ocrWordFrequencies.set(keyword, (ocrWordFrequencies.get(keyword) || 0) + 1);
  }
}

function recordOcrAttempt(executionTimeMs: number) {
  algorithmComparisons.set("OCR", (algorithmComparisons.get("OCR") || 0) + 1);
  algorithmExecTimes.set("OCR", (algorithmExecTimes.get("OCR") || 0) + executionTimeMs);
}

async function recognizeOcrInput(
  worker: TesseractWorker,
  input: string | HTMLImageElement,
  timeoutMessage: string
): Promise<{ matches: MatchResult[]; executionTimeMs: number; text: string }> {
  const startTime = performance.now();
  const preparedInput = await prepareOcrInput(input);
  const result = await withTimeout(worker.recognize(preparedInput), OCR_RECOGNIZE_TIMEOUT_MS, timeoutMessage);
  const text = result.data.text || "";

  return {
    matches: findOcrTextMatches(text),
    executionTimeMs: performance.now() - startTime,
    text,
  };
}

function getScreenshotSegmentKey(): string {
  const viewportHeight = Math.max(window.innerHeight, 1);
  const segment = Math.round(window.scrollY / viewportHeight);
  return `${window.location.href}:${segment}:${window.innerWidth}x${window.innerHeight}`;
}

async function scanVisibleTabScreenshotWithOcr(worker: TesseractWorker): Promise<boolean> {
  const segmentKey = getScreenshotSegmentKey();
  if (processedScreenshotSegments.has(segmentKey)) {
    return false;
  }

  const screenshotDataUrl = await requestVisibleTabScreenshotDataUrl();
  if (!screenshotDataUrl) {
    return false;
  }

  processedScreenshotSegments.add(segmentKey);

  try {
    const result = await recognizeOcrInput(
      worker,
      screenshotDataUrl,
      "OCR screenshot melewati batas waktu."
    );

    if (result.matches.length > 0) {
      recordOcrMatches(result.matches, result.executionTimeMs);
    } else {
      recordOcrAttempt(result.executionTimeMs);
    }

    console.info(
      `OCR screenshot selesai. Teks ${result.text.length} karakter, ${result.matches.length} match.`
    );
    persistCurrentScanStatistics();
    return true;
  } catch (error) {
    processedScreenshotSegments.delete(segmentKey);
    console.warn("OCR screenshot gagal diproses:", error);
    return false;
  }
}

function scheduleOcrScan(delayMs = OCR_RETRY_DELAY_MS) {
  if (!currentOcrEnabled) {
    return;
  }

  if (typeof ocrScanTimer === "number") {
    window.clearTimeout(ocrScanTimer);
  }

  ocrScanTimer = window.setTimeout(() => {
    ocrScanTimer = undefined;
    void scanImagesWithOcr();
  }, delayMs);
}

async function scanImagesWithOcr() {
  if (!currentOcrEnabled) {
    return;
  }

  if (ocrScanInProgress) {
    ocrScanQueued = true;
    return;
  }

  let shouldContinueWithNextBatch = false;
  ocrScanInProgress = true;

  try {
    const workerStartTime = performance.now();
    let worker: TesseractWorker;

    try {
      worker = await withTimeout(
        getOcrWorker(),
        OCR_WORKER_TIMEOUT_MS,
        "OCR worker melewati batas waktu inisialisasi."
      );
    } catch (error) {
      recordOcrAttempt(performance.now() - workerStartTime);
      persistCurrentScanStatistics();
      console.warn("OCR worker gagal disiapkan:", error);
      return;
    }

    const screenshotScanned = await scanVisibleTabScreenshotWithOcr(worker);
    const images = getOcrCandidateImages();

    if (images.length === 0) {
      if (!screenshotScanned) {
        console.info("OCR aktif, tetapi belum ada gambar visible yang memenuhi ukuran minimum.");
      }
      return;
    }

    for (const image of images) {
      try {
        const imageInput = await getOcrImageInput(image);
        const result = await recognizeOcrInput(
          worker,
          imageInput,
          "OCR gambar melewati batas waktu."
        );

        image.dataset.sweetbonanzaOcrProcessed = "true";

        if (result.matches.length > 0) {
          recordOcrMatches(result.matches, result.executionTimeMs);
          applyOcrImageEffect(image, Array.from(new Set(result.matches.map((match) => match.keyword))));
        } else {
          recordOcrAttempt(result.executionTimeMs);
        }

        console.info(
          `OCR gambar selesai. Teks ${result.text.length} karakter, ${result.matches.length} match.`
        );
        persistCurrentScanStatistics();
      } catch (error) {
        recordOcrImageFailure(image, error);
      }
    }

    shouldContinueWithNextBatch = hasRemainingOcrCandidateImages();
  } finally {
    ocrScanInProgress = false;
    if (ocrScanQueued || shouldContinueWithNextBatch) {
      ocrScanQueued = false;
      scheduleOcrScan(shouldContinueWithNextBatch ? OCR_NEXT_BATCH_DELAY_MS : OCR_RETRY_DELAY_MS);
    }
  }
}

function initializeOcrTriggers(): () => void {
  const scheduleFromEvent = () => scheduleOcrScan();
  const scheduleFromLoad = (event: Event) => {
    if (event.target instanceof HTMLImageElement) {
      scheduleOcrScan();
    }
  };
  const observer = new MutationObserver((mutations) => {
    const hasImageChange = mutations.some((mutation) => {
      if (mutation.type === "attributes" && mutation.target instanceof HTMLImageElement) {
        clearOcrImageState(mutation.target);
        return true;
      }

      return Array.from(mutation.addedNodes).some((node) => {
        if (node instanceof HTMLImageElement) {
          return true;
        }

        return node instanceof HTMLElement && Boolean(node.querySelector("img"));
      });
    });

    if (hasImageChange) {
      scheduleOcrScan();
    }
  });

  window.addEventListener("load", scheduleFromEvent);
  window.addEventListener("scroll", scheduleFromEvent, { passive: true });
  window.addEventListener("resize", scheduleFromEvent);
  document.addEventListener("load", scheduleFromLoad, true);
  observer.observe(document.body, {
    attributeFilter: ["src", "srcset"],
    attributes: true,
    childList: true,
    subtree: true,
  });

  return () => {
    window.removeEventListener("load", scheduleFromEvent);
    window.removeEventListener("scroll", scheduleFromEvent);
    window.removeEventListener("resize", scheduleFromEvent);
    document.removeEventListener("load", scheduleFromLoad, true);
    observer.disconnect();
    if (typeof ocrScanTimer === "number") {
      window.clearTimeout(ocrScanTimer);
    }
  };
}

async function initializeBonusFeatures() {
  const [blurEnabled, ocrEnabled] = await Promise.all([readBlurEnabled(), readOcrEnabled()]);
  applyTextBlur(blurEnabled);
  currentOcrEnabled = ocrEnabled;

  const unsubscribeBlur = subscribeBlurEnabled((enabled) => {
    applyTextBlur(enabled);
  });
  const unsubscribeOcr = subscribeOcrEnabled((enabled) => {
    currentOcrEnabled = enabled;
    if (enabled) {
      scheduleOcrScan(0);
      return;
    }

    clearOcrImageEffects();
    resetOcrStatistics();
  });
  const cleanupOcrTriggers = initializeOcrTriggers();

  window.addEventListener("unload", () => {
    unsubscribeBlur();
    unsubscribeOcr();
    cleanupOcrTriggers();
  }, { once: true });

  if (ocrEnabled) {
    scheduleOcrScan(0);
  }
}

function highlightMatches() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("script, style, noscript, mark, input, textarea, code, pre")) {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.isContentEditable) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const nodesToProcess: Text[] = [];
  let currentNode = walker.nextNode();
  while (currentNode) {
    nodesToProcess.push(currentNode as Text);
    currentNode = walker.nextNode();
  }
  
  let totalUniqueMatches = 0;
  
  for (const node of nodesToProcess) {
    const text = node.nodeValue || "";
    const rBM = searchBoyerMoore(text, keywords);
    const rKMP = searchKMP(text, keywords);
    const rRegex = searchRegex(text);
    const rWL = searchWeightedLevenshtein(text, keywords);

    const results = [rBM, rKMP, rRegex, rWL];
    totalUniqueMatches += handleMultipleAlgorithms(text, results, node);
  }
  
  const allMarks = document.querySelectorAll('.sweetbonanza-highlighted-word');
  
  allMarks.forEach((markEl) => {
      const el = markEl as HTMLElement;
      
      el.addEventListener("mouseenter", (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const matchedKeyword = el.dataset.keyword || "";
          const normalWord = matchedKeyword.toLowerCase();
          const freq = wordFrequencies.get(normalWord) || 0;
          const algorithmsUsed = el.dataset.algorithms || "";
          
          let execTimeStr = "";
          algorithmsUsed.split(", ").forEach(algo => {
              if(!algo) return;
              const timeMs = algorithmExecTimes.get(algo) || 0;
              execTimeStr += `- ${algo}: ${timeMs.toFixed(3)} ms<br>`;
          });

          tooltip.innerHTML = `
            <strong>Keyword:</strong> ${matchedKeyword}<br>
            <strong>Algoritma:</strong> ${algorithmsUsed}<br>
            <strong>Frekuensi:</strong> ${freq} kali<br>
            <strong>Total Waktu Eksekusi:</strong><br>
            ${execTimeStr}
          `;
          
          tooltip.style.display = "block";
          tooltip.style.left = `${mouseEvent.pageX + 15}px`;
          tooltip.style.top = `${mouseEvent.pageY + 15}px`;
      });

      el.addEventListener("mousemove", (e: Event) => {
        const mouseEvent = e as MouseEvent;
        tooltip.style.left = `${mouseEvent.pageX + 15}px`;
        tooltip.style.top = `${mouseEvent.pageY + 15}px`;
      });

      el.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
      });
  });

  console.log(`Pencarian selesai. Ditemukan ${totalUniqueMatches} kata unik.`);
  console.log("Statistik Waktu per algoritma:", Object.fromEntries(algorithmExecTimes));
  textHighlightMatchTotal = totalUniqueMatches;
  persistCurrentScanStatistics();
}

function clearHighlights() {
  const highlightedElements = Array.from(document.querySelectorAll(".sweetbonanza-highlighted-word"));
  if (highlightedElements.length == 0) return;

  const parentToNormalize = new Set<HTMLElement>();
  for (const mark of highlightedElements) {
    const parent = mark.parentElement;
    if (parent) {
      parentToNormalize.add(parent);
      const textNode = document.createTextNode(mark.textContent || "");
      parent.replaceChild(textNode, mark);
    }
  }  
  for (const parent of parentToNormalize) {
    parent.normalize();
  }
  tooltip.style.display = "none";
}

let mutationObserver: MutationObserver | null = null;
let debounceTimeout: number | null = null;

function startMutationObserver() {
  if (mutationObserver) return;
  mutationObserver = new MutationObserver((mutations) => {
    let hasValidMutation = false;
    for (const mutation of mutations) {
      let isSelfMutation = false;
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement && (node.classList.contains("sweetbonanza-highlighted-word") || node.querySelector(".sweetbonanza-highlighted-word"))) {
            isSelfMutation = true;
          }
        });
      }
      if (!isSelfMutation) {
        hasValidMutation = true;
        break;
      }
    } 
    if (hasValidMutation) {
      if (debounceTimeout !== null) {
        clearTimeout(debounceTimeout);
      }
      debounceTimeout = window.setTimeout(() => {
        performScan();
      }, 500);
    }
  });
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

function stopMutationObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
  if (debounceTimeout !== null) {
    clearTimeout(debounceTimeout);
    debounceTimeout = null;
  }
}


let isScanning = false;

function performScan() {
  if (isScanning) return;
  isScanning = true;
  stopMutationObserver();
  try {
    clearHighlights();
    resetStatistics();
    highlightMatches();
  }
  catch (error) {
    console.error("Gagal melakukan scan halaman: ", error);
  }
  finally {
    isScanning = false;
    startMutationObserver();
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SWEETBONANZA_RESCAN") {
    performScan();
    sendResponse({ status: "success" });
  }
  return true;
});

performScan();
highlightMatches();
void initializeBonusFeatures();
