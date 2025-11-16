import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { question, jd, resumeText, generatedResume } = await req.json();

    const prompt = `
You are HirePath AI, a friendly job search assistant.

User's question:
${question}

Context:
- Current resume (may be rough):
${resumeText}

- Tailored resume (if available):
${generatedResume}

- Job description:
${jd}

Answer in max 6 short lines. Be specific and practical. 
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You help users improve resumes, interview prep, and job search.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const output =
      completion.choices[0]?.message?.content?.toString().trim() ?? "";

    return NextResponse.json({ answer: output });
  } catch (err) {
    console.error("chat error", err);
    return NextResponse.json(
      { error: "Failed to answer" },
      { status: 500 }
    );
  }
}
