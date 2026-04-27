import type { AnswerBankEntry } from "@/types";

// ── helpers ───────────────────────────────────────────────────────────────────

function row(r: Record<string, unknown>): AnswerBankEntry {
  return r as unknown as AnswerBankEntry;
}

// ── queries ───────────────────────────────────────────────────────────────────

/** Return all answers ordered newest first. */
export async function getAnswers(db: D1Database): Promise<AnswerBankEntry[]> {
  const { results } = await db
    .prepare("SELECT * FROM answer_bank ORDER BY created_at DESC")
    .all<Record<string, unknown>>();
  return results.map(row);
}

/** Return answers linked to a specific application. */
export async function getAnswersByApplication(
  db: D1Database,
  applicationId: number
): Promise<AnswerBankEntry[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM answer_bank
       WHERE application_id = ?
       ORDER BY created_at DESC`
    )
    .bind(applicationId)
    .all<Record<string, unknown>>();
  return results.map(row);
}

/** Insert a new Q&A pair and return the created row. */
export async function createAnswer(
  db: D1Database,
  question: string,
  answer: string,
  applicationId?: number
): Promise<AnswerBankEntry> {
  const { meta } = await db
    .prepare(
      `INSERT INTO answer_bank (question, answer, application_id)
       VALUES (?, ?, ?)`
    )
    .bind(question, answer, applicationId ?? null)
    .run();

  const created = await db
    .prepare("SELECT * FROM answer_bank WHERE id = ?")
    .bind(meta.last_row_id as number)
    .first<Record<string, unknown>>();

  if (!created) throw new Error("Failed to fetch newly created answer");
  return row(created);
}

/** Update the answer text and touch updated_at. */
export async function updateAnswer(
  db: D1Database,
  id: number,
  answer: string
): Promise<AnswerBankEntry | null> {
  await db
    .prepare(
      `UPDATE answer_bank
       SET answer = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(answer, id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM answer_bank WHERE id = ?")
    .bind(id)
    .first<Record<string, unknown>>();

  return updated ? row(updated) : null;
}

/** Delete an answer by id. */
export async function deleteAnswer(db: D1Database, id: number): Promise<void> {
  await db.prepare("DELETE FROM answer_bank WHERE id = ?").bind(id).run();
}
