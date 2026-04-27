import type { Contact, NewContact, UpdateContact } from "@/types";

// ── helpers ───────────────────────────────────────────────────────────────────

function row(r: Record<string, unknown>): Contact {
  return r as unknown as Contact;
}

// ── queries ───────────────────────────────────────────────────────────────────

/** Return all contacts for a given application. */
export async function getContactsByApplication(
  db: D1Database,
  applicationId: number
): Promise<Contact[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM contacts WHERE application_id = ? ORDER BY created_at ASC"
    )
    .bind(applicationId)
    .all<Record<string, unknown>>();
  return results.map(row);
}

/** Insert a new contact and return the created row. */
export async function createContact(
  db: D1Database,
  data: NewContact
): Promise<Contact> {
  const { meta } = await db
    .prepare(
      `INSERT INTO contacts
         (application_id, name, company, role, email, linkedin_url, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      data.application_id ?? null,
      data.name,
      data.company ?? null,
      data.role ?? null,
      data.email ?? null,
      data.linkedin_url ?? null,
      data.notes ?? null
    )
    .run();

  const created = await db
    .prepare("SELECT * FROM contacts WHERE id = ?")
    .bind(meta.last_row_id as number)
    .first<Record<string, unknown>>();

  if (!created) throw new Error("Failed to fetch newly created contact");
  return row(created);
}

/** Partial update for a contact. */
export async function updateContact(
  db: D1Database,
  id: number,
  data: Partial<UpdateContact>
): Promise<Contact | null> {
  const fields = Object.keys(data).filter((k) => k !== "id");
  if (fields.length === 0) {
    const existing = await db
      .prepare("SELECT * FROM contacts WHERE id = ?")
      .bind(id)
      .first<Record<string, unknown>>();
    return existing ? row(existing) : null;
  }

  const setClauses = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => (data as Record<string, unknown>)[f]);

  await db
    .prepare(`UPDATE contacts SET ${setClauses} WHERE id = ?`)
    .bind(...values, id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM contacts WHERE id = ?")
    .bind(id)
    .first<Record<string, unknown>>();

  return updated ? row(updated) : null;
}

/** Delete a contact by id. */
export async function deleteContact(
  db: D1Database,
  id: number
): Promise<void> {
  await db.prepare("DELETE FROM contacts WHERE id = ?").bind(id).run();
}
