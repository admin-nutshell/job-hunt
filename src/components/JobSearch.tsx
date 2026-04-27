"use client";

import { useState } from "react";
import type { ApplicationStatus } from "@/types";
import type { JobResult } from "@/app/api/search/jobs/route";

// ── Source badge colours ──────────────────────────────────────────────────────
const sourceStyles: Record<JobResult["source"], string> = {
  Indeed:       "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30",
  LinkedIn:     "bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30",
  "Alberta Jobs": "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
  Other:        "bg-gray-700/40 text-gray-400",
};

// ── Shared input style ────────────────────────────────────────────────────────
const inp =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-colors";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "Wishlist",
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

// ── Import Panel ──────────────────────────────────────────────────────────────
function ImportPanel({
  result,
  onClose,
}: {
  result: JobResult;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    role_title: result.title,
    company: result.company,
    location: result.location,
    job_description: result.snippet,
    status: "Wishlist" as ApplicationStatus,
    job_url: result.url,
    work_type: "Remote" as "Remote" | "Hybrid" | "Onsite",
    salary_min: null as number | null,
    salary_max: null as number | null,
    salary_currency: "CAD",
    date_applied: null as string | null,
    notes: null as string | null,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        throw new Error(d.error ?? "Failed to add application");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="mt-3 flex items-center justify-between px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5} className="w-4 h-4 shrink-0">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <p className="text-green-400 text-sm font-medium">Added to tracker!</p>
        </div>
        <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 bg-gray-800/60 border border-gray-700 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Import to Tracker
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-600 hover:text-gray-400 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1">Job Title</label>
          <input
            required
            value={form.role_title}
            onChange={(e) => setForm((p) => ({ ...p, role_title: e.target.value }))}
            className={inp}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Company</label>
          <input
            required
            value={form.company}
            onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
            className={inp}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            className={inp}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm((p) => ({ ...p, status: e.target.value as ApplicationStatus }))
            }
            className={`${inp} [color-scheme:dark]`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Work Type</label>
          <select
            value={form.work_type}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                work_type: e.target.value as "Remote" | "Hybrid" | "Onsite",
              }))
            }
            className={`${inp} [color-scheme:dark]`}
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Job Description
          </label>
          <textarea
            rows={4}
            value={form.job_description}
            onChange={(e) =>
              setForm((p) => ({ ...p, job_description: e.target.value }))
            }
            className={`${inp} resize-y`}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {saving ? "Adding…" : "Add to Tracker"}
        </button>
      </div>
    </form>
  );
}

// ── Result Card ───────────────────────────────────────────────────────────────
function ResultCard({ result }: { result: JobResult }) {
  const [importing, setImporting] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3 hover:border-gray-700 transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-white font-bold text-base leading-snug line-clamp-2">
            {result.title}
          </p>
          <p className="text-gray-300 text-sm mt-0.5">{result.company}</p>
        </div>
        <span
          className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            sourceStyles[result.source]
          }`}
        >
          {result.source}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="w-3.5 h-3.5 shrink-0"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {result.location}
      </div>

      {/* Snippet */}
      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
        {result.snippet}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-1.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
        >
          View Job ↗
        </a>
        <button
          onClick={() => setImporting((v) => !v)}
          className="flex-1 py-1.5 text-sm font-medium border border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"
        >
          {importing ? "Cancel" : "Import to Tracker"}
        </button>
      </div>

      {/* Inline import panel */}
      {importing && (
        <ImportPanel result={result} onClose={() => setImporting(false)} />
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function JobSearch() {
  const [form, setForm] = useState({
    keywords: "",
    location: "Calgary, AB",
    jobType: "",
    domain: "All",
  });
  const [results, setResults] = useState<JobResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/search/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as JobResult[] | { error: string };

      if (!res.ok || "error" in data) {
        throw new Error(
          "error" in data ? data.error : "Search failed"
        );
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6 min-h-full">
      {/* ── Search Panel ── */}
      <form
        onSubmit={search}
        className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-5 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4 md:gap-3 items-stretch md:items-end">
          {/* Keywords */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Keywords
            </label>
            <input
              required
              value={form.keywords}
              onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))}
              placeholder="Senior Project Manager"
              className={`${inp} py-2.5 md:py-2`}
            />
          </div>

          {/* Location */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Location
            </label>
            <input
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              placeholder="Calgary, AB"
              className={`${inp} py-2.5 md:py-2`}
            />
          </div>

          {/* Job Type */}
          <div className="flex-1 md:w-40">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Job Type
            </label>
            <select
              value={form.jobType}
              onChange={(e) => setForm((p) => ({ ...p, jobType: e.target.value }))}
              className={`${inp} py-2.5 md:py-2 [color-scheme:dark]`}
            >
              <option value="">Any</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          {/* Domain */}
          <div className="flex-1 md:w-44">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Domain
            </label>
            <select
              value={form.domain}
              onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))}
              className={`${inp} py-2.5 md:py-2 [color-scheme:dark]`}
            >
              <option value="All">All Industries</option>
              <option value="Construction">Construction</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Industrial">Industrial</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-3 md:py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/20 shrink-0"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeOpacity="0.25"
                  />
                  <path
                    d="M12 2a10 10 0 010 20"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Searching…
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  className="w-4 h-4"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                Search
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}
      </form>

      {/* ── Results ── */}
      {results === null && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-800/60 flex items-center justify-center mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-8 h-8 text-gray-600"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">
            Search for jobs above to see results here.
          </p>
          <p className="text-gray-700 text-sm mt-1">
            Searches across Indeed, LinkedIn, and Alberta Jobs.
          </p>
        </div>
      )}

      {results !== null && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400 font-medium">No jobs found.</p>
          <p className="text-gray-600 text-sm mt-1">
            Try different keywords or location.
          </p>
        </div>
      )}

      {results !== null && results.length > 0 && (
        <>
          <p className="text-gray-500 text-sm mb-4 px-1">
            <span className="text-white font-semibold">{results.length}</span>{" "}
            result{results.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {results.map((r, i) => (
              <ResultCard key={`${r.url}-${i}`} result={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
