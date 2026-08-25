import Link from "next/link";
import { Clock3 } from "lucide-react";
import Card from "@/components/ui/Card";
import { getBestTimeToday } from "@/lib/bestTime";

export default function BestTimeCard() {
  const { window, reason } = getBestTimeToday();

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Clock3 size={14} className="[stroke-width:1.25] text-mono-ink-subtle" />
        <span className="text-eyebrow uppercase text-white/40">Best time to post today</span>
      </div>
      <p className="mt-2 text-body-sm font-medium text-mono-ink">{window}</p>
      <p className="mt-1 text-caption text-mono-ink-faint">{reason}</p>
      <Link
        href="/best-posting-times"
        className="mt-2 inline-block text-caption text-mono-ink-subtle underline decoration-mono-hairline-strong underline-offset-2 transition-colors duration-150 hover:text-mono-ink"
      >
        Get a personalized window →
      </Link>
    </Card>
  );
}
