import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ batchNo: string }> }
) {
  const { batchNo } = await context.params;
  const safeBatch = (batchNo || "").replace(/[^a-zA-Z0-9_-]/g, "");

  const publicDir = path.join(process.cwd(), "public");
  const batchTestDir = path.join(publicDir, "batchtest");

  // Potential search locations and names for the batch test PDF
  const candidatePaths: string[] = [
    path.join(batchTestDir, `${safeBatch}.pdf`),
    path.join(batchTestDir, `${safeBatch.toUpperCase()}.pdf`),
    path.join(batchTestDir, `${safeBatch.toLowerCase()}.pdf`),
    path.join(batchTestDir, "batchtest.pdf"),
    path.join(batchTestDir, "Batchtest.pdf"),
    path.join(batchTestDir, "batch-test.pdf"),
    path.join(batchTestDir, "report.pdf"),
    path.join(publicDir, `${safeBatch}.pdf`),
    path.join(publicDir, "batchtest.pdf"),
  ];

  // Also scan if any .pdf exists inside public/batchtest
  if (fs.existsSync(batchTestDir)) {
    try {
      const files = fs.readdirSync(batchTestDir);
      for (const file of files) {
        if (file.toLowerCase().endsWith(".pdf")) {
          candidatePaths.push(path.join(batchTestDir, file));
        }
      }
    } catch {
      // Ignore scan error
    }
  }

  // Find first existing PDF
  let matchedPath: string | null = null;
  for (const p of candidatePaths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      matchedPath = p;
      break;
    }
  }

  if (!matchedPath) {
    return NextResponse.json(
      {
        error: `Batch report PDF for ${safeBatch} not found. Please ensure the PDF is placed in public/batchtest/${safeBatch}.pdf`,
      },
      { status: 404 }
    );
  }

  try {
    const fileBuffer = fs.readFileSync(matchedPath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeBatch}-Quality-Report.pdf"`,
        "Cache-Control": "public, max-age=3600, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "frame-ancestors 'self' https://www.farmsmithfoods.com https://farmsmithfoods.com http://localhost:3000",
      },
    });
  } catch (error) {
    console.error("Failed to read PDF file", error);
    return NextResponse.json({ error: "Failed to read document." }, { status: 500 });
  }
}
