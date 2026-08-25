import { Fragment } from "react";

const ENTITY_PATTERN = /(https?:\/\/\S+)|(#\w+)|(@\w+)/g;

export function highlightEntities(text: string) {
  const parts = text.split(ENTITY_PATTERN).filter((part) => part !== undefined);

  return parts.map((part, i) => {
    if (!part) return null;
    const isEntity =
      part.startsWith("http") || part.startsWith("#") || part.startsWith("@");
    return isEntity ? (
      <span key={i} className="font-medium text-mono-ink">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    );
  });
}
