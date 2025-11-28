"use client";

import { MatchedJob } from "../lib/types";

interface JobCardProps {
  job: MatchedJob;
  index: number;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "from-emerald-400 to-emerald-500";
  if (score >= 60) return "from-blue-400 to-blue-500";
  if (score >= 40) return "from-amber-400 to-amber-500";
  return "from-slate-400 to-slate-500";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (score >= 60) return "bg-blue-50 text-blue-700 border-blue-100";
  if (score >= 40) return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-slate-50 text-slate-600 border-slate-100";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Low";
}

function formatSalary(job: MatchedJob): string | null {
  if (!job.job_min_salary && !job.job_max_salary) return null;

  const currency = job.job_salary_currency || "USD";

  const formatNum = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  if (job.job_min_salary && job.job_max_salary) {
    return `${currency} ${formatNum(job.job_min_salary)} - ${formatNum(job.job_max_salary)}`;
  }

  const salary = job.job_min_salary || job.job_max_salary;
  return `${currency} ${formatNum(salary!)}`;
}

export default function JobCard({ job, index }: JobCardProps) {
  const salary = formatSalary(job);

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-100 p-6
                 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200
                 transition-all duration-300 ease-out
                 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start gap-5">
        {/* Company Logo */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100
                          flex items-center justify-center overflow-hidden
                          group-hover:shadow-md transition-shadow duration-300">
            {job.employer_logo ? (
              <img
                src={job.employer_logo}
                alt={job.employer_name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <span className="text-2xl font-bold text-slate-300">
                {job.employer_name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 text-lg truncate group-hover:text-blue-600 transition-colors">
                {job.job_title}
              </h3>
              <p className="text-slate-500 truncate">{job.employer_name}</p>
            </div>

            {/* Match Score */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`
                relative w-16 h-16 rounded-2xl bg-gradient-to-br ${getScoreColor(job.match_score)}
                flex items-center justify-center text-white font-bold text-xl
                shadow-lg group-hover:scale-105 transition-transform duration-300
              `}>
                {job.match_score}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                  <span className="text-[10px]">%</span>
                </span>
              </div>
              <span className={`mt-2 text-xs font-medium px-2 py-0.5 rounded-full border ${getScoreBg(job.match_score)}`}>
                {getScoreLabel(job.match_score)}
              </span>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
            {/* Location */}
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.job_is_remote
                ? "Remote"
                : `${job.job_city || ""}${job.job_city && job.job_state ? ", " : ""}${job.job_state || job.job_country}`.trim() || "Not specified"}
            </span>

            {/* Employment Type */}
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
              {job.job_employment_type?.replace("_", " ") || "Full-time"}
            </span>

            {/* Salary */}
            {salary && (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {salary}
              </span>
            )}
          </div>

          {/* Match Reasons */}
          {job.match_reasons && job.match_reasons.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap gap-2">
                {job.match_reasons.slice(0, 3).map((reason, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply Button */}
          <div className="mt-5">
            <a
              href={job.job_apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5
                         bg-slate-900 text-white rounded-xl
                         hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25
                         transition-all duration-300 text-sm font-medium
                         group/btn"
            >
              Apply Now
              <svg
                className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
