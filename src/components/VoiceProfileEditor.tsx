"use client";

import { useState } from "react";
import type { VoiceProfile } from "@/types";

interface Props {
  initialProfile: VoiceProfile | null;
}

const EXAMPLES = [
  {
    label: "Direct & Results-Driven",
    text: `I write the way I speak in a boardroom — clear, confident, and straight to the point. I lead with outcomes and numbers, not responsibilities. I never use phrases like "I am passionate about" or "I would be a great fit". I close with a direct call to action.`,
  },
  {
    label: "Collaborative & Strategic",
    text: `My tone is warm but professional. I emphasize team outcomes over individual wins. I use plain language and avoid jargon. I like to connect my experience to the company's specific challenges.`,
  },
  {
    label: "Senior & Authoritative",
    text: `I write peer-to-peer with hiring managers and executives. My language is precise and never fluffy. I reference scale, complexity, and stakeholder management naturally. I never oversell — I let the facts speak.`,
  },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-CA", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function VoiceProfileEditor({ initialProfile }: Props) {
  const [content, setContent] = useState(initialProfile?.tone_description ?? "");
  const [savedAt, setSavedAt] = useState<string | null>(initialProfile?.updated_at ?? null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function save() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/voice-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone_description: content }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = (await res.json()) as VoiceProfile;
      setSavedAt(data.updated_at);
      showToast("Voice profile saved", true);
    } catch {
      showToast("Failed to save", false);
    } finally {
      setSaving(false);
    }
  }

  function applyExample(text: string) {
    setContent(text);
    setShowExamples(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Voice Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            Describe your writing style and tone. The AI uses this every time it generates a
            cover letter for you.
          </p>
        </div>
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

      {/* Info box */}
      <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-4 mb-6">
        <h2 className="text-blue-300 font-semibold text-sm mb-1.5">What is a Voice Profile?</h2>
        <p className="text-blue-300/70 text-xs leading-relaxed">
          Your voice profile tells the AI how you naturally communicate. The more specific you are,
          the more your cover letters will sound like <em>you</em> — not a generic AI template.
          Describe your tone, what you avoid saying, and how you like to open and close professional
          documents.
        </p>
      </div>

      {/* Examples collapsible */}
      <div className="mb-5">
        <button
          onClick={() => setShowExamples((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors font-medium"
        >
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className={`w-4 h-4 transition-transform ${showExamples ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          See examples
        </button>

        {showExamples && (
          <div className="mt-3 space-y-3">
            {EXAMPLES.map((ex) => (
              <div
                key={ex.label}
                className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-2"
              >
                <p className="text-xs font-semibold text-gray-400">{ex.label}</p>
                <p className="text-xs text-gray-300 leading-relaxed italic">&ldquo;{ex.text}&rdquo;</p>
                <button
                  onClick={() => applyExample(ex.text)}
                  className="text-[11px] font-semibold px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-md transition-colors"
                >
                  Use this →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={9}
        placeholder="Describe your writing tone, what phrases you avoid, how you like to open and close letters…"
        className="w-full min-h-[200px] bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-colors resize-y leading-relaxed"
      />

      {/* Footer row */}
      <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
        <p className="text-xs text-gray-600">
          {savedAt ? `Last saved: ${fmtDate(savedAt)}` : "Never saved"}
        </p>
        <button
          onClick={save}
          disabled={saving || !content.trim()}
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
            "Save Voice Profile"
          )}
        </button>
      </div>
    </div>
  );
}
