export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function buttonClass(variant: ButtonVariant = "secondary", extra = ""): string {
  const base =
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-button transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-primary px-4 py-2 text-white hover:bg-primary-hover",
    secondary:
      "border border-mono-hairline-strong px-4 py-2 text-mono-ink hover:bg-white/[0.06]",
    ghost: "px-2 py-1 text-mono-ink-subtle hover:text-mono-ink",
    danger:
      "border border-mono-hairline-strong px-4 py-2 text-mono-ink-subtle hover:border-red-900/50 hover:bg-red-950/30 hover:text-red-400",
  };
  return `${base} ${variants[variant]} ${extra}`;
}