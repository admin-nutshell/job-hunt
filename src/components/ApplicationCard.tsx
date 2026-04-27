import Link from "next/link";
import type { Application } from "@/types";

interface Props {
  application: Application;
}

const workTypeBadge: Record<string, string> = {
  Remote: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  Hybrid: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
  Onsite: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSalary(min: number | null, max: number | null, currency: string): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} ${currency}`;
  if (min) return `From ${fmt(min)} ${currency}`;
  return `Up to ${fmt(max!)} ${currency}`;
}

export default function ApplicationCard({ application }: Props) {
  const salary = formatSalary(
    application.salary_min,
    application.salary_max,
    application.salary_currency
  );

  return (
    <article className="app-card bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm leading-snug truncate">
            {application.company}
          </h3>
          <p className="text-gray-400 text-xs mt-0.5 truncate">{application.role_title}</p>
        </div>
        <span
          className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            workTypeBadge[application.work_type] ?? workTypeBadge.Remote
          }`}
        >
          {application.work_type}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1">
        {application.location && (
          <p className="text-gray-500 text-xs flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5 shrink-0">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {application.location}
          </p>
        )}
        <p className="text-gray-600 text-xs flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5 shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {application.date_applied
            ? formatDate(application.date_applied)
            : "Not applied yet"}
        </p>
        {salary && (
          <p className="text-gray-400 text-xs font-medium">{salary}</p>
        )}
      </div>

      {/* Footer */}
      <div className="pt-1 border-t border-gray-800/60">
        <Link
          href={`/applications/${application.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          View details
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
