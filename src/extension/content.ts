import { searchBoyerMoore } from "../algorithms/boyerMoore";
import keywordsRaw from "../../keywords/keywords.txt?raw";

const keywords: string[] = keywordsRaw
.split(/\r?\n/)
.map(s => s.trim())
.filter(Boolean);

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

  let matchCount = 0;
  for (const node of nodesToProcess) {
    const text = node.nodeValue || "";
    const result = searchBoyerMoore(text, keywords);

    if (result.matches && result.matches.length > 0) {
      // Urutkan match by startIndex agar tidak bentrok saat proses text 1 per 1
      const sortedMatches = result.matches.sort((a, b) => a.startIndex - b.startIndex);
      const validMatches = [];
      let lastEnd = -1;
      
      // Filter out overlapping matches jika 1 teks di deteksi 2 kali oleh pola beda
      for (const m of sortedMatches) {
        if (m.startIndex >= lastEnd) {
          validMatches.push(m);
          lastEnd = m.endIndex;
        }
      }

      if (validMatches.length === 0) continue;
      // pake doc fragment
      const fragment = document.createDocumentFragment();
      let currentIndex = 0;
      
      for (const match of validMatches) {
        const beforeText = text.slice(currentIndex, match.startIndex);
        if (beforeText) {
          fragment.appendChild(document.createTextNode(beforeText));
        }
        const mark = document.createElement("mark");
        mark.style.backgroundColor = "red";
        mark.style.color = "white";
        mark.textContent = text.slice(match.startIndex, match.endIndex);
        fragment.appendChild(mark);
        
        currentIndex = match.endIndex;
        matchCount++;
      }
      
      const afterText = text.slice(currentIndex);
      if (afterText) {
        fragment.appendChild(document.createTextNode(afterText));
      }

      node.parentNode?.replaceChild(fragment, node);
    }
  }
  
  console.log(`BoyerMoore search done. ada ${matchCount} matches.`);
}

highlightMatches();

