import { redirect } from "next/navigation";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getApplication } from "@/lib/db/applications";
import { getContactsByApplication } from "@/lib/db/contacts";
import { getTasksByApplication } from "@/lib/db/tasks";
import { getCoverLettersByApplication } from "@/lib/db/cover_letters";
import ApplicationTabs from "@/components/ApplicationTabs";
import AIMatchCard from "@/components/AIMatchCard";
import QuickActionsCard from "@/components/QuickActionsCard";
import type { ApplicationStatus } from "@/types";

export const dynamic = "force-dynamic";

// ── Status badge colours ──────────────────────────────────────────────────────
const statusStyles: Record<ApplicationStatus, string> = {
  Wishlist:      "bg-slate-700/50 text-slate-300",
  Applied:       "bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/30",
  "Phone Screen":"bg-yellow-600/20 text-yellow-300 ring-1 ring-yellow-500/30",
  Interview:     "bg-purple-600/20 text-purple-300 ring-1 ring-purple-500/30",
  Offer:         "bg-green-600/20 text-green-300 ring-1 ring-green-500/30",
  Rejected:      "bg-red-700/20 text-red-400 ring-1 ring-red-600/30",
  Withdrawn:     "bg-gray-700/40 text-gray-400",
};

const workTypeStyles: Record<string, string> = {
  Remote: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  Hybrid: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
  Onsite: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);

  // Fetch all data server-side in parallel
  let application, contacts, tasks, coverLetters;
  try {
    const { env } = getCloudflareContext();
    const db = env.JOB_HUNT_DB;
    [application, contacts, tasks, coverLetters] = await Promise.all([
      getApplication(db, numId),
      getContactsByApplication(db, numId),
      getTasksByApplication(db, numId),
      getCoverLettersByApplication(db, numId),
    ]);
  } catch {
    // If D1 unavailable (local next dev without wrangler), redirect home
    redirect("/");
  }

  if (!application) redirect("/");

  const initial = application.company.charAt(0).toUpperCase();

  return (
    <div className="p-4 md:p-6 min-h-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-300 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-400">{application.company}</span>
      </nav>

      {/* ── Application Header ── */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 mb-8 bg-gray-900 border border-gray-800 rounded-xl p-5 sm:p-6 text-center sm:text-left">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
          <span className="text-white text-2xl font-bold">{initial}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
            {application.company}
          </h1>
          <p className="text-lg text-gray-300 mt-0.5">{application.role_title}</p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                statusStyles[application.status] ?? statusStyles.Wishlist
              }`}
            >
              {application.status}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                workTypeStyles[application.work_type] ?? workTypeStyles.Remote
              }`}
            >
              {application.work_type}
            </span>
            {application.location && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {application.location}
              </span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="shrink-0 text-right hidden md:block">
          <p className="text-xs text-gray-600">Added</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(application.created_at).toLocaleDateString("en-CA", {
              month: "short", day: "numeric", year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2/3 */}
        <div className="lg:col-span-2">
          <ApplicationTabs
            application={application}
            contacts={contacts ?? []}
            tasks={tasks ?? []}
            coverLetters={coverLetters ?? []}
          />
        </div>

        {/* Right 1/3 */}
        <div className="flex flex-col gap-4">
          <AIMatchCard
            applicationId={application.id}
            jobDescription={application.job_description}
          />
          <QuickActionsCard application={application} />
        </div>
      </div>
    </div>
  );
}
