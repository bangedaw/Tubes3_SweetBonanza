type AlgorithmSummary = {
  name: string;
  matchCount: number;
  executionTimeMs: number;
};

type KeywordSummary = {
  keyword: string;
  count: number;
};

type PopupStats = {
  totalMatches: number;
  algorithms: AlgorithmSummary[];
  keywords: KeywordSummary[];
  statusText: string;
};

const fallbackStats: PopupStats = {
  totalMatches: 0,
  statusText: "Belum ada hasil scan realtime. Data akan muncul setelah integrasi storage.",
  algorithms: [
    { name: "KMP", matchCount: 0, executionTimeMs: 0 },
    { name: "Boyer-Moore", matchCount: 0, executionTimeMs: 0 },
    { name: "Regex", matchCount: 0, executionTimeMs: 0 },
    { name: "Weighted-Levenshtein", matchCount: 0, executionTimeMs: 0 },
  ],
  keywords: [],
};

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing popup element: ${id}`);
  }
  return element as T;
}

function renderAlgorithmStats(container: HTMLElement, algorithms: AlgorithmSummary[]) {
  container.replaceChildren();

  for (const algorithm of algorithms) {
    const row = document.createElement("article");

    const title = document.createElement("h3");
    title.textContent = algorithm.name;

    const matches = document.createElement("p");
    matches.textContent = `${algorithm.matchCount} match`;

    const time = document.createElement("p");
    time.textContent = `${algorithm.executionTimeMs.toFixed(2)} ms`;

    row.append(title, matches, time);
    container.appendChild(row);
  }
}

function renderKeywordStats(container: HTMLElement, keywords: KeywordSummary[]) {
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

function renderPopup(stats: PopupStats) {
  getRequiredElement<HTMLElement>("scan-status").textContent = stats.statusText;
  getRequiredElement<HTMLElement>("total-matches").textContent = String(stats.totalMatches);
  renderAlgorithmStats(getRequiredElement("algorithm-stats"), stats.algorithms);
  renderKeywordStats(getRequiredElement("keyword-stats"), stats.keywords);
}

document.addEventListener("DOMContentLoaded", () => {
  renderPopup(fallbackStats);

  getRequiredElement<HTMLButtonElement>("rescan-button").addEventListener("click", () => {
    getRequiredElement<HTMLElement>("scan-status").textContent =
      "Rescan belum terhubung ke content script.";
  });
});
