"use client";

import { useState } from "react";
import AddApplicationModal from "./AddApplicationModal";

export default function KanbanHeader() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Applications</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track every opportunity</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Application
        </button>
      </div>

      {showModal && <AddApplicationModal onClose={() => setShowModal(false)} />}
    </>
  );
}
