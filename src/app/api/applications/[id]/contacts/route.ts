import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getContactsByApplication, createContact } from "@/lib/db/contacts";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const contacts = await getContactsByApplication(env.JOB_HUNT_DB, Number(id));
    return NextResponse.json(contacts);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const body: Omit<import("@/types").NewContact, "application_id"> = await request.json();
    const contact = await createContact(env.JOB_HUNT_DB, {
      ...body,
      application_id: Number(id),
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
