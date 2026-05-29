import { EMPTY_SCAN_STATISTICS, readScanStatistics, subscribeScanStatistics } from "../storage/statsStore";
import { readBlurEnabled, readOcrEnabled, writeBlurEnabled, writeOcrEnabled } from "../storage/settingsStore";
import type { KeywordFrequency, ScanAlgorithmSummary, ScanStatistics } from "../storage/statsStore";

const fallbackStatusText = "Belum ada hasil scan realtime. Data akan muncul setelah integrasi storage.";
const loadedStatusText = "Statistik scan terakhir berhasil dimuat.";
const loadingStatusText = "Memuat statistik scan terakhir...";
const errorStatusText = "Statistik belum dapat dimuat dari storage.";
const updatedStatusText = "Statistik scan terbaru diterima.";
const rescanRequestStatusText = "Meminta content script melakukan rescan...";
const rescanSentStatusText = "Permintaan rescan sudah dikirim ke halaman aktif.";
const rescanUnavailableStatusText = "Rescan belum tersedia pada halaman aktif.";
const ocrEnabledStatusText = "OCR aktif. Gambar visible akan diproses.";
const ocrDisabledStatusText = "OCR nonaktif.";
const ocrErrorStatusText = "Status OCR belum dapat disimpan.";
const blurEnabledStatusText = "Blur teks aktif untuk hasil deteksi.";
const blurDisabledStatusText = "Blur teks nonaktif.";
const blurErrorStatusText = "Status blur belum dapat disimpan.";

type ActiveTab = {
  id?: number;
};

type PopupChromeApi = {
  runtime?: {
    lastError?: {
      message?: string;
    };
  };
  tabs?: {
    query: (queryInfo: { active: boolean; currentWindow: boolean }, callback: (tabs: ActiveTab[]) => void) => void;
    sendMessage: (tabId: number, message: { type: string }, callback?: () => void) => void;
  };
};

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing popup element: ${id}`);
  }
  return element as T;
}

function getChromeApi(): PopupChromeApi | undefined {
  return (globalThis as { chrome?: PopupChromeApi }).chrome;
}

function getChromeLastErrorMessage(chromeApi: PopupChromeApi | undefined): string | undefined {
  return chromeApi?.runtime?.lastError?.message;
}

function requestActiveTabRescan(): Promise<void> {
  const chromeApi = getChromeApi();
  const tabsApi = chromeApi?.tabs;

  if (!tabsApi) {
    return Promise.reject(new Error("Tabs API tidak tersedia."));
  }

  return new Promise((resolve, reject) => {
    tabsApi.query({ active: true, currentWindow: true }, (tabs) => {
      const queryError = getChromeLastErrorMessage(chromeApi);
      if (queryError) {
        reject(new Error(queryError));
        return;
      }

      const tabId = tabs[0]?.id;
      if (typeof tabId !== "number") {
        reject(new Error("Tab aktif tidak ditemukan."));
        return;
      }

      tabsApi.sendMessage(tabId, { type: "SWEETBONANZA_RESCAN" }, () => {
        const sendError = getChromeLastErrorMessage(chromeApi);
        if (sendError) {
          reject(new Error(sendError));
          return;
        }

        resolve();
      });
    });
  });
}

function renderAlgorithmStats(container: HTMLElement, algorithms: ScanAlgorithmSummary[]) {
  container.replaceChildren();

  const maxMatchCount = Math.max(...algorithms.map((algorithm) => algorithm.matchCount), 1);

  for (const algorithm of algorithms) {
    const row = document.createElement("article");
    row.setAttribute(
      "aria-label",
      `${algorithm.algorithm}, ${algorithm.matchCount} match, ${algorithm.executionTimeMs.toFixed(2)} ms`
    );

    const header = document.createElement("div");
    header.className = "algorithm-header";

    const title = document.createElement("h3");
    title.textContent = algorithm.algorithm;

    const matchCount = document.createElement("strong");
    matchCount.className = "algorithm-match-count";
    matchCount.textContent = `${algorithm.matchCount} match`;

    const metrics = document.createElement("div");
    metrics.className = "algorithm-metrics";

    const timeMetric = document.createElement("div");
    timeMetric.className = "algorithm-metric";

    const timeLabel = document.createElement("span");
    timeLabel.textContent = "Waktu";

    const timeValue = document.createElement("strong");
    timeValue.textContent = `${algorithm.executionTimeMs.toFixed(2)} ms`;

    const comparisonMetric = document.createElement("div");
    comparisonMetric.className = "algorithm-metric";

    const comparisonLabel = document.createElement("span");
    comparisonLabel.textContent = algorithm.algorithm === "OCR" ? "Input" : "Comparison";

    const comparisonValue = document.createElement("strong");
    comparisonValue.textContent =
      typeof algorithm.comparisons === "number" ? String(algorithm.comparisons) : "-";

    const barTrack = document.createElement("div");
    barTrack.className = "algorithm-bar-track";

    const barFill = document.createElement("span");
    barFill.className = "algorithm-bar-fill";
    barFill.style.width =
      algorithm.matchCount > 0 ? `${Math.max(4, (algorithm.matchCount / maxMatchCount) * 100)}%` : "0";

    header.append(title, matchCount);
    timeMetric.append(timeLabel, timeValue);
    comparisonMetric.append(comparisonLabel, comparisonValue);
    metrics.append(timeMetric, comparisonMetric);
    barTrack.appendChild(barFill);
    row.append(header, metrics, barTrack);
    container.appendChild(row);
  }
}

function renderKeywordStats(container: HTMLElement, keywords: KeywordFrequency[]) {
  container.replaceChildren();

  if (keywords.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.textContent = "Belum ada keyword terdeteksi.";
    container.appendChild(emptyState);
    return;
  }

  const sortedKeywords = [...keywords].sort((first, second) => second.count - first.count);
  const maxCount = sortedKeywords[0]?.count || 1;
  const chart = document.createElement("div");
  chart.className = "keyword-chart";

  for (const keyword of sortedKeywords) {
    const row = document.createElement("article");
    row.className = "keyword-row";
    row.setAttribute("aria-label", `${keyword.keyword}, ${keyword.count} kemunculan`);

    const rowHeader = document.createElement("div");
    rowHeader.className = "keyword-row-header";

    const name = document.createElement("span");
    name.className = "keyword-name";
    name.textContent = keyword.keyword;
    name.title = keyword.keyword;

    const count = document.createElement("span");
    count.className = "keyword-count";
    count.textContent = String(keyword.count);

    const barTrack = document.createElement("div");
    barTrack.className = "keyword-bar-track";

    const barFill = document.createElement("span");
    barFill.className = "keyword-bar-fill";
    barFill.style.width = `${Math.max(4, (keyword.count / maxCount) * 100)}%`;

    rowHeader.append(name, count);
    barTrack.appendChild(barFill);
    row.append(rowHeader, barTrack);
    chart.appendChild(row);
  }

  container.appendChild(chart);
}

function getDisplayUrl(pageUrl: string | null): string {
  if (!pageUrl) {
    return "-";
  }

  try {
    const url = new URL(pageUrl);
    return url.hostname || pageUrl;
  } catch {
    return pageUrl;
  }
}

function getDisplayScanTime(scannedAt: string | null): string {
  if (!scannedAt) {
    return "-";
  }

  const scanDate = new Date(scannedAt);
  if (Number.isNaN(scanDate.getTime())) {
    return "-";
  }

  return scanDate.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function createMetadataRow(label: string, value: string, title = value): HTMLElement {
  const row = document.createElement("article");
  row.className = "metadata-row";

  const labelElement = document.createElement("span");
  labelElement.className = "metadata-label";
  labelElement.textContent = label;

  const valueElement = document.createElement("span");
  valueElement.className = "metadata-value";
  valueElement.textContent = value;
  valueElement.title = title;

  row.append(labelElement, valueElement);
  return row;
}

function renderScanMetadata(container: HTMLElement, stats: ScanStatistics) {
  container.replaceChildren(
    createMetadataRow("Halaman", stats.pageTitle || "-", stats.pageTitle || "-"),
    createMetadataRow("Domain", getDisplayUrl(stats.pageUrl), stats.pageUrl || "-"),
    createMetadataRow("Waktu", getDisplayScanTime(stats.scannedAt), stats.scannedAt || "-")
  );
}

function renderPopup(stats: ScanStatistics, statusText: string) {
  getRequiredElement<HTMLElement>("scan-status").textContent = statusText;
  getRequiredElement<HTMLElement>("total-matches").textContent = String(stats.totalMatches);
  renderScanMetadata(getRequiredElement("scan-metadata"), stats);
  renderAlgorithmStats(getRequiredElement("algorithm-stats"), stats.algorithms);
  renderKeywordStats(getRequiredElement("keyword-stats"), stats.keywordFrequencies);
}

function renderOcrToggle(enabled: boolean) {
  getRequiredElement<HTMLInputElement>("ocr-toggle").checked = enabled;
  getRequiredElement<HTMLElement>("ocr-status").textContent = enabled ? ocrEnabledStatusText : ocrDisabledStatusText;
}

function renderBlurToggle(enabled: boolean) {
  getRequiredElement<HTMLInputElement>("blur-toggle").checked = enabled;
  getRequiredElement<HTMLElement>("blur-status").textContent = enabled ? blurEnabledStatusText : blurDisabledStatusText;
}

document.addEventListener("DOMContentLoaded", async () => {
  renderPopup(EMPTY_SCAN_STATISTICS, loadingStatusText);
  renderOcrToggle(false);
  renderBlurToggle(false);

  const unsubscribe = subscribeScanStatistics((stats) => {
    renderPopup(stats ?? EMPTY_SCAN_STATISTICS, stats ? updatedStatusText : fallbackStatusText);
  });
  window.addEventListener("unload", unsubscribe, { once: true });

  getRequiredElement<HTMLButtonElement>("rescan-button").addEventListener("click", async () => {
    getRequiredElement<HTMLElement>("scan-status").textContent = rescanRequestStatusText;

    try {
      await requestActiveTabRescan();
      getRequiredElement<HTMLElement>("scan-status").textContent = rescanSentStatusText;
    } catch {
      getRequiredElement<HTMLElement>("scan-status").textContent = rescanUnavailableStatusText;
    }
  });

  getRequiredElement<HTMLInputElement>("ocr-toggle").addEventListener("change", async (event) => {
    const enabled = (event.currentTarget as HTMLInputElement).checked;
    renderOcrToggle(enabled);

    try {
      await writeOcrEnabled(enabled);
    } catch {
      renderOcrToggle(!enabled);
      getRequiredElement<HTMLElement>("ocr-status").textContent = ocrErrorStatusText;
    }
  });

  getRequiredElement<HTMLInputElement>("blur-toggle").addEventListener("change", async (event) => {
    const enabled = (event.currentTarget as HTMLInputElement).checked;
    renderBlurToggle(enabled);

    try {
      await writeBlurEnabled(enabled);
    } catch {
      renderBlurToggle(!enabled);
      getRequiredElement<HTMLElement>("blur-status").textContent = blurErrorStatusText;
    }
  });

  try {
    renderOcrToggle(await readOcrEnabled());
    renderBlurToggle(await readBlurEnabled());
    const storedStats = await readScanStatistics();
    renderPopup(storedStats ?? EMPTY_SCAN_STATISTICS, storedStats ? loadedStatusText : fallbackStatusText);
  } catch {
    renderPopup(EMPTY_SCAN_STATISTICS, errorStatusText);
  }
});
