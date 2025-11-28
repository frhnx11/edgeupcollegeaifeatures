// Resume analysis types
export interface ResumeAnalysis {
  job_titles: string[];
  skills: string[];
  experience_years: number;
  location: string | null;
  summary: string;
}

// JSearch job types
export interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  employer_website: string | null;
  job_employment_type: string;
  job_apply_link: string;
  job_description: string;
  job_city: string | null;
  job_state: string | null;
  job_country: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_posted_at_datetime_utc: string;
  job_is_remote: boolean;
  job_required_skills: string[] | null;
  job_required_experience: {
    no_experience_required: boolean;
    required_experience_in_months: number | null;
  } | null;
}

export interface JSearchResponse {
  status: string;
  request_id: string;
  data: Job[];
}

// Matched job with score
export interface MatchedJob extends Job {
  match_score: number;
  match_reasons: string[];
}

// API request/response types
export interface AnalyzeRequest {
  resumeText: string;
}

export interface SearchRequest {
  resumeAnalysis: ResumeAnalysis;
}

export interface MatchRequest {
  resumeAnalysis: ResumeAnalysis;
  jobs: Job[];
}

export interface MatchResponse {
  jobs: MatchedJob[];
}
