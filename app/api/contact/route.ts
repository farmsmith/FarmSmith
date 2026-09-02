import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { withSecurityHeaders } from "@/lib/security/headers";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

export async function POST(req: Request) {
  const headers = withSecurityHeaders();

  const ip = getClientIp(req);
  const rl = await rateLimit(`contact:${ip}`, 5, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many contact inquiries submitted. Please try again in a minute." },
      { status: 429, headers }
    );
  }

  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.format() },
        { status: 400, headers }
      );
    }

    const { name, email, subject, message } = parsed.data;

    // 1. Save to Supabase DB
    const supabase = createAdminSupabaseClient();
    const { data: dbData, error: dbError } = await supabase
      .from("contact_inquiries")
      .insert({
        name,
        email,
        subject: subject || null,
        message,
        status: "new",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Failed to save contact inquiry to DB:", dbError);
      return NextResponse.json(
        { error: "Failed to save inquiry to database" },
        { status: 500, headers }
      );
    }

    // 2. Send email notification via Resend API if key configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.CONTACT_EMAIL || "farmsmith6@gmail.com";

    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "FarmSmith Contact <onboarding@resend.dev>",
            to: [recipientEmail],
            reply_to: email,
            subject: `[Contact Form] ${subject || "New Customer Inquiry from " + name}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1C3121;">
                <h2 style="color: #1C3121; border-bottom: 2px solid #C4883E; padding-bottom: 8px;">New Customer Inquiry</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject || "N/A"}</p>
                <div style="background: #FBFAF6; padding: 15px; border-left: 4px solid #C4883E; margin-top: 15px;">
                  <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                </div>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to forward contact email:", emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received! Our team will get back to you soon.",
        inquiryId: dbData.id,
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error handling contact submit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

