import type { AlgorithmResult, MatchResult } from "../types/match";

function buildLastOccurrenceTable(pattern: string): Map<string, number> {
    const lastOccurrence = new Map<string, number>();
    for (let i = 0; i < pattern.length; i++) {
        lastOccurrence.set(pattern[i], i);
    }
    return lastOccurrence;
}

function boyerMooreSearch(text: string, pattern: string): { indexes: number[]; comparisons: number } {
    if (pattern.length === 0 || text.length === 0 || pattern.length > text.length) {
        return { indexes: [], comparisons: 0 };
    }

    const lastOccurrence = buildLastOccurrenceTable(pattern);
    const result: number[] = [];
    let comparisons = 0;
    let shift = 0;
    while (shift <= text.length - pattern.length) {
        let patternIndex = pattern.length - 1;
        while (patternIndex >= 0) {
            comparisons++;
            if (pattern[patternIndex] !== text[shift + patternIndex]) {
                break;
            }
            patternIndex--;
        }
        if (patternIndex < 0) {
            result.push(shift);
            shift += 1;
        } else {
            const mismatchedChar = text[shift + patternIndex];
            const lastIndex = lastOccurrence.get(mismatchedChar) ?? -1;
            const move = patternIndex - lastIndex;
            shift += Math.max(1, move);
        }
    }
    return {indexes: result, comparisons};
}

export function searchBoyerMoore(text: string, keywords: string[]): AlgorithmResult {
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
        const result = boyerMooreSearch(lowerText, lowerKeyword);
        totalComparisons += result.comparisons;
        for (const startIndex of result.indexes) {
            const endIndex = startIndex + cleanKeyword.length;
            matches.push({
                keyword: cleanKeyword,
                matchedText: text.slice(startIndex, endIndex),
                startIndex,
                endIndex,
                algorithm: "Boyer-Moore",
                similarity: 1,
            });
        }
    }
    return {
        algorithm: "Boyer-Moore",
        matches,
        stats: {
            algorithm: "Boyer-Moore",
            totalMatches: matches.length,
            comparisons: totalComparisons,
            executionTimeMs: performance.now() - startTime,
        },
    };
}

export {boyerMooreSearch, buildLastOccurrenceTable};