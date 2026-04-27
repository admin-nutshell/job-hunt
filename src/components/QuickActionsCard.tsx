"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Application, ApplicationStatus } from "@/types";

const STATUSES: ApplicationStatus[] = [
  "Wishlist", "Applied", "Phone Screen", "Interview",
  "Offer", "Rejected", "Withdrawn",
];

const inp =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-colors";

interface Props {
  application: Application;
}

export default function QuickActionsCard({ application }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [toast, setToast] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function changeStatus(next: ApplicationStatus) {
    setStatus(next);
    await fetch(`/api/applications/${application.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setToast("Status updated");
    setTimeout(() => setToast(null), 2000);
    router.refresh();
  }

  async function deleteApp() {
    const confirmed = window.confirm(
      `Delete "${application.company} – ${application.role_title}"? This cannot be undone.`
    );
    if (!confirmed) return;
    setDeleting(true);
    await fetch(`/api/applications/${application.id}`, { method: "DELETE" });
    router.push("/");
  }

  return (
    <>
      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-white font-semibold text-sm">Quick Actions</h2>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => changeStatus(e.target.value as ApplicationStatus)}
            className={inp}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {toast && (
          <p className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
            ✓ {toast}
          </p>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-5 space-y-3">
        <h2 className="text-red-400 font-semibold text-sm">Danger Zone</h2>
        <p className="text-xs text-red-400/60">Permanently delete this application and all its contacts, tasks, and cover letters.</p>
        <button
          onClick={deleteApp}
          disabled={deleting}
          className="w-full py-2 border border-red-700 text-red-400 hover:bg-red-700/20 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete Application"}
        </button>
      </div>
    </>
  );
}
