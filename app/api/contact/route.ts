import { NextResponse } from "next/server";
import { Resend } from "resend";
import { SITE_EMAIL } from "@/lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  const { name, contact, subject, message } = await req.json();

  if (!name || !contact || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!resend) {
    console.error("Contact form submission failed: RESEND_API_KEY is not configured.");
    return NextResponse.json({ error: "Email service is not configured." }, { status: 500 });
  }

  const replyTo = EMAIL_RE.test(contact) ? contact : undefined;

  try {
    const { error } = await resend.emails.send({
      from: "My's Portfolio <onboarding@resend.dev>",
      to: SITE_EMAIL,
      replyTo,
      subject: subject || `New message from ${name}`,
      text: `From: ${name}\nContact: ${contact}\n\n${message}`,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
