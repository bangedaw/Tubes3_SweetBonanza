import type { AlgorithmResult, MatchResult } from "../types/match";

function rabinKarpSearch(text: string, pattern: string): { indexes: number[]; comparisons: number } {
    const n = text.length;
    const m = pattern.length;
    
    if (m === 0 || n < m) {
        return { indexes: [], comparisons: 0 };
    }
    const d = 256;
    const q = 101;
    let h = 1;
    let p = 0;
    let t = 0;
    let comparisons = 0;
    const indexes: number[] = [];
    for (let i = 0; i < m - 1; i++) {
        h = (h * d) % q;
    }
    for (let i = 0; i < m; i++) {
        p = (d * p + pattern.charCodeAt(i)) % q;
        t = (d * t + text.charCodeAt(i)) % q;
    }
    for (let i = 0; i <= n - m; i++) {
        if (p === t) {
            let match = true;
            for (let j = 0; j < m; j++) {
                comparisons++;
                if (text[i + j] !== pattern[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                indexes.push(i);
            }
        }
        if (i < n - m) {
            t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
            if (t < 0) {
                t = t + q;
            }
        }
    }
    return { indexes, comparisons };
}

export function searchRabinKarp(text: string, keywords: string[]): AlgorithmResult {
    const startTime = performance.now();
    const matches: MatchResult[] = [];
    let totalComparisons = 0;
    const lowerText = text.toLowerCase();

    for (const keyword of keywords) {
        const cleanKeyword = keyword.trim();
        if (cleanKeyword.length === 0) {
            continue;
        }

        const lowerKeyword = cleanKeyword.toLowerCase();
        const result = rabinKarpSearch(lowerText, lowerKeyword);
        totalComparisons += result.comparisons;

        for (const startIndex of result.indexes) {
            const endIndex = startIndex + cleanKeyword.length;
            matches.push({
                keyword: cleanKeyword,
                matchedText: text.slice(startIndex, endIndex),
                startIndex,
                endIndex,
                algorithm: "Rabin-Karp",
                similarity: 1,
            });
        }
    }

    return {
        algorithm: "Rabin-Karp",
        matches,
        stats: {
            algorithm: "Rabin-Karp",
            totalMatches: matches.length,
            comparisons: totalComparisons,
            executionTimeMs: performance.now() - startTime,
        },
    };
}