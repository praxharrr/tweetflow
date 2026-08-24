import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function fetchTrends(niche: string) {
  const completion = await groq.chat.completions.create({
    model: "groq/compound-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a social media trends researcher. Search the web for what's genuinely trending right now in the given niche. Respond ONLY with a JSON array of 5 objects, each with keys: topic (short headline), why (one sentence on why it's trending right now), angle (one sentence suggesting a tweet angle a creator could take). No markdown, no extra text, just the JSON array.",
      },
      { role: "user", content: `Niche: ${niche}` },
    ],
    temperature: 0.5,
    compound_custom: {
      tools: { enabled_tools: ["web_search"] },
    },
  });

  const raw = completion.choices[0]?.message?.content ?? "[]";
  const match = raw.match(/\[[\s\S]*\]/);
  return JSON.parse(match ? match[0] : raw);
}

export async function POST(req: NextRequest) {
  const { niche } = await req.json();

  if (!niche || typeof niche !== "string") {
    return NextResponse.json({ error: "Niche is required" }, { status: 400 });
  }

  try {
    const topics = await fetchTrends(niche);
    return NextResponse.json({ topics });
  } catch (err) {
    console.error("Trending topics error (attempt 1):", err);

    try {
      const topics = await fetchTrends(niche);
      return NextResponse.json({ topics });
    } catch (retryErr) {
      console.error("Trending topics error (attempt 2):", retryErr);
      return NextResponse.json(
        { topics: [], error: "Search is having trouble right now — try again in a moment." },
        { status: 200 }
      );
    }
  }
}