import { NextRequest, NextResponse } from "next/server";
import { scoreJobs } from "../../lib/openai";
import { ResumeAnalysis, Job } from "../../lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeAnalysis, jobs } = body as {
      resumeAnalysis: ResumeAnalysis;
      jobs: Job[];
    };

    if (!resumeAnalysis || !jobs?.length) {
      return NextResponse.json(
        { error: "Resume analysis and jobs are required" },
        { status: 400 }
      );
    }

    // Score and rank jobs using AI
    const matchedJobs = await scoreJobs(resumeAnalysis, jobs);

    return NextResponse.json({
      success: true,
      jobs: matchedJobs,
    });
  } catch (error) {
    console.error("Error matching jobs:", error);
    return NextResponse.json(
      { error: "Failed to match jobs. Please try again." },
      { status: 500 }
    );
  }
}
