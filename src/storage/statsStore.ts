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
