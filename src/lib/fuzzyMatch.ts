export function fuzzyScore(query: string, text: string): number | null {
  if (!query.trim()) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  const idx = t.indexOf(q);
  if (idx !== -1) return 1000 - idx;

  let qi = 0;
  let score = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
      score++;
    }
  }
  return qi === q.length ? score : null;
}
