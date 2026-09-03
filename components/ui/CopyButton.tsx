"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
  style?: React.CSSProperties;
}

export function CopyButton({ text, label, style }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silently fail if clipboard access is denied
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        background: copied ? "rgba(22, 101, 52, 0.15)" : "rgba(0, 0, 0, 0.05)",
        border: "1px solid " + (copied ? "rgba(22, 101, 52, 0.3)" : "rgba(0, 0, 0, 0.1)"),
        color: copied ? "var(--color-primary)" : "var(--color-foreground)",
        fontSize: "0.75rem",
        fontWeight: 600,
        padding: "0.25rem 0.5rem",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        ...style,
      }}
      title={copied ? "Copied!" : `Copy ${label || text}`}
    >
      {copied ? <Check size={12} style={{ color: "var(--color-primary)" }} /> : <Copy size={12} />}
      <span>{copied ? "Copied!" : label || "Copy"}</span>
    </button>
  );
}
