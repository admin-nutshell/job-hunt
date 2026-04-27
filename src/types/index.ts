// ============================================================
// haytham-job-hunt · TypeScript Types
// All interfaces mirror the D1 schema in migrations/0001_init.sql
// ============================================================

// ------------------------------------------------------------
// Enums / Literals
// ------------------------------------------------------------

export type ApplicationStatus =
  | "Wishlist"
  | "Applied"
  | "Phone Screen"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export type WorkType = "Remote" | "Hybrid" | "Onsite";

// ------------------------------------------------------------
// 1. Application
// ------------------------------------------------------------

export interface Application {
  id: number;
  company: string;
  role_title: string;
  status: ApplicationStatus;
  date_applied: string | null;      // ISO-8601 date string
  job_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;          // e.g. "CAD", "USD"
  location: string | null;
  work_type: WorkType;
  notes: string | null;
  job_description: string | null;
  created_at: string;               // ISO-8601 datetime
  updated_at: string;
}

/** Payload for creating a new application — id and timestamps are DB-generated */
export type NewApplication = Omit<Application, "id" | "created_at" | "updated_at">;

/** Payload for updating an application — all fields optional except id */
export type UpdateApplication = Partial<NewApplication> & { id: number };

// ------------------------------------------------------------
// 2. Contact
// ------------------------------------------------------------

export interface Contact {
  id: number;
  application_id: number | null;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  linkedin_url: string | null;
  notes: string | null;
  created_at: string;
}

export type NewContact = Omit<Contact, "id" | "created_at">;
export type UpdateContact = Partial<NewContact> & { id: number };

// ------------------------------------------------------------
// 3. Task
// ------------------------------------------------------------

export interface Task {
  id: number;
  application_id: number | null;
  description: string;
  due_date: string | null;          // ISO-8601 date string
  done: boolean;                    // D1 stores as 0|1; convert on read
  created_at: string;
}

export type NewTask = Omit<Task, "id" | "created_at">;
export type UpdateTask = Partial<NewTask> & { id: number };

// ------------------------------------------------------------
// 4. Resume  (singleton — always id = 1)
// ------------------------------------------------------------

export interface Resume {
  id: 1;
  content: string;
  updated_at: string;
}

/** Only content is writable */
export type UpdateResume = Pick<Resume, "content">;

// ------------------------------------------------------------
// 5. AnswerBank
// ------------------------------------------------------------

export interface AnswerBankEntry {
  id: number;
  question: string;
  answer: string;
  application_id: number | null;    // null = generic, not tied to one job
  created_at: string;
  updated_at: string;
}

export type NewAnswerBankEntry = Omit<AnswerBankEntry, "id" | "created_at" | "updated_at">;
export type UpdateAnswerBankEntry = Partial<NewAnswerBankEntry> & { id: number };

// ------------------------------------------------------------
// 6. VoiceProfile  (singleton — always id = 1)
// ------------------------------------------------------------

export interface VoiceProfile {
  id: 1;
  tone_description: string;
  updated_at: string;
}

export type UpdateVoiceProfile = Pick<VoiceProfile, "tone_description">;

// ------------------------------------------------------------
// 7. CoverLetter
// ------------------------------------------------------------

export interface CoverLetter {
  id: number;
  application_id: number;
  content: string;
  approved: boolean;                // D1 stores as 0|1; convert on read
  created_at: string;
}

export type NewCoverLetter = Omit<CoverLetter, "id" | "created_at">;
export type UpdateCoverLetter = Partial<Pick<CoverLetter, "content" | "approved">> & { id: number };

// ------------------------------------------------------------
// Cloudflare Workers Env  (populated by wrangler bindings)
// For full typing run: npm run cf-typegen
// ------------------------------------------------------------

export interface Env {
  JOB_HUNT_DB: D1Database;
  AI: Ai;
}
