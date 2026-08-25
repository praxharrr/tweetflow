import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function fetchOpportunities(niche: string) {
  const completion = await groq.chat.completions.create({
    model: "groq/compound-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a social media strategist. Search the web for real conversations, debates, or questions happening right now in the given niche that a creator could jump into for visibility. Respond ONLY with a JSON array of 5 objects, each with keys: opportunity (short headline of the conversation/moment), originalPost (a short quote or close paraphrase of the actual post or headline you found sparking this, in quotes), context (one sentence on why this is an opportunity right now), reply (one sentence suggesting what the creator could post to join in), engagement (a short real engagement figure like \"2.3k replies\" or \"posted 4h ago\" ONLY if you actually found one in your search results — omit the key entirely if you did not find a real figure, never invent one). No markdown, no extra text, just the JSON array.",
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
    const opportunities = await fetchOpportunities(niche);
    return NextResponse.json({ opportunities });
  } catch (err) {
    console.error("Viral opportunities error (attempt 1):", err);
    try {
      const opportunities = await fetchOpportunities(niche);
      return NextResponse.json({ opportunities });
    } catch (retryErr) {
      console.error("Viral opportunities error (attempt 2):", retryErr);
      return NextResponse.json(
        { opportunities: [], error: "Search is having trouble right now — try again in a moment." },
        { status: 200 }
      );
    }
  }
}