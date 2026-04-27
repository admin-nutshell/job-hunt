import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const { resume_text, job_description } = await request.json() as {
      resume_text: string;
      job_description: string;
    };

    if (!resume_text || !job_description) {
      return NextResponse.json(
        { error: "Resume and job description are required." },
        { status: 400 }
      );
    }

    const prompt = `You are a job match analyzer. Analyze this resume against the job description and return ONLY valid JSON with no explanation or markdown.

Resume:
${resume_text.substring(0, 3000)}

Job Description:
${job_description.substring(0, 2000)}

Return this exact JSON structure:
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2"],
  "questions": ["question about experience gap 1", "question 2"]
}`;

    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a job match analyzer. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1024,
    });

    const text = (response as any).response || "";
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        score: 0,
        strengths: [],
        gaps: ["Could not analyze - please try again"],
        questions: []
      });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
