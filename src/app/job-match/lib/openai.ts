import OpenAI from "openai";
import { ResumeAnalysis, Job, MatchedJob } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RESUME_ANALYSIS_PROMPT = `You are a resume analyzer. Extract the following information from the resume text provided.

Return a JSON object with these exact fields:
- job_titles: array of 3-5 relevant job titles this person could apply for (based on their experience)
- skills: array of technical and soft skills mentioned or implied
- experience_years: estimated total years of professional experience (number)
- location: preferred work location if mentioned, otherwise null
- summary: a 2-sentence professional summary of the candidate

Only return valid JSON, no markdown or explanation.`;

const JOB_MATCHING_PROMPT = `You are a job matching expert. Score how well each job matches the candidate's profile.

For each job, provide:
- score: 0-100 (100 = perfect match)
- reasons: array of 2-3 brief reasons for the score

Consider these factors:
1. Skill match (do the candidate's skills align with job requirements?)
2. Experience level (is the candidate's experience appropriate?)
3. Job title relevance (does it align with candidate's career path?)
4. Location compatibility (if specified)

Return a JSON array with objects containing: { job_id, score, reasons }
Only return valid JSON, no markdown or explanation.`;

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: RESUME_ANALYSIS_PROMPT },
      { role: "user", content: resumeText },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as ResumeAnalysis;
}

export async function analyzeResumeImage(imageBase64: string): Promise<ResumeAnalysis> {
  console.log("\n========== OPENAI RESUME ANALYSIS ==========");
  console.log("Sending image to GPT-4o for analysis...");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: RESUME_ANALYSIS_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Carefully read and analyze this resume image. Extract all relevant professional information including skills, experience, job titles, and qualifications.",
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64,
              detail: "high", // Use high detail for better text extraction
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2, // Lower temperature for more consistent extraction
    max_tokens: 1500,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const analysis = JSON.parse(content) as ResumeAnalysis;

  console.log("\n========== OPENAI EXTRACTED DATA ==========");
  console.log("Job Titles:", analysis.job_titles);
  console.log("Skills:", analysis.skills);
  console.log("Experience:", analysis.experience_years, "years");
  console.log("Location:", analysis.location);
  console.log("Summary:", analysis.summary);
  console.log("============================================\n");

  return analysis;
}

export async function scoreJobs(
  resumeAnalysis: ResumeAnalysis,
  jobs: Job[]
): Promise<MatchedJob[]> {
  console.log("\n========== OPENAI JOB MATCHING ==========");
  console.log("Scoring", jobs.length, "jobs against candidate profile...");

  const candidateProfile = `
Candidate Profile:
- Target roles: ${resumeAnalysis.job_titles.join(", ")}
- Skills: ${resumeAnalysis.skills.join(", ")}
- Experience: ${resumeAnalysis.experience_years} years
- Location preference: ${resumeAnalysis.location || "Not specified"}
- Summary: ${resumeAnalysis.summary}
`;

  const jobSummaries = jobs.map((job) => ({
    job_id: job.job_id,
    title: job.job_title,
    company: job.employer_name,
    description: job.job_description.slice(0, 500), // Truncate for token efficiency
    required_skills: job.job_required_skills?.join(", ") || "Not specified",
    location: job.job_is_remote
      ? "Remote"
      : `${job.job_city || ""}, ${job.job_state || ""}, ${job.job_country}`.trim(),
    experience_required: job.job_required_experience?.required_experience_in_months
      ? `${Math.round(job.job_required_experience.required_experience_in_months / 12)} years`
      : "Not specified",
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: JOB_MATCHING_PROMPT },
      {
        role: "user",
        content: `${candidateProfile}\n\nJobs to score:\n${JSON.stringify(jobSummaries, null, 2)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const scores = JSON.parse(content);
  const scoreArray = Array.isArray(scores) ? scores : scores.jobs || scores.results || [];

  // Merge scores with original job data
  const matchedJobs: MatchedJob[] = jobs.map((job) => {
    const scoreData = scoreArray.find((s: { job_id: string }) => s.job_id === job.job_id) || {
      score: 50,
      reasons: ["Unable to score"],
    };
    return {
      ...job,
      match_score: scoreData.score,
      match_reasons: scoreData.reasons,
    };
  });

  // Sort by score descending
  const sortedJobs = matchedJobs.sort((a, b) => b.match_score - a.match_score);

  console.log("\n========== JOB MATCH RESULTS ==========");
  console.log("Top 5 matches:");
  sortedJobs.slice(0, 5).forEach((job, i) => {
    console.log(`  ${i + 1}. [${job.match_score}%] ${job.job_title} @ ${job.employer_name}`);
    console.log(`     Reasons: ${job.match_reasons.join(", ")}`);
  });
  console.log("========================================\n");

  return sortedJobs;
}
