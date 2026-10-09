"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  AlertCircle
} from "lucide-react";

interface BatchReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchNo: string;
  totalPages?: number;
}

// Dynamically load PDF.js browser script
function loadPdfJsScript(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR not supported"));
  if ((window as any).pdfjsLib) {
    return Promise.resolve((window as any).pdfjsLib);
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="/pdf.min.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        resolve((window as any).pdfjsLib);
      });
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.src = "/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        resolve(lib);
      } else {
        reject(new Error("pdfjsLib not found on window"));
      }
    };
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

export default function BatchReportModal({
  isOpen,
  onClose,
  batchNo,
  totalPages = 12,
}: BatchReportModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(totalPages);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  // Ensure portal only mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut interception & escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (
        isCtrlOrCmd &&
        ["s", "p", "c", "u", "a", "x"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.key === "F12" || e.key === "PrintScreen") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Lock page body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.body.style.overflow = originalOverflow || "unset";
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  // Load PDF via PDF.js when modal opens
  useEffect(() => {
    if (!isOpen) {
      setPdfDoc(null);
      setLoading(true);
      setError(null);
      return;
    }

    let isCancelled = false;

    async function fetchAndRenderPdf() {
      try {
        setLoading(true);
        setError(null);

        const pdfjsLib = await loadPdfJsScript();
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

        // Fetch PDF binary from protected API route
        const pdfUrl = `/api/batch-report/${batchNo}`;
        
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error loading PDF with PDF.js:", err);
        if (!isCancelled) {
          setError(
            err?.message || "Failed to load the lab quality check report. Please verify the batch code."
          );
          setLoading(false);
        }
      }
    }

    fetchAndRenderPdf();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, batchNo]);

  // Render all pages onto canvas elements whenever doc or scale changes
  const renderPages = useCallback(async () => {
    if (!pdfDoc) return;

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRefs.current[pageNum - 1];
        if (!canvas) continue;

        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        // Base viewport for current scale
        const viewport = page.getViewport({ scale: scale * 1.35 });
        
        // Use devicePixelRatio for super-crisp rendering on Retina/HiDPI screens
        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;

        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (pageErr) {
        console.warn(`Error rendering page ${pageNum}:`, pageErr);
      }
    }
  }, [pdfDoc, scale]);

  useEffect(() => {
    if (pdfDoc && !loading) {
      renderPages();
    }
  }, [pdfDoc, scale, loading, renderPages]);

  // Zoom control handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.15, 2.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.15, 0.6));
  };

  const handleResetZoom = () => {
    setScale(1.0);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quality Report Preview"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(10, 18, 14, 0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(0.5rem, 2vw, 1.25rem)",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
    >
      <div
        style={{
          background: "#1E2A24",
          border: "1.5px solid rgba(217, 164, 65, 0.4)",
          borderRadius: "1.25rem",
          width: "100%",
          maxWidth: "1160px",
          height: "94vh",
          maxHeight: "960px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 28px 70px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05)",
          position: "relative",
          animation: "modalSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <style>{`
          @keyframes modalSlideUp {
            from {
              opacity: 0;
              transform: translateY(28px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .pdf-watermark-overlay {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 15;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(4, 1fr);
            opacity: 0.07;
            user-select: none;
            overflow: hidden;
          }
          .pdf-watermark-overlay span {
            display: flex;
            align-items: center;
            justifyContent: center;
            transform: rotate(-24deg);
            font-size: clamp(0.7rem, 1.2vw, 0.95rem);
            font-weight: 800;
            color: #1F3A2E;
            font-family: monospace;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            text-align: center;
            white-space: nowrap;
          }
          .pdf-doc-page {
            position: relative;
            background: #FFFFFF;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
            border-radius: 4px;
            margin-bottom: 24px;
            overflow: hidden;
            display: inline-block;
          }
          .toolbar-btn {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #FAF6EE;
            border-radius: 8px;
            padding: 0.45rem 0.75rem;
            font-size: 0.8125rem;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            transition: all 0.15s ease;
          }
          .toolbar-btn:hover {
            background: rgba(217, 164, 65, 0.25);
            border-color: rgba(217, 164, 65, 0.5);
            color: #F6E05E;
          }
          .toolbar-btn:active {
            transform: scale(0.96);
          }
        `}</style>

        {/* Clean Minimalist Top Header Bar */}
        <div
          style={{
            background: "linear-gradient(135deg, #16241C 0%, #0F1A14 100%)",
            color: "#FAF6EE",
            padding: "0.75rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(217, 164, 65, 0.25)",
            zIndex: 30,
          }}
        >
          {/* Left / Center: Zoom Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={handleZoomOut}
              className="toolbar-btn"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>

            <button
              onClick={handleResetZoom}
              className="toolbar-btn"
              title="Reset Zoom / Fit Width"
              style={{ minWidth: "66px", justifyContent: "center" }}
            >
              <Maximize2 size={13} />
              <span>{Math.round(scale * 100)}%</span>
            </button>

            <button
              onClick={handleZoomIn}
              className="toolbar-btn"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Right: Close Button */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={onClose}
              aria-label="Close Report Viewer"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FAF6EE",
                borderRadius: "50%",
                width: "2.25rem",
                height: "2.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.85)";
                e.currentTarget.style.borderColor = "transparent";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas View Area */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            position: "relative",
            background: "#2D3732",
            overflowY: "auto",
            overflowX: "auto",
            padding: "2rem 1rem",
            textAlign: "center",
            scrollBehavior: "smooth",
          }}
        >
          {loading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "450px",
                gap: "1rem",
                color: "#FAF6EE",
              }}
            >
              <Loader2 size={36} className="animate-spin" style={{ color: "#D9A441" }} />
              <div>
                <p style={{ fontWeight: 600, margin: 0, fontSize: "1rem", color: "#FAF6EE" }}>
                  Rendering Lab Quality Certificate...
                </p>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "#A7B3AB" }}>
                  Retrieving complete verification for Batch #{batchNo}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
                gap: "1rem",
                color: "#FAF6EE",
                maxWidth: "480px",
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <AlertCircle size={44} style={{ color: "#EF4444" }} />
              <h4 style={{ margin: 0, fontSize: "1.125rem", color: "#FAF6EE" }}>
                Unable to Load Certificate
              </h4>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#D1D5DB", lineHeight: 1.6 }}>
                {error}
              </p>
              <button
                onClick={onClose}
                style={{
                  background: "#D9A441",
                  color: "#1F3A2E",
                  border: "none",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "0.5rem",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                }}
              >
                Close Viewer
              </button>
            </div>
          )}

          {!loading && !error && (
            <div style={{ display: "inline-block", textAlign: "center" }}>
              {Array.from({ length: numPages }).map((_, idx) => (
                <div key={idx} className="pdf-doc-page">
                  {/* Subtle Diagonal Watermark on every canvas page */}
                  <div className="pdf-watermark-overlay" aria-hidden="true">
                    {Array.from({ length: 8 }).map((_, wIdx) => (
                      <span key={wIdx}>
                        FARMSMITH QUALITY REPORT • BATCH #{batchNo} • VIEW ONLY
                      </span>
                    ))}
                  </div>

                  {/* HTML5 Canvas element rendered with PDF.js */}
                  <canvas
                    ref={(el) => {
                      canvasRefs.current[idx] = el;
                    }}
                    style={{
                      display: "block",
                      background: "#FFFFFF",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
