"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const FAQS: FaqItem[] = [
  {
    question: "What does GI-Tag mean?",
    answer: (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p>
          <strong style={{ color: "var(--color-primary)", fontWeight: 600 }}>Origin Certification:</strong> It proves that a product comes from a specific region, town, or state.
        </p>
        <p>
          <strong style={{ color: "var(--color-primary)", fontWeight: 600 }}>Quality Assurance:</strong> It ensures that the item follows traditional methods and possesses unique traits tied to that local environment.
        </p>
        <p>
          <strong style={{ color: "var(--color-primary)", fontWeight: 600 }}>Legal Protection:</strong> It stops unauthorized users from using the protected name for fake or non-regional products.
        </p>
      </div>
    ),
  },
  {
    question: "How do you ensure the quality of your product?",
    answer: (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p>
          We approach quality through multiple stages — from sourcing and selection to processing, packing and batch-level testing. Where a particular quality parameter is tested, the applicable laboratory result is associated with the relevant batch.
        </p>
        <p style={{ fontWeight: 500, color: "var(--color-primary)" }}>
          We prefer showing the evidence behind a claim rather than simply calling a product &ldquo;pure.&rdquo;
        </p>
      </div>
    ),
  },
  {
    question: "Is every FarmSmith batch tested?",
    answer: (
      <p>
        Yes. Our batches undergo defined quality checks and laboratory testing, with results maintained against the relevant batch records.
      </p>
    ),
  },
  {
    question: "What exactly is tested?",
    answer: (
      <p>
        We don&apos;t use a blanket &ldquo;purity&rdquo; claim. We identify the parameters such as adulteration, artificial colours/dyes, heavy metals, pesticides/banned pesticides or any other contamination and shelf life. We make the applicable results available for the relevant batch.
      </p>
    ),
  },
  {
    question: "Can I check the quality information for my product?",
    answer: (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p>
          Yes. Enter the batch number printed on your FarmSmith pack in our batch-verification section to view the quality information available for that batch.
        </p>
        <p style={{ fontWeight: 500, color: "var(--color-primary)" }}>
          Check the quality of what you bring home.
        </p>
      </div>
    ),
  },
  {
    question: "Where can I find my batch number?",
    answer: (
      <p>
        Your batch number is printed on the product packaging. Enter that exact number in the Batch Verification section of our website.
      </p>
    ),
  },
  {
    question: "Does a GI registration mean the product is pure?",
    answer: (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p style={{ fontWeight: 600, color: "var(--color-primary)" }}>No.</p>
        <p>
          A Geographical Indication primarily identifies goods whose qualities, reputation or characteristics are associated with a particular geographical origin. It should not be presented as a laboratory certification of purity, absence of adulteration or superiority.
        </p>
        <p style={{ fontWeight: 500, color: "var(--color-primary)" }}>
          Only a laboratory test can verify the purity of any product.
        </p>
      </div>
    ),
  },
  {
    question: "Does FarmSmith grow its product?",
    answer: (
      <p>
        No. FarmSmith is a food brand that sources and selects raw materials/products to its requirements and has them processed and packed to its specifications. We source our raw materials from entities who share same values and purpose of providing clean nourishing food free of any synthetic chemicals. We don&apos;t represent ourselves as the farmers or growers unless that is specifically true for a particular product.
      </p>
    ),
  },
  {
    question: "Why does FarmSmith talk so much about origin?",
    answer: (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p style={{ fontWeight: 500, color: "var(--color-primary)" }}>Because where a food comes from matters.</p>
        <p>
          Origin can tell us about the geographical identity and story of an ingredient, while our own sourcing and quality processes determine what we choose to bring under the FarmSmith name.
        </p>
        <p style={{ fontWeight: 600, color: "var(--color-accent)" }}>
          Origin tells you where it comes from. Testing tells you what was checked.
        </p>
      </div>
    ),
  },
  {
    question: "Does \u201Cnatural\u201D mean the product is completely free from contaminants?",
    answer: (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p>No food should be described that way without appropriate evidence.</p>
        <p>
          Terms such as natural, pure, authentic, genuine or 100% can create broad impressions and need to be used carefully in food marketing. FSSAI requires food claims to be truthful, meaningful and not misleading, and has specifically advised against &ldquo;100%&rdquo; claims in food labelling and promotion.
        </p>
        <p style={{ fontWeight: 500, color: "var(--color-primary)" }}>
          We&apos;d rather tell you what was tested than make absolute claims.
        </p>
      </div>
    ),
  },
  {
    question: "Does FarmSmith make health or medicinal claims about turmeric?",
    answer: (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p style={{ fontWeight: 500, color: "var(--color-primary)" }}>FarmSmith sells food, not medicine.</p>
        <p>
          We do not intend to represent our turmeric as a treatment or cure for disease. Any nutritional or health-related information we publish should be supported by appropriate evidence and comply with applicable food-claim requirements.
        </p>
      </div>
    ),
  },
  {
    question: "How is FarmSmith different from other brands?",
    answer: (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p>We don&apos;t think the answer should simply be &ldquo;ours is purer.&rdquo;</p>
        <p>
          FarmSmith focuses on thoughtful sourcing, defined quality requirements, transparent batch information and making relevant evidence easier for customers to access.
        </p>
        <p style={{ fontWeight: 500, color: "var(--color-primary)" }}>
          We don&apos;t ask you to trust a claim simply because we printed it on a packet.
        </p>
      </div>
    ),
  },
  {
    question: "How should I store FarmSmith turmeric?",
    answer: (
      <p>
        Store the pack in a cool, dry place away from direct sunlight and moisture. Keep it properly sealed after opening and use a clean, dry spoon when handling the powder.
      </p>
    ),
  },
  {
    question: "What if I have a question about my batch or test report?",
    answer: (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p style={{ fontWeight: 500, color: "var(--color-primary)" }}>We&apos;re happy to help.</p>
        <p>
          Please contact us with your product name and batch number, and we can help you understand the available batch information.
        </p>
      </div>
    ),
  },
  {
    question: "Are more products coming soon?",
    answer: (
      <p>
        Yes! Turmeric is just our flagship start. We are working towards a wider range of everyday essentials like edible oils, grains &amp; pulses etc.
      </p>
    ),
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
        
        {/* Header - Cormorant Garamond 600 */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p
            className="eyebrow"
            style={{
              fontFamily: "var(--font-body)",
              color: "#C4883E",
              marginBottom: "0.5rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
            }}
          >
            QUESTIONS &amp; ANSWERS
          </p>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
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
                    fontFamily: "var(--font-subheading)",
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-subheading)",
                      fontSize: "1.0625rem",
                      fontWeight: 500,
                      color: "var(--color-primary)",
                      lineHeight: 1.4,
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
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
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
