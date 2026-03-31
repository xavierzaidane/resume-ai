import OpenAI from "openai";
import { NextResponse } from "next/server";

const llmClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(request: Request) {
  try {
    const cvText = await request.json();

    const completion = await llmClient.chat.completions.create({
      model: "arcee-ai/trinity-mini:free",
      messages: [
        {
          role: "system",
          content: `
You are a professional career matching expert who analyzes CVs to find the *most suitable job roles* based on actual experience and primary skill set.

Guidelines:
1. Focus on the candidate’s **core expertise and work history**, not just keyword mentions.
2. Ignore unrelated or minor mentions (e.g., "AI" mentioned once in a project description doesn't make them an AI Engineer).
3. Prioritize **main technical stack, daily tasks, and repeated skills**.
4. Base your results on what the person is clearly *experienced in*, not what they briefly studied or mentioned.
5. Return ONLY the top three most suitable job titles in JSON array format.

Output format (strictly):
["Job 1", "Job 2", "Job 3"]
`,
        },
        {
          role: "user",
          content: `Analyze this CV and return the top 3 most relevant job titles based on their actual work and technical background:\n\n${JSON.stringify(
            cvText
          )}`,
        },
      ],
    });

    const extractedData = completion.choices[0].message.content;
    console.log("LLM extracted jobs:", extractedData);

    let jobs: string[] = [];
    try {
      jobs = JSON.parse(extractedData || "[]");

      if (!Array.isArray(jobs)) jobs = [];
    } catch (e) {
      console.error("Failed to parse jobs, using empty array");
      jobs = [];
    }

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("Extraction Error:", error);
    return NextResponse.json(
      { error: error.message, jobs: [] },
      { status: 500 }
    );
  }
}
