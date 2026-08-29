"use client";

import React from "react";
import { ShieldCheck, Award, Sparkles, Sprout, HeartPulse, CheckCircle2 } from "lucide-react";

const TICKER_ITEMS = [
  { icon: Award, label: "GI-Tagged Kandhamal Origin" },
  { icon: ShieldCheck, label: "Zero Lead Chromate & Dyes" },
  { icon: Sparkles, label: "5.4% High Curcumin Tested" },
  { icon: Sprout, label: "100% Organically Farmed" },
  { icon: HeartPulse, label: "Crafted with a Mother's Care" },
  { icon: CheckCircle2, label: "Batch-Specific Lab Proof" },
];

export default function TrustTicker() {
  return (
    <div
      style={{
        background: "var(--color-primary-dark)",
        color: "var(--color-card)",
        padding: "0.875rem 0",
        overflow: "hidden",
        position: "relative",
        borderTop: "1px solid rgba(217, 164, 65, 0.2)",
        borderBottom: "1px solid rgba(217, 164, 65, 0.2)",
      }}
    >
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker 28s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0 2rem;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          white-space: nowrap;
          color: rgba(251, 250, 246, 0.92);
        }
      `}</style>

      <div className="ticker-track">
        {/* Render twice for seamless continuous scrolling */}
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="ticker-item">
              <Icon size={16} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
              <span>{item.label}</span>
              <span style={{ color: "var(--color-accent)", opacity: 0.4, marginLeft: "1.5rem" }}>•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
