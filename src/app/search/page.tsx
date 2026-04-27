import JobSearch from "@/components/JobSearch";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Search | Job Hunt",
  description: "Search across Indeed, LinkedIn, Alberta Jobs and more.",
};

export default function SearchPage() {
  return (
    <>
      {/* Page heading — rendered server-side above the client island */}
      <div className="px-6 pt-6 pb-0">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Job Search
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Search across Indeed, LinkedIn, Alberta Jobs and more.
        </p>
      </div>

      {/* Client island */}
      <JobSearch />
    </>
  );
}
