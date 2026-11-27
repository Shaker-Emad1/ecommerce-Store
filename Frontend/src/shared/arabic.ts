// Arabic/English text normalisation and light typo tolerance for search.
const DIACRITICS = /[\u064B-\u065F\u0670\u0640]/g;

export function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(DIACRITICS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lev(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Score a haystack against a query. 0 = no match; higher is better. */
export function matchScore(haystack: string, query: string): number {
  const h = normalize(haystack);
  const q = normalize(query);
  if (!q) return 1;
  if (h === q) return 100;
  if (h.startsWith(q)) return 80;
  if (h.includes(q)) return 60;
  const hw = h.split(" ");
  let total = 0;
  for (const qw of q.split(" ")) {
    let best = 0;
    for (const w of hw) {
      if (w.includes(qw)) best = Math.max(best, 20);
      else if (qw.length >= 3) {
        const tol = qw.length >= 6 ? 2 : 1;
        const d = lev(qw, w.slice(0, qw.length + 1), tol);
        if (d <= tol) best = Math.max(best, 12 - d * 3);
      }
    }
    if (best === 0) return 0;
    total += best;
  }
  return total;
}
