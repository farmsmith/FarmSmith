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

    const publicBatchDir = path.join(process.cwd(), "public", "batchtest");
    const filePath = path.join(publicBatchDir, `${cleanBatchNo}.pdf`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Batch report certificate not found." },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

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
