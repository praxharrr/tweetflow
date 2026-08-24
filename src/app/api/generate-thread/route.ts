import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "system",
        content:
          "You write X/Twitter threads. Break the idea into 4-7 connected tweets, each under 280 characters, each building on the last. Respond ONLY with a JSON array of strings, one per tweet — no numbering, no markdown, no extra text.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
  });

  const raw = completion.choices[0]?.message?.content ?? "[]";

  let tweets: string[] = [];
  try {
    tweets = JSON.parse(raw);
  } catch {
    tweets = [raw];
  }

  return NextResponse.json({ tweets });
}