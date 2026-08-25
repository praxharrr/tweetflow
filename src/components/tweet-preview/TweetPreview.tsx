import { MessageCircle, Repeat2, Heart, BarChart3 } from "lucide-react";
import Avatar from "./Avatar";
import { highlightEntities } from "./highlightEntities";

interface TweetPreviewProps {
  displayName: string;
  handle: string;
  content: string;
  media?: string[];
  timestampLabel?: string;
  badge?: string;
  placeholder?: string;
}

export default function TweetPreview({
  displayName,
  handle,
  content,
  media = [],
  timestampLabel = "now",
  badge,
  placeholder = "Your tweet preview will appear here as you type.",
}: TweetPreviewProps) {
  const hasContent = content.trim().length > 0;

  return (
    <div className="rounded-lg border border-mono-hairline bg-black/40 p-4">
      <div className="flex gap-3">
        <Avatar name={displayName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-body-sm">
            <div className="flex min-w-0 items-center gap-1">
              <span className="truncate font-semibold text-mono-ink">{displayName}</span>
              <span className="shrink-0 truncate text-mono-ink-faint">@{handle}</span>
              {!badge && (
                <>
                  <span className="shrink-0 text-mono-ink-faint">·</span>
                  <span className="shrink-0 text-mono-ink-faint">{timestampLabel}</span>
                </>
              )}
            </div>
            {badge && (
              <span className="ml-auto shrink-0 rounded-full border border-mono-hairline-strong px-2 py-0.5 font-mono text-[10px] text-mono-ink-subtle">
                {badge}
              </span>
            )}
          </div>

          {hasContent ? (
            <p className="mt-0.5 whitespace-pre-wrap break-words text-body-sm text-mono-ink-soft">
              {highlightEntities(content)}
            </p>
          ) : (
            <p className="mt-0.5 text-body-sm text-mono-ink-faint">{placeholder}</p>
          )}

          {media.length > 0 && (
            <div
              className={`mt-2 grid gap-1 overflow-hidden rounded-md border border-mono-hairline ${
                media.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {media.slice(0, 4).map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt="Attached media"
                  className="h-28 w-full object-cover"
                />
              ))}
            </div>
          )}

          <div className="mt-3 flex max-w-xs items-center justify-between text-mono-ink-faint">
            <span className="flex items-center gap-1.5 text-caption">
              <MessageCircle size={14} className="[stroke-width:1.25]" />0
            </span>
            <span className="flex items-center gap-1.5 text-caption">
              <Repeat2 size={14} className="[stroke-width:1.25]" />0
            </span>
            <span className="flex items-center gap-1.5 text-caption">
              <Heart size={14} className="[stroke-width:1.25]" />0
            </span>
            <span className="flex items-center gap-1.5 text-caption">
              <BarChart3 size={14} className="[stroke-width:1.25]" />0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
