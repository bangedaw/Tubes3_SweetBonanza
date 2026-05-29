import type { AlgorithmName } from "../types/match";

export const SCAN_STATISTICS_STORAGE_KEY = "sweetbonanza.scanStatistics";

export type ScanAlgorithmSummary = {
  algorithm: AlgorithmName;
  matchCount: number;
  executionTimeMs: number;
  comparisons?: number;
};

export type KeywordFrequency = {
  keyword: string;
  count: number;
};

export type ScanStatistics = {
  totalMatches: number;
  keywordFrequencies: KeywordFrequency[];
  algorithms: ScanAlgorithmSummary[];
  scannedAt: string | null;
  pageUrl: string | null;
  pageTitle: string | null;
};

export const EMPTY_SCAN_STATISTICS: ScanStatistics = {
  totalMatches: 0,
  keywordFrequencies: [],
  scannedAt: null,
  pageUrl: null,
  pageTitle: null,
  algorithms: [
    { algorithm: "KMP", matchCount: 0, executionTimeMs: 0, comparisons: 0 },
    { algorithm: "Boyer-Moore", matchCount: 0, executionTimeMs: 0, comparisons: 0 },
    { algorithm: "Regex", matchCount: 0, executionTimeMs: 0 },
    { algorithm: "Weighted-Levenshtein", matchCount: 0, executionTimeMs: 0 },
  ],
};

type ChromeStorageLocal = {
  get: (keys: string, callback: (items: Record<string, unknown>) => void) => void;
  set: (items: Record<string, unknown>, callback?: () => void) => void;
};

type ChromeRuntime = {
  lastError?: {
    message?: string;
  };
};

type ChromeApi = {
  runtime?: ChromeRuntime;
  storage?: {
    local?: ChromeStorageLocal;
  };
};

function getChromeApi(): ChromeApi | undefined {
  return (globalThis as { chrome?: ChromeApi }).chrome;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isScanStatistics(value: unknown): value is ScanStatistics {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.totalMatches === "number" &&
    Array.isArray(value.keywordFrequencies) &&
    Array.isArray(value.algorithms) &&
    (typeof value.scannedAt === "string" || value.scannedAt === null) &&
    (typeof value.pageUrl === "string" || value.pageUrl === null) &&
    (typeof value.pageTitle === "string" || value.pageTitle === null)
  );
}

export function readScanStatistics(): Promise<ScanStatistics | null> {
  const chromeApi = getChromeApi();
  const storage = chromeApi?.storage?.local;

  if (!storage) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    storage.get(SCAN_STATISTICS_STORAGE_KEY, (items) => {
      const errorMessage = chromeApi?.runtime?.lastError?.message;
      if (errorMessage) {
        reject(new Error(errorMessage));
        return;
      }

      const storedValue = items[SCAN_STATISTICS_STORAGE_KEY];
      resolve(isScanStatistics(storedValue) ? storedValue : null);
    });
  });
}

export function writeScanStatistics(statistics: ScanStatistics): Promise<void> {
  const chromeApi = getChromeApi();
  const storage = chromeApi?.storage?.local;

  if (!storage) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    storage.set({ [SCAN_STATISTICS_STORAGE_KEY]: statistics }, () => {
      const errorMessage = chromeApi?.runtime?.lastError?.message;
      if (errorMessage) {
        reject(new Error(errorMessage));
        return;
      }

      resolve();
    });
  });
}
