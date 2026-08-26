import { NextRequest, NextResponse } from "next/server";

interface AlgoliaHit {
  objectID: string;
  title: string;
  url: string | null;
  points: number | null;
  num_comments: number | null;
  created_at: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  const url = q
    ? `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=8`
    : "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=8";

  try {
    const res = await fetch(url, { next: { revalidate: q ? 0 : 300 } });
    const data = await res.json();

    const stories = ((data.hits ?? []) as AlgoliaHit[]).map((hit) => ({
      id: hit.objectID,
      title: hit.title,
      url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
      points: hit.points ?? 0,
      comments: hit.num_comments ?? 0,
      createdAt: hit.created_at,
    }));

    return NextResponse.json({ stories });
  } catch (err) {
    console.error("HN trends error:", err);
    return NextResponse.json({ stories: [] }, { status: 200 });
  }
}