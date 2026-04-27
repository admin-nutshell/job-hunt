import type { Application, NewApplication, UpdateApplication } from "@/types";

// ── helpers ──────────────────────────────────────────────────────────────────

/** D1 returns plain objects; no boolean coercion needed for applications. */
function row(r: Record<string, unknown>): Application {
  return r as unknown as Application;
}

// ── queries ───────────────────────────────────────────────────────────────────

/** Return all applications ordered newest first. */
export async function getApplications(db: D1Database): Promise<Application[]> {
  const { results } = await db
    .prepare("SELECT * FROM applications ORDER BY created_at DESC")
    .all<Record<string, unknown>>();
  return results.map(row);
}

/** Return a single application by id, or null if not found. */
export async function getApplication(
  db: D1Database,
  id: number
): Promise<Application | null> {
  const result = await db
    .prepare("SELECT * FROM applications WHERE id = ?")
    .bind(id)
    .first<Record<string, unknown>>();
  return result ? row(result) : null;
}

/** Insert a new application and return the created row. */
export async function createApplication(
  db: D1Database,
  data: NewApplication
): Promise<Application> {
  const { meta } = await db
    .prepare(
      `INSERT INTO applications
         (company, role_title, status, date_applied, job_url,
          salary_min, salary_max, salary_currency,
          location, work_type, notes, job_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      data.company,
      data.role_title,
      data.status ?? "Wishlist",
      data.date_applied ?? null,
      data.job_url ?? null,
      data.salary_min ?? null,
      data.salary_max ?? null,
      data.salary_currency ?? "CAD",
      data.location ?? null,
      data.work_type ?? "Remote",
      data.notes ?? null,
      data.job_description ?? null
    )
    .run();

  const created = await getApplication(db, meta.last_row_id as number);
  if (!created) throw new Error("Failed to fetch newly created application");
  return created;
}

/** Partial update — only provided fields are written. Touches updated_at. */
export async function updateApplication(
  db: D1Database,
  id: number,
  data: Partial<UpdateApplication>
): Promise<Application | null> {
  const fields = Object.keys(data).filter((k) => k !== "id");
  if (fields.length === 0) return getApplication(db, id);

  const setClauses = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => (data as Record<string, unknown>)[f]);

  await db
    .prepare(
      `UPDATE applications SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    )
    .bind(...values, id)
    .run();

  return getApplication(db, id);
}

/** Delete an application by id. */
export async function deleteApplication(
  db: D1Database,
  id: number
): Promise<void> {
  await db
    .prepare("DELETE FROM applications WHERE id = ?")
    .bind(id)
    .run();
}
