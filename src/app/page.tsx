import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getApplications } from "@/lib/db/applications";
import ApplicationCard from "@/components/ApplicationCard";
import KanbanHeader from "@/components/KanbanHeader";
import type { Application, ApplicationStatus } from "@/types";

// Force dynamic rendering so D1 is always accessible at request time
export const dynamic = "force-dynamic";

// ── Kanban column config ─────────────────────────────────────────
const COLUMNS: {
  status: ApplicationStatus;
  label: string;
  color: string;
  dot: string;
  badge: string;
}[] = [
  {
    status: "Wishlist",
    label: "Wishlist",
    color: "border-slate-600",
    dot: "bg-slate-400",
    badge: "bg-slate-700/40 text-slate-300",
  },
  {
    status: "Applied",
    label: "Applied",
    color: "border-blue-600",
    dot: "bg-blue-400",
    badge: "bg-blue-700/40 text-blue-300",
  },
  {
    status: "Phone Screen",
    label: "Phone Screen",
    color: "border-yellow-600",
    dot: "bg-yellow-400",
    badge: "bg-yellow-700/40 text-yellow-300",
  },
  {
    status: "Interview",
    label: "Interview",
    color: "border-purple-600",
    dot: "bg-purple-400",
    badge: "bg-purple-700/40 text-purple-300",
  },
  {
    status: "Offer",
    label: "Offer 🎉",
    color: "border-green-500",
    dot: "bg-green-400",
    badge: "bg-green-700/40 text-green-300",
  },
  {
    status: "Rejected",
    label: "Rejected",
    color: "border-red-700",
    dot: "bg-red-400",
    badge: "bg-red-700/40 text-red-300",
  },
  {
    status: "Withdrawn",
    label: "Withdrawn",
    color: "border-gray-600",
    dot: "bg-gray-400",
    badge: "bg-gray-700/40 text-gray-400",
  },
];

// ── Page ────────────────────────────────────────────────────────
export default async function DashboardPage() {
  let applications: Application[] = [];

  try {
    const { env } = getCloudflareContext();
    applications = await getApplications(env.JOB_HUNT_DB);
  } catch {
    // During local `next dev` without wrangler the D1 binding won't be
    // available — gracefully show an empty board instead of crashing.
  }

  // Group by status
  const grouped = Object.fromEntries(
    COLUMNS.map((col) => [
      col.status,
      applications.filter((a) => a.status === col.status),
    ])
  ) as Record<ApplicationStatus, Application[]>;

  const total = applications.length;

  return (
    <div className="p-4 md:p-6 min-h-full">
      {/* Client island: heading + "+ Add" button + modal */}
      <KanbanHeader />

      {/* Stats strip */}
      {total > 0 && (
        <div className="flex items-center gap-6 mb-6 px-1">
          <p className="text-gray-500 text-sm">
            <span className="text-white font-semibold">{total}</span> application{total !== 1 ? "s" : ""} tracked
          </p>
          {COLUMNS.filter((c) => (grouped[c.status] ?? []).length > 0).map((c) => (
            <span key={c.status} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              {(grouped[c.status] ?? []).length} {c.label}
            </span>
          ))}
        </div>
      )}

      {/* Kanban board */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-4 overflow-x-auto pb-6">
        {COLUMNS.map((col) => {
          const cards = grouped[col.status] ?? [];
          return (
            <div
              key={col.status}
              className={`kanban-col shrink-0 w-full md:w-64 flex flex-col rounded-xl border-t-2 bg-gray-900/50 ${col.color}`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-3 border-b border-gray-800/60">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-gray-300 text-xs font-semibold">{col.label}</span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2.5 p-2.5">
                {cards.length === 0 ? (
                  <p className="text-gray-700 text-xs text-center py-6 italic">
                    No applications here yet
                  </p>
                ) : (
                  cards.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
