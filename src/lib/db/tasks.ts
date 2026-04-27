import type { Task, NewTask, UpdateTask } from "@/types";

// ── helpers ───────────────────────────────────────────────────────────────────

/** D1 stores done as 0|1 INTEGER — coerce to boolean. */
function row(r: Record<string, unknown>): Task {
  return { ...r, done: r.done === 1 || r.done === true } as unknown as Task;
}

// ── queries ───────────────────────────────────────────────────────────────────

/** Return all tasks for a given application, ordered by due_date then created_at. */
export async function getTasksByApplication(
  db: D1Database,
  applicationId: number
): Promise<Task[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM tasks
       WHERE application_id = ?
       ORDER BY due_date ASC, created_at ASC`
    )
    .bind(applicationId)
    .all<Record<string, unknown>>();
  return results.map(row);
}

/** Insert a new task and return the created row. */
export async function createTask(
  db: D1Database,
  data: NewTask
): Promise<Task> {
  const { meta } = await db
    .prepare(
      `INSERT INTO tasks (application_id, description, due_date, done)
       VALUES (?, ?, ?, ?)`
    )
    .bind(
      data.application_id ?? null,
      data.description,
      data.due_date ?? null,
      data.done ? 1 : 0
    )
    .run();

  const created = await db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .bind(meta.last_row_id as number)
    .first<Record<string, unknown>>();

  if (!created) throw new Error("Failed to fetch newly created task");
  return row(created);
}

/** Partial update — coerces `done` boolean to 0|1 before writing. */
export async function updateTask(
  db: D1Database,
  id: number,
  data: Partial<UpdateTask>
): Promise<Task | null> {
  const rawFields = Object.keys(data).filter((k) => k !== "id");
  if (rawFields.length === 0) {
    const existing = await db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .bind(id)
      .first<Record<string, unknown>>();
    return existing ? row(existing) : null;
  }

  // Coerce boolean → integer for SQLite
  const normalized = { ...data } as Record<string, unknown>;
  if ("done" in normalized) {
    normalized.done = normalized.done ? 1 : 0;
  }

  const setClauses = rawFields.map((f) => `${f} = ?`).join(", ");
  const values = rawFields.map((f) => normalized[f]);

  await db
    .prepare(`UPDATE tasks SET ${setClauses} WHERE id = ?`)
    .bind(...values, id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .bind(id)
    .first<Record<string, unknown>>();

  return updated ? row(updated) : null;
}

/** Delete a task by id. */
export async function deleteTask(db: D1Database, id: number): Promise<void> {
  await db.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
}
