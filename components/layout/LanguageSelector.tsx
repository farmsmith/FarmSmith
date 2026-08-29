"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown } from "lucide-react";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  shortLabel: string;
}

const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", shortLabel: "En" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", shortLabel: "हिन्दी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", shortLabel: "தமிழ்" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", shortLabel: "मराठ" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", shortLabel: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", shortLabel: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", shortLabel: "മലയ" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", shortLabel: "ગુજર" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", shortLabel: "বাংলা" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", shortLabel: "ଓଡ଼ିଆ" },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Google Translate Script dynamically
  useEffect(() => {
    // Check if script already exists
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateInit";
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateInit = () => {
        if ((window as any).google && (window as any).google.translate) {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,ta,mr,te,kn,ml,gu,bn,or",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      };
    }

    // Read current cookie if set
    const match = document.cookie.match(/(?:^|;) ?googtrans=([^;]*)(?:;|$)/);
    if (match && match[1]) {
      const parts = match[1].split("/");
      const currentCode = parts[parts.length - 1];
      const found = LANGUAGES.find((l) => l.code === currentCode);
      if (found) setSelectedLang(found);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang: Language) => {
    setSelectedLang(lang);
    setIsOpen(false);

    if (lang.code === "en") {
      // Clear cookie for English
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;

      window.location.reload();
      return;
    }

    // Set google translate cookie
    const cookieVal = `/en/${lang.code}`;
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`;

    // Trigger select element in hidden container if available
    const selectElem = document.querySelector("#google_translate_element select") as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = lang.code;
      selectElem.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  return (
    <div ref={dropdownRef} className="notranslate" translate="no" style={{ position: "relative", display: "inline-block" }}>
      <style>{`
        .lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(31, 58, 46, 0.06);
          border: 1px solid rgba(31, 58, 46, 0.15);
          color: var(--color-primary);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.25rem 0.45rem;
          border-radius: var(--radius-full);
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .lang-btn:hover {
          background: rgba(31, 58, 46, 0.12);
        }
        .lang-text {
          max-width: 60px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
          line-height: 1.2;
        }
        @media (min-width: 640px) {
          .lang-btn {
            gap: 0.375rem;
            padding: 0.375rem 0.5rem;
            font-size: 0.875rem;
            border-radius: var(--radius-md);
            background: none;
            border: none;
          }
          .lang-text {
            max-width: none;
          }
        }
      `}</style>

      {/* Hidden Google Translate Container */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* Styled Language Button matching user design */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Select Language"
        className="notranslate lang-btn"
        translate="no"
      >
        <Globe size={16} aria-hidden="true" style={{ opacity: 0.9, flexShrink: 0 }} />
        <span className="notranslate lang-text" translate="no">{selectedLang.shortLabel}</span>
        <ChevronDown
          size={13}
          aria-hidden="true"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            opacity: 0.7,
            flexShrink: 0,
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="notranslate"
          translate="no"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
            padding: "0.375rem",
            minWidth: "140px",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: "0.125rem",
          }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang)}
                className="notranslate"
                translate="no"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? "var(--color-primary)" : "var(--color-foreground)",
                  background: isSelected ? "rgba(196, 136, 62, 0.12)" : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
              >
                <span className="notranslate" translate="no">{lang.nativeName}</span>
                <span className="notranslate" translate="no" style={{ fontSize: "0.75rem", color: "var(--color-muted)", opacity: 0.8 }}>
                  ({lang.shortLabel})
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
