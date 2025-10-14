import { NextResponse } from "next/server";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!BREVO_API_KEY) {
    return NextResponse.json(
      { error: "Mailing integration is not configured." },
      { status: 500 },
    );
  }

  const payload = (await request.json().catch(() => null)) as
    | { name?: unknown; email?: unknown }
    | null;

  const name = typeof payload?.name === "string" ? payload.name.trim() : "";
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";

  if (!name) {
    return NextResponse.json(
      { error: "Let us know your name so we can say hello." },
      { status: 400 },
    );
  }

  if (!emailPattern.test(email.toLowerCase())) {
    return NextResponse.json(
      { error: "Enter a valid email to join the waitlist." },
      { status: 400 },
    );
  }

  const listId = BREVO_LIST_ID ? Number.parseInt(BREVO_LIST_ID, 10) : undefined;

  const response = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      email,
      attributes: {
        FIRSTNAME: name,
      },
      listIds: listId ? [listId] : undefined,
      updateEnabled: true,
    }),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => null);
    const message =
      typeof details?.message === "string"
        ? details.message
        : typeof details?.error === "string"
          ? details.error
          : "We couldn't add you to the waitlist just yet.";

    return NextResponse.json({ error: message }, { status: response.status });
  }

  return NextResponse.json({ message: "Thanks for joining the waitlist!" }, { status: 201 });
}
