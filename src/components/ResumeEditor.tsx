"use client";

import { useState } from "react";
import type { Resume } from "@/types";

interface Props {
  initialContent: string | null;
  updatedAt: string | null;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-CA", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function ResumeEditor({ initialContent, updatedAt }: Props) {
  const [content, setContent] = useState(initialContent ?? "");
  const [savedAt, setSavedAt] = useState<string | null>(updatedAt);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = (await res.json()) as Resume;
      setSavedAt(data.updated_at);
      showToast("Resume saved successfully", true);
    } catch {
      showToast("Failed to save resume", false);
    } finally {
      setSaving(false);
    }
  }

  function clear() {
    if (!confirm("Clear the resume content? This will remove all text.")) return;
    setContent("");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Resume Vault</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your resume is stored here permanently. Paste your latest version anytime to update it.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              toast.ok
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {toast.ok ? "✓ " : "✕ "}{toast.msg}
          </div>
        )}
      </div>

      {/* Last saved */}
      <p className="text-xs text-gray-600 mb-3">
        {savedAt ? `Last saved: ${fmtDate(savedAt)}` : "Never saved"}
      </p>

      {/* Textarea area */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your resume content here (plain text or markdown)…"
          className="w-full min-h-[500px] bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 text-sm text-gray-100 font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-colors resize-y leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>{content.length.toLocaleString()} characters</span>
          <span>·</span>
          <span>{wordCount(content).toLocaleString()} words</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clear}
            className="px-3 py-2 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 text-sm font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/20"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 010 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Saving…
              </>
            ) : (
              "Save Resume"
            )}
          </button>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-6 bg-blue-950/30 border border-blue-800/30 rounded-xl p-4">
        <p className="text-xs text-blue-400/80 leading-relaxed">
          <span className="font-semibold text-blue-400">Tip:</span> Keep this updated with your latest resume.
          The AI match analyzer and cover letter generator both read directly from this vault.
          Plain text works best — paste the full content without PDF formatting.
        </p>
      </div>
    </div>
  );
}
