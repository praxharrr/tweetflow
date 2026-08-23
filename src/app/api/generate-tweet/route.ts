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
          "You write sharp, engaging tweets under 280 characters. No hashtags unless asked. No quotation marks around the output. Just the tweet text.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
  });

  const tweet = completion.choices[0]?.message?.content ?? "";

  return NextResponse.json({ tweet });
}