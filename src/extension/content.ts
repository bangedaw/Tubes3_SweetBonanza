import { searchBoyerMoore } from "../algorithms/boyerMoore";
import { searchKMP } from "../algorithms/kmp"
import { searchRegex } from "../algorithms/RegexMatcher";
import { searchWeightedLevenshtein } from "../algorithms/weightedLevenshtein";
import type { AlgorithmResult, MatchResult } from "../types/match";
import keywordsRaw from "../../keywords/keywords.txt?raw";

const keywords: string[] = keywordsRaw
.split(/\r?\n/)
.map(s => s.trim())
.filter(Boolean);

// frek global
const wordFrequencies = new Map<string, number>();
const algorithmExecTimes = new Map<string, number>();
const algorithmMatchCounts = new Map<string, number>();

["Boyer-Moore", "KMP", "Regex", "Weighted-Levenshtein"].forEach(algo => {
    algorithmExecTimes.set(algo, 0);
    algorithmMatchCounts.set(algo, 0);
});

const tooltip = document.createElement("div");
tooltip.style.position = "absolute";
tooltip.style.display = "none";
tooltip.style.backgroundColor = "#333";
tooltip.style.color = "#fff";
tooltip.style.padding = "8px";
tooltip.style.borderRadius = "4px";
tooltip.style.fontSize = "12px";
tooltip.style.zIndex = "999999";
tooltip.style.pointerEvents = "none";
tooltip.style.lineHeight = "1.5";
document.body.appendChild(tooltip);

function handleMultipleAlgorithms(text: string, results: AlgorithmResult[], node: Text): number {
    let localMatchCount = 0; 
    const allMatches: (MatchResult & { algorithms: Set<string> })[] = [];

    for (const res of results) {
        const currentExecTime = algorithmExecTimes.get(res.algorithm) || 0;
        algorithmExecTimes.set(res.algorithm, currentExecTime + res.stats.executionTimeMs);
        
        const currentMatchCount = algorithmMatchCounts.get(res.algorithm) || 0;
        algorithmMatchCounts.set(res.algorithm, currentMatchCount + res.matches.length);

        for (const m of res.matches) {
            allMatches.push({ ...m, algorithms: new Set([res.algorithm]) });
        }
    }

    if (allMatches.length > 0) {
      allMatches.sort((a, b) => a.startIndex - b.startIndex);
      
      const groupedMatches: typeof allMatches = [];
      for (const m of allMatches) {
          const last = groupedMatches[groupedMatches.length - 1];
          if (last && last.startIndex === m.startIndex && last.endIndex === m.endIndex) {
              m.algorithms.forEach(algo => last.algorithms.add(algo));
          } else {
              groupedMatches.push(m);
          }
      }

      const validMatches = [];
      let lastEnd = -1;
      
      for (const m of groupedMatches) {
        if (m.startIndex >= lastEnd) {
          validMatches.push(m);
          lastEnd = m.endIndex;
        }
      }

      if (validMatches.length === 0) return 0;
      
      const fragment = document.createDocumentFragment();
      let currentIndex = 0;
      
      for (const match of validMatches) {
        const beforeText = text.slice(currentIndex, match.startIndex);
        if (beforeText) {
          fragment.appendChild(document.createTextNode(beforeText));
        }
        
        const mark = document.createElement("mark");
        mark.className = "sweetbonanza-highlighted-word";
        mark.style.backgroundColor = "red";
        mark.style.color = "white";
        mark.style.cursor = "help";

        const matchedWord = text.slice(match.startIndex, match.endIndex);
        mark.textContent = matchedWord;

        const normalWord = matchedWord.toLowerCase();
        wordFrequencies.set(normalWord, (wordFrequencies.get(normalWord) || 0) + 1);

        mark.dataset.keyword = matchedWord;
        mark.dataset.algorithms = Array.from(match.algorithms).join(", ");

        fragment.appendChild(mark);
        
        currentIndex = match.endIndex;
        localMatchCount++; 
      }
      
      const afterText = text.slice(currentIndex);
      if (afterText) {
        fragment.appendChild(document.createTextNode(afterText));
      }

      node.parentNode?.replaceChild(fragment, node);
    }
    return localMatchCount;
}

function highlightMatches() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentNode as HTMLElement;
        if (parent && ["SCRIPT", "STYLE", "NOSCRIPT", "MARK"].includes(parent.nodeName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const nodesToProcess: Text[] = [];
  let currentNode = walker.nextNode();
  while (currentNode) {
    nodesToProcess.push(currentNode as Text);
    currentNode = walker.nextNode();
  }
  
  let totalUniqueMatches = 0;
  
  for (const node of nodesToProcess) {
    const text = node.nodeValue || "";
    const rBM = searchBoyerMoore(text, keywords);
    const rKMP = searchKMP(text, keywords);
    const rRegex = searchRegex(text);
    const rWL = searchWeightedLevenshtein(text, keywords);

    const results = [rBM, rKMP, rRegex, rWL];
    totalUniqueMatches += handleMultipleAlgorithms(text, results, node);
  }
  
  const allMarks = document.querySelectorAll('.sweetbonanza-highlighted-word');
  
  allMarks.forEach((markEl) => {
      const el = markEl as HTMLElement;
      
      el.addEventListener("mouseenter", (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const matchedKeyword = el.dataset.keyword || "";
          const normalWord = matchedKeyword.toLowerCase();
          const freq = wordFrequencies.get(normalWord) || 0;
          const algorithmsUsed = el.dataset.algorithms || "";
          
          let execTimeStr = "";
          algorithmsUsed.split(", ").forEach(algo => {
              if(!algo) return;
              const timeMs = algorithmExecTimes.get(algo) || 0;
              execTimeStr += `- ${algo}: ${timeMs.toFixed(3)} ms<br>`;
          });

          tooltip.innerHTML = `
            <strong>Keyword:</strong> ${matchedKeyword}<br>
            <strong>Algoritma:</strong> ${algorithmsUsed}<br>
            <strong>Frekuensi:</strong> ${freq} kali<br>
            <strong>Total Waktu Eksekusi:</strong><br>
            ${execTimeStr}
          `;
          
          tooltip.style.display = "block";
          tooltip.style.left = `${mouseEvent.pageX + 15}px`;
          tooltip.style.top = `${mouseEvent.pageY + 15}px`;
      });

      el.addEventListener("mousemove", (e: Event) => {
        const mouseEvent = e as MouseEvent;
        tooltip.style.left = `${mouseEvent.pageX + 15}px`;
        tooltip.style.top = `${mouseEvent.pageY + 15}px`;
      });

      el.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
      });
  });

  console.log(`Pencarian selesai. Ditemukan ${totalUniqueMatches} kata unik.`);
  console.log("Statistik Waktu per algoritma:", Object.fromEntries(algorithmExecTimes));
}
highlightMatches();

