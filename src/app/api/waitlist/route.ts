import { NextResponse } from "next/server";
import { MailtrapClient } from "mailtrap";

const MAILTRAP_API_TOKEN = process.env.MAILTRAP_API_TOKEN;
const MAILTRAP_FROM_EMAIL = process.env.MAILTRAP_FROM_EMAIL || "hello@demomailtrap.co";
const MAILTRAP_FROM_NAME = process.env.MAILTRAP_FROM_NAME || "Cemzo Team";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!MAILTRAP_API_TOKEN) {
    return NextResponse.json(
      { error: "Email integration is not configured." },
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

  const client = new MailtrapClient({ token: MAILTRAP_API_TOKEN });

  try {
    await client.send({
      from: { email: MAILTRAP_FROM_EMAIL, name: MAILTRAP_FROM_NAME },
      to: [{ email }],
      subject: "Welcome to the Cemzo Waitlist!",
      text: `Hi ${name},\n\nThanks for joining the Cemzo waitlist! We'll keep you updated on our launch and exclusive early access.\n\nBest,\nThe Cemzo Team`,
      category: "Waitlist Signup",
    });

    return NextResponse.json({ message: "Thanks for joining the waitlist!" }, { status: 201 });
  } catch (error) {
    console.error("Mailtrap send error:", error);
    const message =
      error instanceof Error ? error.message : "We couldn't add you to the waitlist just yet.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
