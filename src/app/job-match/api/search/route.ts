import { NextRequest, NextResponse } from "next/server";
import { searchJobsForResume } from "../../lib/jsearch";
import { ResumeAnalysis } from "../../lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeAnalysis } = body as { resumeAnalysis: ResumeAnalysis };

    if (!resumeAnalysis || !resumeAnalysis.job_titles?.length) {
      return NextResponse.json(
        { error: "Invalid resume analysis data" },
        { status: 400 }
      );
    }

    // Search for jobs based on resume analysis
    const jobs = await searchJobsForResume(resumeAnalysis);

    if (jobs.length === 0) {
      return NextResponse.json(
        { error: "No jobs found matching your profile. Try updating your resume or check back later." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      jobs,
      count: jobs.length,
    });
  } catch (error) {
    console.error("Error searching jobs:", error);
    return NextResponse.json(
      { error: "Failed to search for jobs. Please try again." },
      { status: 500 }
    );
  }
}
