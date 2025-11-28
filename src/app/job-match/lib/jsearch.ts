import axios from "axios";
import { Job, JSearchResponse, ResumeAnalysis } from "./types";

const JSEARCH_API_URL = "https://jsearch.p.rapidapi.com/search";

interface SearchOptions {
  query: string;
  location?: string;
  remote_only?: boolean;
  employment_types?: string;
  date_posted?: string;
  num_pages?: number;
}

export async function searchJobs(options: SearchOptions): Promise<Job[]> {
  const { query, location, remote_only, employment_types, date_posted, num_pages = 2 } = options;

  // Build query string with location if provided
  let searchQuery = query;
  if (location) {
    searchQuery = `${query} in ${location}`;
  }

  const params: Record<string, string> = {
    query: searchQuery,
    page: "1",
    num_pages: num_pages.toString(),
  };

  if (remote_only) {
    params.remote_jobs_only = "true";
  }

  if (employment_types) {
    params.employment_types = employment_types;
  }

  if (date_posted) {
    params.date_posted = date_posted;
  }

  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY is not set in environment variables");
  }

  console.log("\n========== JSEARCH API REQUEST ==========");
  console.log("Search Query:", searchQuery);
  console.log("Params:", JSON.stringify(params, null, 2));

  try {
    const response = await axios.get<JSearchResponse>(JSEARCH_API_URL, {
      params,
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });

    const jobs = response.data.data || [];
    console.log("\n========== JSEARCH API RESPONSE ==========");
    console.log("Jobs found:", jobs.length);
    if (jobs.length > 0) {
      console.log("First 3 jobs:", jobs.slice(0, 3).map(j => ({
        title: j.job_title,
        company: j.employer_name,
        location: j.job_city || j.job_state || j.job_country,
      })));
    }
    console.log("==========================================\n");

    return jobs;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 403) {
        throw new Error("JSearch API access denied. Please check: 1) Your RAPIDAPI_KEY is correct, 2) You've subscribed to JSearch on RapidAPI");
      }
      if (status === 429) {
        throw new Error("Rate limit exceeded. Please wait or upgrade your RapidAPI plan.");
      }
      throw new Error(`JSearch API error: ${status} - ${error.response.statusText}`);
    }
    throw error;
  }
}

export async function searchJobsForResume(resumeAnalysis: ResumeAnalysis): Promise<Job[]> {
  // Use the most relevant job title for the search
  const primaryTitle = resumeAnalysis.job_titles[0] || "software engineer";

  // Search with primary job title
  const jobs = await searchJobs({
    query: primaryTitle,
    location: resumeAnalysis.location || undefined,
    date_posted: "week", // Recent jobs only
    num_pages: 2, // Get ~20 jobs
  });

  // If we got fewer than 10 jobs, try with a secondary title
  if (jobs.length < 10 && resumeAnalysis.job_titles.length > 1) {
    const secondaryJobs = await searchJobs({
      query: resumeAnalysis.job_titles[1],
      location: resumeAnalysis.location || undefined,
      date_posted: "week",
      num_pages: 1,
    });

    // Add jobs that aren't duplicates
    const existingIds = new Set(jobs.map((j) => j.job_id));
    for (const job of secondaryJobs) {
      if (!existingIds.has(job.job_id)) {
        jobs.push(job);
      }
    }
  }

  // Limit to 20 jobs for AI scoring
  return jobs.slice(0, 20);
}
