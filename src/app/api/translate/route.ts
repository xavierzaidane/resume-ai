import OpenAI from "openai";
import { NextResponse } from "next/server";

const llmClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(request: Request) {
  try {
    const text = await request.json();

    const completion = await llmClient.chat.completions.create({
      model: "arcee-ai/trinity-mini:free",
      messages: [
        {
          role: "system",
          content: `
You are a translation assistant.
Translate any given text into natural, fluent English.
Return ONLY the translated text — no explanations, no notes, no formatting.
`,
        },
        {
          role: "user",
          content: `${JSON.stringify(text)}`,
        },
      ],
    });

    const extractedData = completion.choices[0].message.content;
    console.log("LLM extracted jobs:", extractedData);

    return NextResponse.json({ profile_text: extractedData });
  } catch (error: any) {
    console.error("Extraction Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
