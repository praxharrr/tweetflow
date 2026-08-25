const TONE_INSTRUCTIONS: Record<string, string> = {
  direct: "Write in a direct, no-fluff tone.",
  casual: "Write in a casual, conversational tone, like texting a friend.",
  professional: "Write in a polished, professional tone.",
  bold: "Write in a bold, punchy, opinionated tone.",
};

export function toneInstruction(tone: string | null | undefined): string {
  return TONE_INSTRUCTIONS[tone ?? "direct"] ?? TONE_INSTRUCTIONS.direct;
}

export const TONE_OPTIONS = [
  { value: "direct", label: "Direct" },
  { value: "casual", label: "Casual" },
  { value: "professional", label: "Professional" },
  { value: "bold", label: "Bold" },
];
