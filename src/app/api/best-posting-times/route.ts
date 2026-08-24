import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { niche, timezone } = await req.json();

  if (!niche || typeof niche !== "string") {
    return NextResponse.json({ error: "Niche is required" }, { status: 400 });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are a social media strategist. Based on established audience behavior research for the given niche, suggest the best posting windows for X/Twitter. Respond ONLY with a JSON array of 4 objects, each with keys: window (day/time range in the given timezone), audience (who's typically online then), reason (one sentence on why this window works for this niche). No markdown, no extra text, just the JSON array.",
        },
        {
          role: "user",
          content: `Niche: ${niche}\nTimezone: ${timezone}`,
        },
      ],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    const windows = JSON.parse(match ? match[0] : raw);

    return NextResponse.json({ windows });
  } catch (err) {
    console.error("Best posting times error:", err);
    return NextResponse.json(
      { windows: [], error: "Couldn't generate recommendations — try again." },
      { status: 200 }
    );
  }
}