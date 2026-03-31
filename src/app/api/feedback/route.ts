import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const body = await req.json();
  const { cvText, predictedRole } = body;

  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  try {
    const response = await openai.chat.completions.create({
      model: "arcee-ai/trinity-mini:free",
      messages: [
        {
          role: "system",
          content: `
You are a **professional CV reviewer and career advisor**.
You analyze resumes for alignment with specific job roles and provide clear, structured, and example-driven feedback.

Return your output **strictly as a valid JSON object** in this format:

{
  "overall_assessment": [
    "First short assessment point",
    "Second short assessment point"
  ],
  "detailed_improvements": [
    {
      "area": "Streamline and Structure the CV",
      "current": "The CV spans four pages, which is lengthy for a student.",
      "improved": "Condense to two pages, focusing on the most relevant experiences."
    },
    {
      "area": "Enhance Technical Skills Presentation",
      "current": "Technical skills section is text-heavy and includes outdated skills.",
      "improved": "Use clear bullet points, categorize (languages, frameworks), and remove outdated skills."
    }
  ],
  "skill_evaluation": {
    "technical_skills": 8,
    "experience_relevance": 7,
    "presentation_clarity": 6,
    "overall_readiness": 7
  },
  "summary_of_readiness": {
    "level": "Moderate improvement needed",
    "explanation": "The CV is a strong fit for a React Developer role but needs clarity and structure improvements."
  }
}

Rules:
- Always return valid JSON only.
- Use concise, professional wording.
- Never include markdown, explanations, or extra text outside the JSON.
          `,
        },
        {
          role: "user",
          content: `
Analyze this CV for a **${predictedRole}** position.

CV content:
${JSON.stringify(cvText)}

Follow the JSON format strictly.
          `,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content || "";
    console.log("AI raw output:", raw);

    let parsed;
    try {
      // Direct parse of the raw content, no double stringification needed
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Invalid JSON from model:", err);
      // Clean the raw content before parsing as fallback
      try {
        const cleanedJson = raw
          .replace(/^```json\s*/, '')  // Remove starting ```json
          .replace(/```$/, '')         // Remove ending ```
          .trim();
        parsed = JSON.parse(cleanedJson);
      } catch (parseErr) {
        console.error("Failed to parse cleaned JSON:", parseErr);
        return NextResponse.json({
          error: "Invalid JSON response from AI model"
        }, { status: 422 });
      }
    }

    // Validate the parsed data structure
    if (!parsed?.overall_assessment || !parsed?.detailed_improvements ||
        !parsed?.skill_evaluation || !parsed?.summary_of_readiness) {
      return NextResponse.json({
        error: "Invalid feedback data structure"
      }, { status: 422 });
    }

    return NextResponse.json({ feedback: parsed });
  } catch (error: any) {
    console.error("Error analyzing CV:", error);
    return NextResponse.json(
      {
        error: error.message,
        details: error.response?.data || error.toString(),
      },
      { status: 500 }
    );
  }
}
