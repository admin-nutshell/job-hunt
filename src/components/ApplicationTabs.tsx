"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CoverLetterModal from "./CoverLetterModal";
import type {
  Application,
  Contact,
  Task,
  CoverLetter,
  ApplicationStatus,
} from "@/types";

// ── Shared input style ────────────────────────────────────────────────────────
const inp =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-colors";
const lbl = "block text-xs font-medium text-gray-400 mb-1";

// ── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ app }: { app: Application }) {
  function fmt(n: number | null, curr: string) {
    if (!n) return null;
    return n >= 1000 ? `$${Math.round(n / 1000)}k ${curr}` : `$${n} ${curr}`;
  }
  const salMin = fmt(app.salary_min, app.salary_currency);
  const salMax = fmt(app.salary_max, app.salary_currency);
  const salary =
    salMin && salMax
      ? `${salMin} – ${salMax}`
      : salMin || salMax || "—";

  const fields = [
    { label: "Date Applied", value: app.date_applied ?? "Not applied yet" },
    { label: "Salary Range", value: salary },
    { label: "Location", value: app.location ?? "—" },
    { label: "Work Type", value: app.work_type },
    { label: "Currency", value: app.salary_currency },
  ];

  return (
    <div className="space-y-6">
      {/* Key fields grid */}
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ label, value }) => (
          <div key={label} className="bg-gray-900/60 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
            <p className="text-sm text-gray-200 font-medium">{value}</p>
          </div>
        ))}
        {app.job_url && (
          <div className="bg-gray-900/60 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-medium mb-1">Job URL</p>
            <a
              href={app.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors truncate block"
            >
              View posting ↗
            </a>
          </div>
        )}
      </div>

      {/* Notes */}
      {app.notes && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{app.notes}</p>
        </div>
      )}

      {/* Job Description */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Job Description
          {!app.job_description && (
            <span className="ml-2 text-amber-500/70 normal-case font-normal">(none — add to enable AI matching)</span>
          )}
        </h3>
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
          {app.job_description ? (
            <pre className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap font-mono">
              {app.job_description}
            </pre>
          ) : (
            <p className="text-xs text-gray-600 italic">No job description added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Contacts Tab ─────────────────────────────────────────────────────────────
function ContactsTab({
  contacts: initialContacts,
  applicationId,
}: {
  contacts: Contact[];
  applicationId: number;
}) {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", role: "", company: "", email: "", linkedin_url: "", notes: "",
  });

  const set = useCallback(
    (f: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((p) => ({ ...p, [f]: e.target.value })),
    []
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = (await res.json()) as Contact;
        setContacts((prev) => [...prev, created]);
        setForm({ name: "", role: "", company: "", email: "", linkedin_url: "", notes: "" });
        setShowForm(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {contacts.length === 0 && !showForm && (
        <p className="text-gray-600 text-sm italic">No contacts yet for this application.</p>
      )}
      {contacts.map((c) => (
        <div key={c.id} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white font-semibold text-sm">{c.name}</p>
              {(c.role || c.company) && (
                <p className="text-gray-400 text-xs">
                  {[c.role, c.company].filter(Boolean).join(" @ ")}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            {c.email && (
              <a href={`mailto:${c.email}`} className="text-xs text-blue-400 hover:text-blue-300">
                ✉ {c.email}
              </a>
            )}
            {c.linkedin_url && (
              <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300">
                LinkedIn ↗
              </a>
            )}
          </div>
          {c.notes && <p className="text-xs text-gray-500 pt-1">{c.notes}</p>}
        </div>
      ))}

      {showForm ? (
        <form onSubmit={submit} className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Name *</label><input required value={form.name} onChange={set("name")} placeholder="Jane Smith" className={inp} /></div>
            <div><label className={lbl}>Role</label><input value={form.role} onChange={set("role")} placeholder="Hiring Manager" className={inp} /></div>
            <div><label className={lbl}>Company</label><input value={form.company} onChange={set("company")} placeholder="AECOM" className={inp} /></div>
            <div><label className={lbl}>Email</label><input type="email" value={form.email} onChange={set("email")} placeholder="jane@co.com" className={inp} /></div>
            <div className="col-span-2"><label className={lbl}>LinkedIn URL</label><input type="url" value={form.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/…" className={inp} /></div>
            <div className="col-span-2"><label className={lbl}>Notes</label><textarea rows={2} value={form.notes} onChange={set("notes")} className={`${inp} resize-none`} /></div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : "Add Contact"}
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
          Add Contact
        </button>
      )}
    </div>
  );
}

// ── Tasks Tab ─────────────────────────────────────────────────────────────────
function TasksTab({
  tasks: initialTasks,
  applicationId,
}: {
  tasks: Task[];
  applicationId: number;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ description: "", due_date: "" });

  async function toggleDone(task: Task) {
    const next = !task.done;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done: next } : t))
    );
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: next }),
    });
    router.refresh();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          due_date: form.due_date || null,
          done: false,
        }),
      });
      if (res.ok) {
        const created = (await res.json()) as Task;
        setTasks((prev) => [...prev, created]);
        setForm({ description: "", due_date: "" });
        setShowForm(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 && !showForm && (
        <p className="text-gray-600 text-sm italic">No tasks yet.</p>
      )}
      {[...tasks]
        .sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
        })
        .map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 bg-gray-900/50 border rounded-lg px-3 py-2.5 transition-opacity ${t.done ? "border-gray-800/30 opacity-50" : "border-gray-800"}`}
          >
            <button
              onClick={() => toggleDone(t)}
              className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${t.done ? "bg-green-500 border-green-500" : "border-gray-600 hover:border-blue-500"}`}
            >
              {t.done && (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-2.5 h-2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${t.done ? "line-through text-gray-500" : "text-gray-200"}`}>
                {t.description}
              </p>
              {t.due_date && (
                <span className="mt-1 inline-block text-[11px] px-1.5 py-0.5 bg-gray-800 text-gray-500 rounded">
                  Due {new Date(t.due_date).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          </div>
        ))}

      {showForm ? (
        <form onSubmit={submit} className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-3">
          <div>
            <label className={lbl}>Description *</label>
            <input required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Follow up with recruiter" className={inp} />
          </div>
          <div>
            <label className={lbl}>Due Date</label>
            <input type="date" value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} className={`${inp} [color-scheme:dark]`} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : "Add Task"}
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
          Add Task
        </button>
      )}
    </div>
  );
}

// ── Cover Letters Tab ─────────────────────────────────────────────────────────
function CoverLettersTab({
  coverLetters: initial,
  applicationId,
}: {
  coverLetters: CoverLetter[];
  applicationId: number;
}) {
  const router = useRouter();
  const [letters, setLetters] = useState<CoverLetter[]>(initial);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [viewContent, setViewContent] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: applicationId }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        throw new Error(d.error ?? "Generation failed");
      }
      const { cover_letter, id } = (await res.json()) as { cover_letter: string; id: number };
      const newLetter: CoverLetter = {
        id,
        application_id: applicationId,
        content: cover_letter,
        approved: false,
        created_at: new Date().toISOString(),
      };
      setLetters((prev) => [newLetter, ...prev]);
      router.refresh();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleApproved(letter: CoverLetter) {
    const next = !letter.approved;
    setLetters((prev) =>
      prev.map((l) => (l.id === letter.id ? { ...l, approved: next } : l))
    );
    await fetch(`/api/cover-letters/${letter.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: next }),
    });
  }

  async function deleteLetter(id: number) {
    setLetters((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/cover-letters/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Generate button */}
      <button
        onClick={generate}
        disabled={generating}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600/80 hover:bg-purple-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {generating ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 010 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Generating…
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate with AI
          </>
        )}
      </button>

      {genError && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {genError}
        </p>
      )}

      {letters.length === 0 && (
        <p className="text-gray-600 text-sm italic">No cover letters yet. Generate one with AI!</p>
      )}

      {letters.map((l) => (
        <div key={l.id} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              {new Date(l.created_at).toLocaleDateString("en-CA", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </p>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                l.approved
                  ? "bg-green-500/15 text-green-400 ring-1 ring-green-500/30"
                  : "bg-gray-700/40 text-gray-500"
              }`}
            >
              {l.approved ? "Approved" : "Draft"}
            </span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
            {l.content.slice(0, 200)}…
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setViewContent(l.content)}
              className="text-xs px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md transition-colors"
            >
              View Full
            </button>
            <button
              onClick={() => toggleApproved(l)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                l.approved
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-400"
                  : "bg-green-600/20 hover:bg-green-600/30 text-green-400"
              }`}
            >
              {l.approved ? "Unapprove" : "Approve"}
            </button>
            <button
              onClick={() => deleteLetter(l.id)}
              className="text-xs px-2.5 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {viewContent && (
        <CoverLetterModal content={viewContent} onClose={() => setViewContent(null)} />
      )}
    </div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "contacts", label: "Contacts" },
  { id: "tasks", label: "Tasks" },
  { id: "cover-letters", label: "Cover Letters" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ── Main export ───────────────────────────────────────────────────────────────
interface Props {
  application: Application;
  contacts: Contact[];
  tasks: Task[];
  coverLetters: CoverLetter[];
}

export default function ApplicationTabs({
  application,
  contacts,
  tasks,
  coverLetters,
}: Props) {
  const [active, setActive] = useState<TabId>("overview");

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={[
              "px-4 py-3 text-sm font-medium transition-colors relative",
              active === tab.id
                ? "text-white"
                : "text-gray-500 hover:text-gray-300",
            ].join(" ")}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {active === "overview" && <OverviewTab app={application} />}
        {active === "contacts" && (
          <ContactsTab contacts={contacts} applicationId={application.id} />
        )}
        {active === "tasks" && (
          <TasksTab tasks={tasks} applicationId={application.id} />
        )}
        {active === "cover-letters" && (
          <CoverLettersTab
            coverLetters={coverLetters}
            applicationId={application.id}
          />
        )}
      </div>
    </div>
  );
}

// Re-export Link for use in the detail page (avoids duplicate import)
export { Link };
