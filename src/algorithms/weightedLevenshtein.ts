import type { AlgorithmResult, MatchResult } from "../types/match";

const DEFAULT_SIMILARITY_THRESHOLD = 0.82;
const TOKEN_PATTERN = /[\p{L}\p{M}0-9]{3,}/giu;

const substitutionWeights = new Map<string, number>([
    ["o|0", 0.2],
    ["i|1", 0.2],
    ["l|1", 0.3],
    ["a|4", 0.3],
    ["e|3", 0.3],
    ["s|5", 0.3],
    ["a|\u03b1", 0.2],
]);

function getSubstitutionCost(charA: string, charB: string): number {
    if (charA === charB) {
        return 0;
    }
    const keyA = `${charA}|${charB}`;
    const keyB = `${charB}|${charA}`;
    return substitutionWeights.get(keyA) ?? substitutionWeights.get(keyB) ?? 1;
}

export function weightedLevenshteinDistance(source: string, target: string): number {
    const normalizedSource = source.toLowerCase();
    const normalizedTarget = target.toLowerCase();
    const rows = normalizedSource.length + 1;
    const cols = normalizedTarget.length + 1;
    const dp: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
    for (let i = 0; i < rows; i++) {
        dp[i][0] = i;
    }
    for (let j = 0; j < cols; j++) {
        dp[0][j] = j;
    }
    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            const deleteCost = dp[i - 1][j] + 1;
            const insertCost = dp[i][j - 1] + 1;
            const substituteCost =
                dp[i - 1][j - 1] +
                getSubstitutionCost(normalizedSource[i - 1], normalizedTarget[j - 1]);

            dp[i][j] = Math.min(deleteCost, insertCost, substituteCost);
        }
    }
    return dp[normalizedSource.length][normalizedTarget.length];
}

export function calculateSimilarity(source: string, target: string): number {
    const maxLength = Math.max(source.length, target.length);
    if (maxLength === 0) {
        return 1;
    }
    const distance = weightedLevenshteinDistance(source, target);
    return 1 - distance / maxLength;
}

function getCandidateTokens(text: string): Array<{ token: string; startIndex: number; endIndex: number }> {
    const tokens: Array<{ token: string; startIndex: number; endIndex: number }> = [];
    TOKEN_PATTERN.lastIndex = 0;
    for (const match of text.matchAll(TOKEN_PATTERN)) {
        const token = match[0];
        const startIndex = match.index ?? 0;
        tokens.push({
            token,
            startIndex,
            endIndex: startIndex + token.length,
        });
    }
    return tokens;
}

function isReasonableLength(token: string, keyword: string): boolean {
    const lengthDifference = Math.abs(token.length - keyword.length);
    return lengthDifference <= Math.max(2, Math.floor(keyword.length * 0.4));
}

export function searchWeightedLevenshtein(
    text: string,
    keywords: string[],
    threshold = DEFAULT_SIMILARITY_THRESHOLD
): AlgorithmResult {
    const startTime = performance.now();
    const matches: MatchResult[] = [];
    const tokens = getCandidateTokens(text);

    for (const { token, startIndex, endIndex } of tokens) {
        let bestKeyword = "";
        let bestSimilarity = 0;
        for (const keyword of keywords) {
            const cleanKeyword = keyword.trim();
            if (cleanKeyword.length === 0 || !isReasonableLength(token, cleanKeyword)) {
                continue;
            }
            const similarity = calculateSimilarity(token, cleanKeyword);

            if (similarity > bestSimilarity) {
                bestKeyword = cleanKeyword;
                bestSimilarity = similarity;
            }
        }
        if (bestSimilarity >= threshold && token.toLowerCase() !== bestKeyword.toLowerCase()) {
            matches.push({
                keyword: bestKeyword,
                matchedText: token,
                startIndex,
                endIndex,
                algorithm: "Weighted-Levenshtein",
                similarity: bestSimilarity,
            });
        }
    }

    return {
        algorithm: "Weighted-Levenshtein",
        matches,
        stats: {
            algorithm: "Weighted-Levenshtein",
            totalMatches: matches.length,
            executionTimeMs: performance.now() - startTime,
        },
    };
}

export { DEFAULT_SIMILARITY_THRESHOLD, TOKEN_PATTERN, getSubstitutionCost };
