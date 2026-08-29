import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    // 1. Save to Supabase DB (Option A)
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
        { status: 500 }
      );
    }

    // 2. Send email notification via Resend API (Option B) if key configured
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
    } else {
      console.log("Resend API key not set. Skipping email dispatch. Saved to DB ID:", dbData.id);
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been received! Our team will get back to you soon.",
      inquiryId: dbData.id,
    });
  } catch (error) {
    console.error("Error handling contact submit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
