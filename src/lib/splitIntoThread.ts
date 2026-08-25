export function splitIntoThread(text: string, maxLen = 280): string[] {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return [];

  const sentences = clean.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) ?? [clean];
  const chunks: string[] = [];
  let current = "";

  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;

    if (sentence.length > maxLen) {
      const words = sentence.split(" ");
      let piece = "";
      for (const word of words) {
        const candidate = piece ? `${piece} ${word}` : word;
        if (candidate.length > maxLen) {
          if (piece) chunks.push(piece);
          piece = word;
        } else {
          piece = candidate;
        }
      }
      if (piece) {
        if (current) {
          chunks.push(current);
          current = "";
        }
        chunks.push(piece);
      }
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxLen) {
      if (current) chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);

  return chunks;
}
