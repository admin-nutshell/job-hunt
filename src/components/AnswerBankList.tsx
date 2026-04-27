"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { AnswerBankEntry } from "@/types";

const inp =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-colors";
const lbl = "block text-xs font-medium text-gray-400 mb-1";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ── Editable answer row ───────────────────────────────────────────────────────
function AnswerCard({
  entry,
  onDelete,
  onUpdate,
}: {
  entry: AnswerBankEntry;
  onDelete: (id: number) => void;
  onUpdate: (id: number, answer: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.answer);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/answer-bank/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: draft }),
      });
      onUpdate(entry.id, draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!confirm("Delete this answer? This cannot be undone.")) return;
    await fetch(`/api/answer-bank/${entry.id}`, { method: "DELETE" });
    onDelete(entry.id);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2 group">
      {/* Question */}
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Question</p>
      <p className="text-gray-300 text-sm leading-relaxed">{entry.question}</p>

      {/* Answer */}
      <div className="pt-1">
        {editing ? (
          <textarea
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={`${inp} resize-y mt-1`}
            autoFocus
          />
        ) : (
          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{entry.answer}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {entry.application_id && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20">
              Linked to App #{entry.application_id}
            </span>
          )}
          <span className="text-xs text-gray-600">{fmtDate(entry.created_at)}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setDraft(entry.answer); }} className="px-2.5 py-1 text-xs text-gray-400 hover:text-gray-200 rounded transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded transition-colors disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="px-2.5 py-1 text-xs text-gray-400 hover:text-gray-200 bg-gray-800 hover:bg-gray-700 rounded transition-colors">
                Edit
              </button>
              <button onClick={del} className="px-2.5 py-1 text-xs text-red-500 hover:text-red-400 bg-red-900/20 hover:bg-red-900/40 rounded transition-colors">
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add form ─────────────────────────────────────────────────────────────────
function AddAnswerForm({ onAdd }: { onAdd: (entry: AnswerBankEntry) => void }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/answer-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: form.question, answer: form.answer }),
      });
      if (res.ok) {
        const created = (await res.json()) as AnswerBankEntry;
        onAdd(created);
        setForm({ question: "", answer: "" });
        setShow(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
        Add Answer
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-gray-900 border border-blue-700/40 rounded-xl p-5 space-y-3">
      <h3 className="text-white font-semibold text-sm">New Q&amp;A Entry</h3>
      <div>
        <label className={lbl}>Question *</label>
        <input required value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} placeholder="e.g. How have you managed large budgets?" className={inp} />
      </div>
      <div>
        <label className={lbl}>Answer *</label>
        <textarea required rows={4} value={form.answer} onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))} placeholder="Your answer…" className={`${inp} resize-y`} />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setShow(false)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors">
          {saving ? "Saving…" : "Save Answer"}
        </button>
      </div>
    </form>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
interface Props {
  initialAnswers: AnswerBankEntry[];
}

export default function AnswerBankList({ initialAnswers }: Props) {
  const [answers, setAnswers] = useState<AnswerBankEntry[]>(initialAnswers);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return answers;
    return answers.filter(
      (a) =>
        a.question.toLowerCase().includes(q) ||
        a.answer.toLowerCase().includes(q)
    );
  }, [answers, query]);

  function handleAdd(entry: AnswerBankEntry) {
    setAnswers((prev) => [entry, ...prev]);
  }

  function handleDelete(id: number) {
    setAnswers((prev) => prev.filter((a) => a.id !== id));
  }

  function handleUpdate(id: number, answer: string) {
    setAnswers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, answer, updated_at: new Date().toISOString() } : a))
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Answer Bank</h1>
        <p className="text-gray-500 text-sm mt-1">
          Answers you&apos;ve given about your experience. Built automatically during AI match
          analysis. Used in every cover letter.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions or answers…"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-colors"
          />
        </div>
        <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-800 text-gray-400">
          {answers.length} answer{answers.length !== 1 ? "s" : ""}
        </span>
        <AddAnswerForm onAdd={handleAdd} />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          {query ? (
            <p className="text-gray-600 text-sm">No answers match &ldquo;{query}&rdquo;</p>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-gray-600">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">No answers yet.</p>
              <p className="text-gray-600 text-xs mt-1 max-w-xs mx-auto">
                Run an AI match analysis on any job to start building your answer bank.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <AnswerCard
              key={entry.id}
              entry={entry}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
