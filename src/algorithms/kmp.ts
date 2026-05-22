import type { AlgorithmResult, MatchResult } from "../types/match";

function tableLPS(pattern: string): { lps: number[]; comparisons: number } {
    const lps: number[] = new Array(pattern.length).fill(0);
    let comparisons = 0;
    let len = 0;
    let i = 1;
    while(i<pattern.length) {
        comparisons++;
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        }
        else {
            if (len !== 0) {
                len = lps[len - 1];
            }
            else {
                lps[i] = 0;
                i++
            }
        }
    }
    return { lps, comparisons };
}

function kmpSearch(text: string, pattern: string): { indexes: number[]; comparisons: number } {
    if (pattern.length === 0) return { indexes: [], comparisons: 0 };
    const { lps, comparisons: lpsComparisons } = tableLPS(pattern);
    const result: number[] = [];
    let comparisons = lpsComparisons;
    let i = 0;
    let j = 0;
    while (i < text.length) {
        comparisons++;
        if (text[i] === pattern[j]) {
            i++;
            j++;
        }
        if (j === pattern.length) {
        result.push(i - j);
        j = lps[j - 1];
        } 
        else if (i < text.length && text[i] !== pattern[j]) {
            comparisons++;
            if (j !== 0) {
                j = lps[j - 1];
            } 
            else {
                i++;
            }
        }
    }
    return { indexes: result, comparisons };
}

export function searchKMP(text: string, keywords: string[]): AlgorithmResult {
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
        const result = kmpSearch(lowerText, lowerKeyword);
        totalComparisons += result.comparisons;
        for (const startIndex of result.indexes) {
            const endIndex = startIndex + cleanKeyword.length;
            matches.push({
                keyword: cleanKeyword,
                matchedText: text.slice(startIndex, endIndex),
                startIndex,
                endIndex,
                algorithm: "KMP",
                similarity: 1,
            });
        }
    }
    return {
        algorithm: "KMP",
        matches,
        stats: {
            algorithm: "KMP",
            totalMatches: matches.length,
            comparisons: totalComparisons,
            executionTimeMs: performance.now() - startTime,
        },
    };
}

export { kmpSearch, tableLPS };