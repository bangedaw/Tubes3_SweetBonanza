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
