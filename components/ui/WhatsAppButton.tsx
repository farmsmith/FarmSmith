"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export default function WhatsAppButton({
  phoneNumber = "918296210991",
  defaultMessage = "Hello FarmSmith Foods! I would like to inquire about your organic turmeric products.",
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      {/* Tooltip on Desktop */}
      <div
        style={{
          background: "#1C3121",
          color: "#FBFAF6",
          padding: "0.5rem 0.875rem",
          borderRadius: "9999px",
          fontSize: "0.8125rem",
          fontWeight: 600,
          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          border: "1px solid rgba(196, 136, 62, 0.3)",
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateX(0) scale(1)" : "translateX(10px) scale(0.95)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        Chat with us on WhatsApp 👋
      </div>

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(37, 211, 102, 0.4), 0 2px 8px rgba(0,0,0,0.1)",
          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease",
          transform: isHovered ? "scale(1.1)" : "scale(1)",
          textDecoration: "none",
          position: "relative",
        }}
      >
        {/* Pulse ring animation */}
        <span
          style={{
            position: "absolute",
            inset: "-4px",
            borderRadius: "50%",
            border: "2px solid #25D366",
            animation: "whatsapp-pulse 2s infinite",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />

        <style>{`
          @keyframes whatsapp-pulse {
            0% {
              transform: scale(1);
              opacity: 0.8;
            }
            70% {
              transform: scale(1.35);
              opacity: 0;
            }
            100% {
              transform: scale(1.35);
              opacity: 0;
            }
          }
        `}</style>

        {/* WhatsApp Icon */}
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
        </svg>
      </a>
    </div>
  );
}
