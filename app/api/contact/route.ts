import { NextResponse } from "next/server";
import { Resend } from "resend";

const TO_EMAIL = "phamlehamy2307@gmail.com";

export async function POST(req: Request) {
  const { name, contact, subject, message } = await req.json();

  if (!name || !contact || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: "My's Portfolio <onboarding@resend.dev>",
      to: TO_EMAIL,
      replyTo: contact.includes("@") ? contact : undefined,
      subject: subject || `New message from ${name}`,
      text: `From: ${name}\nContact: ${contact}\n\n${message}`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
