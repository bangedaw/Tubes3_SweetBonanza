import type { AlgorithmResult, MatchResult } from "../types/match";

const WORD_WITH_NUMBER_PATTERN = /[\p{L}][\p{L}\p{M}]{2,}[0-9]{2,4}/giu;

function isSuspiciousToken(token: string): boolean {
    const letterCount = token.replace(/[^\p{L}\p{M}]/gu, "").length;
    const numberCount = token.replace(/[^0-9]/g, "").length;
    return letterCount >= 3 && numberCount >= 2;
}

export function searchRegex(text: string): AlgorithmResult {
    const startTime = performance.now();
    const matches: MatchResult[] = [];
    WORD_WITH_NUMBER_PATTERN.lastIndex = 0;
    for (const match of text.matchAll(WORD_WITH_NUMBER_PATTERN)) {
        const matchedText = match[0];
        const startIndex = match.index ?? 0;
        const endIndex = startIndex + matchedText.length;
        if (!isSuspiciousToken(matchedText)) {
            continue;
        }
        matches.push({
            keyword: matchedText,
            matchedText,
            startIndex,
            endIndex,
            algorithm: "Regex",
            similarity: 1,
        });
    }
    return {
        algorithm: "Regex",
        matches,
        stats: {
            algorithm: "Regex",
            totalMatches: matches.length,
            executionTimeMs: performance.now() - startTime,
        },
    };
}

export { WORD_WITH_NUMBER_PATTERN, isSuspiciousToken };
