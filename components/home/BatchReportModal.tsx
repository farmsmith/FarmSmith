"use client";

import React, { useEffect } from "react";
import { X, ShieldCheck, FileText, Lock, Award } from "lucide-react";

interface BatchReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchNo: string;
  pdfUrl: string;
  totalPages?: number;
}

export default function BatchReportModal({
  isOpen,
  onClose,
  batchNo,
  pdfUrl,
  totalPages = 12,
}: BatchReportModalProps) {
  // Prevent keyboard shortcuts for Save (Ctrl+S), Print (Ctrl+P), Copy (Ctrl+C), View Source (Ctrl+U)
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
        ["s", "p", "c", "u", "a"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }

      if (e.key === "F12" || e.key === "PrintScreen") {
        e.preventDefault();
      }
    };

    // Lock body scroll when modal is open
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Official Lab Quality Check Report - Batch ${batchNo}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(18, 28, 22, 0.88)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(0.5rem, 2vw, 1.5rem)",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        style={{
          background: "#FAF8F2",
          border: "1.5px solid rgba(217, 164, 65, 0.4)",
          borderRadius: "1.25rem",
          width: "100%",
          maxWidth: "1000px",
          height: "92vh",
          maxHeight: "900px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
          position: "relative",
          animation: "modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalSlideUp {
            from {
              opacity: 0;
              transform: translateY(24px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .pdf-watermark-grid {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 10;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(4, 1fr);
            opacity: 0.07;
            user-select: none;
            overflow: hidden;
          }
          .watermark-item {
            display: flex;
            align-items: center;
            justifyContent: center;
            transform: rotate(-25deg);
            font-size: clamp(0.75rem, 1.5vw, 1.1rem);
            font-weight: 800;
            color: #1F3A2E;
            font-family: monospace;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            text-align: center;
            white-space: nowrap;
          }
        `}</style>

        {/* Modal Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1F3A2E 0%, #152820 100%)",
            color: "#FFFFFF",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            borderBottom: "1px solid rgba(217, 164, 65, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                background: "rgba(217, 164, 65, 0.18)",
                border: "1px solid rgba(217, 164, 65, 0.4)",
                padding: "0.5rem",
                borderRadius: "0.6rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={20} style={{ color: "#D9A441" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.1rem",
                    margin: 0,
                    fontWeight: 700,
                    color: "#FFFFFF",
                  }}
                >
                  Official Lab Quality Check Report
                </h3>
                <span
                  style={{
                    background: "rgba(217, 164, 65, 0.25)",
                    border: "1px solid rgba(217, 164, 65, 0.5)",
                    color: "#F6E05E",
                    fontSize: "0.75rem",
                    padding: "0.15rem 0.55rem",
                    borderRadius: "100px",
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                >
                  Batch #{batchNo}
                </span>
              </div>
              <p
                style={{
                  margin: "0.15rem 0 0",
                  fontSize: "0.75rem",
                  color: "#D1D5DB",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>NABL Accredited Laboratory Analysis</span>
                <span>•</span>
                <span>{totalPages} Pages Complete Certificate</span>
              </p>
            </div>
          </div>

          {/* Right Header: Security Notice & Close Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                padding: "0.35rem 0.75rem",
                borderRadius: "100px",
                fontSize: "0.75rem",
                color: "#9CA3AF",
              }}
              title="Protected Document: Copying, downloading, and printing are disabled."
            >
              <Lock size={13} style={{ color: "#10B981" }} />
              <span>Protected Viewer</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Report Viewer"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFFFFF",
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

        {/* Purity Highlights Bar */}
        <div
          style={{
            background: "#F3EFE6",
            borderBottom: "1px solid rgba(217, 164, 65, 0.25)",
            padding: "0.6rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            fontSize: "0.8125rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#065F46", fontWeight: 700 }}>
              <ShieldCheck size={16} style={{ color: "#059669" }} /> Dyes: Absent
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#065F46", fontWeight: 700 }}>
              <ShieldCheck size={16} style={{ color: "#059669" }} /> Heavy Metals: Absent
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#065F46", fontWeight: 700 }}>
              <ShieldCheck size={16} style={{ color: "#059669" }} /> Pesticides: Absent
            </span>
          </div>

          <span style={{ color: "#78350F", fontWeight: 600, fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <Award size={14} style={{ color: "#D9A441" }} /> 100% Purity Verified & Certified
          </span>
        </div>

        {/* Document Frame Area with Watermark Layer */}
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "#525659",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Security Diagonal Watermarks */}
          <div className="pdf-watermark-grid" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="watermark-item">
                FARMSMITH QUALITY REPORT • BATCH #{batchNo} • VIEW ONLY
              </div>
            ))}
          </div>

          {/* Embedded Protected PDF Object / Frame */}
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0`}
            title={`Quality Check Report for Batch ${batchNo}`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "#FFFFFF",
            }}
            loading="lazy"
          />
        </div>

        {/* Footer Bar */}
        <div
          style={{
            background: "#FAF8F2",
            borderTop: "1px solid rgba(217, 164, 65, 0.25)",
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
            fontSize: "0.75rem",
            color: "#6B7280",
          }}
        >
          <span>
            🔒 <strong>Protected Document:</strong> Copying, screenshots, and unauthorized distribution are strictly restricted.
          </span>
          <button
            onClick={onClose}
            style={{
              background: "var(--color-primary)",
              color: "#FFFFFF",
              border: "none",
              padding: "0.4rem 1rem",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
