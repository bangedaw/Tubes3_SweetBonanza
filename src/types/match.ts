export type AlgorithmName =
  | "KMP"
  | "Boyer-Moore"
  | "Regex"
  | "Weighted-Levenshtein"
  | "Aho-Corasick"
  | "Rabin-Karp"
  | "OCR";

export interface MatchResult {
  keyword: string;
  matchedText: string;
  startIndex: number;
  endIndex: number;
  algorithm: AlgorithmName;
  similarity?: number;
}

export interface AlgorithmStats {
  algorithm: AlgorithmName;
  totalMatches: number;
  comparisons?: number;
  executionTimeMs: number;
}

export interface AlgorithmResult {
  algorithm: AlgorithmName;
  matches: MatchResult[];
  stats: AlgorithmStats;
}
