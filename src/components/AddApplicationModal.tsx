"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationStatus, WorkType } from "@/types";

const STATUSES: ApplicationStatus[] = [
  "Wishlist", "Applied", "Phone Screen", "Interview",
  "Offer", "Rejected", "Withdrawn",
];
const WORK_TYPES: WorkType[] = ["Remote", "Hybrid", "Onsite"];

interface Props {
  onClose: () => void;
}

const inputCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-colors";

const labelCls = "block text-xs font-medium text-gray-400 mb-1";

export default function AddApplicationModal({ onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    company: "",
    role_title: "",
    status: "Wishlist" as ApplicationStatus,
    location: "",
    work_type: "Remote" as WorkType,
    job_url: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "CAD",
    notes: "",
    job_description: "",
  });

  const set = useCallback(
    (field: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value })),
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        date_applied: null,
        job_url: form.job_url || null,
        location: form.location || null,
        notes: form.notes || null,
        job_description: form.job_description || null,
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to create application");
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div className="modal-enter w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h2 className="text-white font-semibold text-base">Add Application</h2>
            <p className="text-gray-500 text-xs mt-0.5">Track a new job opportunity</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-800"
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Row: Company + Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className={labelCls}>Company *</label>
              <input
                id="company"
                type="text"
                required
                value={form.company}
                onChange={set("company")}
                placeholder="e.g. AECOM"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="role_title" className={labelCls}>Role Title *</label>
              <input
                id="role_title"
                type="text"
                required
                value={form.role_title}
                onChange={set("role_title")}
                placeholder="e.g. Senior Project Manager"
                className={inputCls}
              />
            </div>
          </div>

          {/* Row: Status + Work Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className={labelCls}>Status</label>
              <select id="status" value={form.status} onChange={set("status")} className={inputCls}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="work_type" className={labelCls}>Work Type</label>
              <select id="work_type" value={form.work_type} onChange={set("work_type")} className={inputCls}>
                {WORK_TYPES.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Location + Job URL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className={labelCls}>Location</label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={set("location")}
                placeholder="e.g. Toronto, ON"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="job_url" className={labelCls}>Job URL</label>
              <input
                id="job_url"
                type="url"
                value={form.job_url}
                onChange={set("job_url")}
                placeholder="https://..."
                className={inputCls}
              />
            </div>
          </div>

          {/* Row: Salary */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="salary_min" className={labelCls}>Salary Min</label>
              <input
                id="salary_min"
                type="number"
                min={0}
                value={form.salary_min}
                onChange={set("salary_min")}
                placeholder="80000"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="salary_max" className={labelCls}>Salary Max</label>
              <input
                id="salary_max"
                type="number"
                min={0}
                value={form.salary_max}
                onChange={set("salary_max")}
                placeholder="120000"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="salary_currency" className={labelCls}>Currency</label>
              <input
                id="salary_currency"
                type="text"
                value={form.salary_currency}
                onChange={set("salary_currency")}
                placeholder="CAD"
                className={inputCls}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className={labelCls}>Notes</label>
            <textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={set("notes")}
              placeholder="Quick thoughts, referrals, context..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="job_description" className={labelCls}>
              Job Description
              <span className="ml-1 text-blue-500/70">(used for AI matching)</span>
            </label>
            <textarea
              id="job_description"
              rows={6}
              value={form.job_description}
              onChange={set("job_description")}
              placeholder="Paste the full job description here..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {loading ? "Adding…" : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
