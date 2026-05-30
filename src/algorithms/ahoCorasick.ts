import type { AlgorithmResult, MatchResult } from "../types/match";

class AhoCorasickNode {
    public children: Map<string, AhoCorasickNode> = new Map();
    public failureLink: AhoCorasickNode | null = null;
    public output: string[] = [];
}

class AhoCorasick {
    private root: AhoCorasickNode = new AhoCorasickNode();

    constructor(keywords: string[]) {
        this.buildTrie(keywords);
        this.buildFailureLinks();
    }

    private buildTrie(keywords: string[]) {
        for (const keyword of keywords) {
            const cleanKeyword = keyword.trim();
            if (cleanKeyword.length === 0) continue;

            let current = this.root;
            const lowerKeyword = cleanKeyword.toLowerCase();

            for (let i = 0; i < lowerKeyword.length; i++) {
                const char = lowerKeyword[i];
                if (!current.children.has(char)) {
                    current.children.set(char, new AhoCorasickNode());
                }
                current = current.children.get(char)!;
            }
            current.output.push(cleanKeyword);
        }
    }

    private buildFailureLinks() {
        const queue: AhoCorasickNode[] = [];

        for (const [_, childNode] of this.root.children) {
            childNode.failureLink = this.root;
            queue.push(childNode);
        }

        while (queue.length > 0) {
            const current = queue.shift()!;

            for (const [char, childNode] of current.children) {
                let failure = current.failureLink;

                while (failure !== null && !failure.children.has(char)) {
                    failure = failure.failureLink;
                }

                if (failure === null) {
                    childNode.failureLink = this.root;
                } else {
                    childNode.failureLink = failure.children.get(char)!;
                }

                if (childNode.failureLink.output.length > 0) {
                    childNode.output = childNode.output.concat(childNode.failureLink.output);
                }

                queue.push(childNode);
            }
        }
    }

    public search(text: string): { 
        matches: { keyword: string; startIndex: number; endIndex: number }[]; 
        comparisons: number; 
    } 
    {
        const results: { keyword: string; startIndex: number; endIndex: number }[] = [];
        let comparisons = 0;
        let current = this.root;
        const lowerText = text.toLowerCase();

        for (let i = 0; i < lowerText.length; i++) {
            const char = lowerText[i];

            while (current !== this.root && !current.children.has(char)) {
                comparisons++;
                current = current.failureLink!;
            }

            comparisons++;
            if (current.children.has(char)) {
                current = current.children.get(char)!;
            } else {
                current = this.root;
            }

            if (current.output.length > 0) {
                for (const keyword of current.output) {
                    const len = keyword.length;
                    const startIndex = i - len + 1;
                    results.push({
                        keyword,
                        startIndex,
                        endIndex: i + 1,
                    });
                }
            }
        }

        return { matches: results, comparisons };
    }
}

export function searchAhoCorasick(text: string, keywords: string[]): AlgorithmResult {
    const startTime = performance.now();
    const matches: MatchResult[] = [];
    const ac = new AhoCorasick(keywords);
    const { matches: rawMatches, comparisons } = ac.search(text);

    for (const raw of rawMatches) {
        matches.push({
            keyword: raw.keyword,
            matchedText: text.slice(raw.startIndex, raw.endIndex),
            startIndex: raw.startIndex,
            endIndex: raw.endIndex,
            algorithm: "Aho-Corasick",
            similarity: 1,
        });
    }

    return {
        algorithm: "Aho-Corasick",
        matches,
        stats: {
            algorithm: "Aho-Corasick",
            totalMatches: matches.length,
            comparisons,
            executionTimeMs: performance.now() - startTime,
        },
    };
}
