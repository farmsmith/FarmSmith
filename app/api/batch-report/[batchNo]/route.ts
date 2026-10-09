import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchNo: string }> }
) {
  try {
    const { batchNo } = await params;
    const cleanBatchNo = batchNo.replace(/[^a-zA-Z0-9_-]/g, "");

    // Check possible locations for the PDF
    const candidates = [
      path.join(process.cwd(), "public", "batchtest", `${cleanBatchNo}.pdf`),
      path.join(process.cwd(), "farmsmith", "public", "batchtest", `${cleanBatchNo}.pdf`),
      path.join(process.cwd(), "public", `${cleanBatchNo}.pdf`),
    ];

    let targetFile = "";
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        targetFile = c;
        break;
      }
    }

    // Default fallback if not found directly
    if (!targetFile) {
      const fallback = path.join(process.cwd(), "public", "batchtest", "FS00001.pdf");
      if (fs.existsSync(fallback)) {
        targetFile = fallback;
      }
    }

    if (!targetFile || !fs.existsSync(targetFile)) {
      return NextResponse.json(
        { error: "Batch report certificate not found." },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(targetFile);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Quality-Report-${cleanBatchNo}.pdf"`,
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "frame-ancestors 'self'",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving batch report PDF:", error);
    return NextResponse.json(
      { error: "Internal server error reading batch report." },
      { status: 500 }
    );
  }
}