import { searchBoyerMoore } from "../algorithms/boyerMoore";
import { searchKMP } from "../algorithms/kmp"
import { searchRegex } from "../algorithms/RegexMatcher";
import { searchWeightedLevenshtein } from "../algorithms/weightedLevenshtein";
import { writeScanStatistics } from "../storage/statsStore";
import type { AlgorithmResult, AlgorithmName, MatchResult } from "../types/match";
import type { ScanAlgorithmSummary, ScanStatistics } from "../storage/statsStore";
import keywordsRaw from "../../keywords/keywords.txt?raw";

const keywords: string[] = keywordsRaw
.split(/\r?\n/)
.map(s => s.trim())
.filter(Boolean);

// frek global
const algorithmNames: AlgorithmName[] = ["Boyer-Moore", "KMP", "Regex", "Weighted-Levenshtein"];
const wordFrequencies = new Map<string, number>();
const algorithmExecTimes = new Map<AlgorithmName, number>();
const algorithmMatchCounts = new Map<AlgorithmName, number>();
const algorithmComparisons = new Map<AlgorithmName, number>();

algorithmNames.forEach(algo => {
    algorithmExecTimes.set(algo, 0);
    algorithmMatchCounts.set(algo, 0);
});

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

        const matchedWord = text.slice(match.startIndex, match.endIndex);
        mark.textContent = matchedWord;

        const normalWord = matchedWord.toLowerCase();
        wordFrequencies.set(normalWord, (wordFrequencies.get(normalWord) || 0) + 1);

        mark.dataset.keyword = matchedWord;
        mark.dataset.algorithms = Array.from(match.algorithms).join(", ");

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
  persistScanStatistics(buildScanStatistics(totalUniqueMatches));
}
performScan();

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

let isScanning = false;

function performScan() {
  if (isScanning) return;
  isScanning = true;
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
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SWEETBONANZA_RESCAN") {
    performScan();
    sendResponse({ status: "success" });
  }
  return true;
});
