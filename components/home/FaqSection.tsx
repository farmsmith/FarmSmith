"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "What does GI-Tagged actually mean?",
    answer:
      "A Geographical Indication (GI) tag is an official designation certifying that our turmeric is harvested exclusively from Kandhamal, Odisha. Soil mineral composition in this region naturally yields higher curcumin levels (5.4%+) and distinct aroma compared to generic commercial stock.",
  },
  {
    question: "Is every batch of turmeric tested?",
    answer:
      "Yes, 100% of our batches undergo independent NABL laboratory testing. We test for active curcumin concentration and certify 0.00% lead chromate, metanil yellow, or heavy metal contamination. You can scan the QR code on your pack to view your exact lab report.",
  },
  {
    question: "Where can I buy FarmSmith Turmeric?",
    answer:
      "You can order directly from our website for fast home delivery across India, or buy directly from our official Amazon store page.",
  },
  {
    question: "Are more products coming soon?",
    answer:
      "Yes! Turmeric is just our flagship start. We are currently developing cold-pressed wood-milled oils, single-origin raw honey, and heritage organic pulses under the same zero-adulteration promise.",
  },
  {
    question: "How can I contact the FarmSmith team?",
    answer:
      "You can reach out to us directly via WhatsApp, email us at care@farmsmith.in, or use our contact form. We are always here to help!",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section style={{ background: "var(--color-surface)", paddingBlock: "5.5rem" }}>
      <div className="container" style={{ maxWidth: "860px", margin: "0 auto", paddingInline: "1rem" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p className="eyebrow" style={{ color: "#C4883E", marginBottom: "0.5rem", fontWeight: 700, letterSpacing: "0.1em" }}>
            QUESTIONS & ANSWERS
          </p>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              color: "var(--color-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  boxShadow: isOpen ? "0 8px 25px rgba(31, 58, 46, 0.06)" : "0 2px 8px rgba(0, 0, 0, 0.02)",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1.35rem 1.75rem",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    gap: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "var(--color-primary)",
                    }}
                  >
                    {faq.question}
                  </span>
                  <span style={{ color: "#C4883E", flexShrink: 0 }}>
                    {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: "0 1.75rem 1.5rem",
                      fontSize: "0.9375rem",
                      lineHeight: 1.7,
                      color: "var(--color-muted)",
                      borderTop: "1px solid rgba(0, 0, 0, 0.04)",
                      paddingTop: "1rem",
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
