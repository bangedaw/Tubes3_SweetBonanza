import { EMPTY_SCAN_STATISTICS, readScanStatistics } from "../storage/statsStore";
import type { KeywordFrequency, ScanAlgorithmSummary, ScanStatistics } from "../storage/statsStore";

const fallbackStatusText = "Belum ada hasil scan realtime. Data akan muncul setelah integrasi storage.";
const loadedStatusText = "Statistik scan terakhir berhasil dimuat.";
const loadingStatusText = "Memuat statistik scan terakhir...";
const errorStatusText = "Statistik belum dapat dimuat dari storage.";

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing popup element: ${id}`);
  }
  return element as T;
}

function renderAlgorithmStats(container: HTMLElement, algorithms: ScanAlgorithmSummary[]) {
  container.replaceChildren();

  for (const algorithm of algorithms) {
    const row = document.createElement("article");

    const title = document.createElement("h3");
    title.textContent = algorithm.algorithm;

    const matches = document.createElement("p");
    matches.textContent = `${algorithm.matchCount} match`;

    const time = document.createElement("p");
    time.textContent = `${algorithm.executionTimeMs.toFixed(2)} ms`;

    row.append(title, matches, time);
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

  const list = document.createElement("ol");
  for (const keyword of keywords) {
    const item = document.createElement("li");
    item.textContent = `${keyword.keyword}: ${keyword.count}`;
    list.appendChild(item);
  }

  container.appendChild(list);
}

function renderPopup(stats: ScanStatistics, statusText: string) {
  getRequiredElement<HTMLElement>("scan-status").textContent = statusText;
  getRequiredElement<HTMLElement>("total-matches").textContent = String(stats.totalMatches);
  renderAlgorithmStats(getRequiredElement("algorithm-stats"), stats.algorithms);
  renderKeywordStats(getRequiredElement("keyword-stats"), stats.keywordFrequencies);
}

document.addEventListener("DOMContentLoaded", async () => {
  renderPopup(EMPTY_SCAN_STATISTICS, loadingStatusText);

  getRequiredElement<HTMLButtonElement>("rescan-button").addEventListener("click", () => {
    getRequiredElement<HTMLElement>("scan-status").textContent =
      "Rescan belum terhubung ke content script.";
  });

  try {
    const storedStats = await readScanStatistics();
    renderPopup(storedStats ?? EMPTY_SCAN_STATISTICS, storedStats ? loadedStatusText : fallbackStatusText);
  } catch {
    renderPopup(EMPTY_SCAN_STATISTICS, errorStatusText);
  }
});
