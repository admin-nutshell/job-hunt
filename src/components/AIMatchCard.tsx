"use client";

import { useState } from "react";

interface MatchResult {
  score: number;
  strengths: string[];
  gaps: string[];
  questions: string[];
}

interface Props {
  applicationId: number;
  jobDescription: string | null;
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="132" height="132" viewBox="0 0 132 132">
        {/* Track */}
        <circle cx="66" cy="66" r={radius} fill="none" stroke="#1f2937" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx="66" cy="66" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 66 66)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="66" y="66" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="26" fontWeight="700">
          {score}
        </text>
        <text x="66" y="82" dominantBaseline="middle" textAnchor="middle" fill="#6b7280" fontSize="10">
          / 100
        </text>
      </svg>
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: color + "20", color }}
      >
        {score >= 70 ? "Strong Match" : score >= 40 ? "Partial Match" : "Weak Match"}
      </span>
    </div>
  );
}

export default function AIMatchCard({ applicationId, jobDescription }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set());

  async function analyzeMatch() {
    if (!jobDescription) {
      setError("No job description on this application. Add one first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Fetch resume first
      const resumeRes = await fetch("/api/resume");
      const resume = (await resumeRes.json()) as { content?: string };
      const resumeText = resume.content ?? "";

      // Call match API
      const matchRes = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });

      if (!matchRes.ok) {
        const d = (await matchRes.json()) as { error?: string };
        throw new Error(d.error ?? "Match analysis failed");
      }

      const data = (await matchRes.json()) as MatchResult;
      setResult(data);
      // Pre-fill empty answers
      setAnswers(
        Object.fromEntries((data.questions ?? []).map((_, i) => [i, ""]))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function saveAnswer(question: string, answer: string, idx: number) {
    if (!answer.trim()) return;
    setSavingIdx(idx);
    try {
      await fetch("/api/answer-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, application_id: applicationId }),
      });
      setSavedIdx((prev) => new Set(prev).add(idx));
    } finally {
      setSavingIdx(null);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-white font-semibold text-sm mb-4">AI Match Analysis</h2>

      <button
        onClick={analyzeMatch}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 010 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Analyzing…
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analyze Match
          </>
        )}
      </button>

      {error && (
        <p className="mt-3 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 space-y-5">
          {/* Score gauge */}
          <div className="flex justify-center">
            <ScoreGauge score={result.score} />
          </div>

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Strengths</h3>
              <ul className="space-y-1.5">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5} className="w-3.5 h-3.5 mt-0.5 shrink-0">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {result.gaps?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gaps</h3>
              <ul className="space-y-1.5">
                {result.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2.5} className="w-3.5 h-3.5 mt-0.5 shrink-0">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interview questions */}
          {result.questions?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Questions to Prepare</h3>
              <div className="space-y-3">
                {result.questions.map((q, i) => (
                  <div key={i} className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-gray-300 leading-relaxed">{q}</p>
                    <textarea
                      rows={2}
                      placeholder="Your answer…"
                      value={answers[i] ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                      }
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/60 resize-none transition-colors"
                    />
                    <button
                      onClick={() => saveAnswer(q, answers[i] ?? "", i)}
                      disabled={savingIdx === i || savedIdx.has(i)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                    >
                      {savedIdx.has(i) ? "✓ Saved" : savingIdx === i ? "Saving…" : "Save Answer"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
