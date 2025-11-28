"use client";

import { MatchedJob } from "../lib/types";
import JobCard from "./JobCard";

interface JobListProps {
  jobs: MatchedJob[];
}

export default function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-500 text-lg">No jobs found matching your profile.</p>
        <p className="text-slate-400 text-sm mt-2">Try uploading a different resume or check back later.</p>
      </div>
    );
  }

  const excellentMatches = jobs.filter((j) => j.match_score >= 80);
  const goodMatches = jobs.filter((j) => j.match_score >= 60 && j.match_score < 80);

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-fade-in">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Found {jobs.length} matching jobs
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Ranked by compatibility with your profile
          </p>
        </div>
        <div className="flex items-center gap-5">
          {excellentMatches.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-700">
                {excellentMatches.length} excellent
              </span>
            </div>
          )}
          {goodMatches.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                {goodMatches.length} good
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid gap-4">
        {jobs.map((job, index) => (
          <JobCard key={job.job_id} job={job} index={index} />
        ))}
      </div>

      {/* Footer note */}
      <div className="text-center pt-8 pb-4">
        <p className="text-sm text-slate-400">
          Click &quot;Apply Now&quot; to visit the job posting and submit your application
        </p>
      </div>
    </div>
  );
}
