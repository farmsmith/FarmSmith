import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In-memory rate limiter per IP to prevent automated scraping
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 30; // Max 30 requests per minute

  const record = rateLimitMap.get(ip);
  if (!record || record.expiresAt < now) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count += 1;
  return false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchNo: string }> }
) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many verification requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const { batchNo } = await params;
    const cleanBatchNo = (batchNo || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "");

    // Valid batch pattern validation
    if (!cleanBatchNo || cleanBatchNo.length < 3) {
      return NextResponse.json(
        { error: "Invalid batch code format." },
        { status: 400 }
      );
    }

    // Secure private document path outside public web root
    const privateStorageDir = path.join(process.cwd(), "private-storage", "batchtest");
    const filePath = path.join(privateStorageDir, `${cleanBatchNo}.pdf`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Quality report certificate for batch ${cleanBatchNo} was not found.` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    // Return the protected binary with strict anti-caching & anti-indexing headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Quality-Report-${cleanBatchNo}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
      },
    });
  } catch (error) {
    console.error("Error serving secure batch report PDF:", error);
    return NextResponse.json(
      { error: "Internal server error retrieving batch report." },
      { status: 500 }
    );
  }
}
