export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function buttonClass(variant: ButtonVariant = "secondary", extra = ""): string {
  const base =
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-button font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100";
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-b from-[#3aa8f2] to-[#1a8cd8] px-4 py-2 text-white shadow-[0_4px_16px_-4px_rgba(29,155,240,0.5)] ring-1 ring-inset ring-white/20 hover:from-[#4db5f5] hover:to-[#1d9bf0] hover:shadow-[0_6px_20px_-4px_rgba(29,155,240,0.65)]",
    secondary:
      "border border-mono-hairline-strong px-4 py-2 font-medium text-mono-ink hover:bg-white/[0.06]",
    ghost: "px-2 py-1 font-medium text-mono-ink-subtle hover:text-mono-ink",
    danger:
      "border border-mono-hairline-strong px-4 py-2 font-medium text-mono-ink-subtle hover:border-red-900/50 hover:bg-red-950/30 hover:text-red-400",
  };
  return `${base} ${variants[variant]} ${extra}`;
}