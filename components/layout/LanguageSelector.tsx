"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Globe } from "lucide-react";

interface Language {
  code: string;
  label: string;
  nativeName: string;
  shortLabel: string;
}

const LANGUAGES: Language[] = [
  { code: "en", label: "English", nativeName: "English", shortLabel: "En" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी", shortLabel: "हि" },
  { code: "or", label: "Odia", nativeName: "ଓଡ଼ିଆ", shortLabel: "ଓଡ଼ି" },
  { code: "ta", label: "Tamil", nativeName: "தமிழ்", shortLabel: "தம" },
  { code: "te", label: "Telugu", nativeName: "తెలుగు", shortLabel: "తె" },
  { code: "kn", label: "Kannada", nativeName: "ಕನ್ನಡ", shortLabel: "ಕನ್ನ" },
  { code: "ml", label: "Malayalam", nativeName: "മലയാളം", shortLabel: "മല" },
  { code: "mr", label: "Marathi", nativeName: "मराठी", shortLabel: "मरा" },
  { code: "gu", label: "Gujarati", nativeName: "ગુજરાતી", shortLabel: "ગુજ" },
  { code: "bn", label: "Bengali", nativeName: "বাংলা", shortLabel: "বাং" },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const clearGoogleTranslateCookies = () => {
    const host = window.location.hostname;
    const hostParts = host.split(".");
    const domains = ["", "." + host];
    if (hostParts.length > 2) {
      const rootDomain = hostParts.slice(-2).join(".");
      domains.push(rootDomain, "." + rootDomain);
    }
    const paths = ["/", window.location.pathname];

    domains.forEach((d) => {
      paths.forEach((p) => {
        const domainAttr = d ? "; domain=" + d : "";
        const pathAttr = p ? "; path=" + p : "; path=/";
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + pathAttr + domainAttr + ";";
        document.cookie = "googtrans_sync=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + pathAttr + domainAttr + ";";
      });
    });

    try {
      sessionStorage.removeItem("googtrans");
      localStorage.removeItem("googtrans");
    } catch (_) {}
  };

  const loadGoogleTranslateScript = useCallback(() => {
    if (typeof window === "undefined" || (window as any).googleTranslateLoaded) return;
    (window as any).googleTranslateLoaded = true;

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

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Check if non-English language was previously chosen
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;) ?googtrans=([^;]*)(?:;|$)/);
    if (match && match[1]) {
      const parts = match[1].split("/");
      const currentCode = parts[parts.length - 1];
      if (currentCode && currentCode !== "en") {
        const found = LANGUAGES.find((l) => l.code === currentCode);
        if (found) {
          setSelectedLang(found);
          loadGoogleTranslateScript();
        }
      }
    }
  }, [loadGoogleTranslateScript]);

  // Close dropdown on outside click/tap
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const changeLanguage = (lang: Language) => {
    loadGoogleTranslateScript();
    setSelectedLang(lang);
    setIsOpen(false);

    const host = window.location.hostname;

    if (lang.code === "en") {
      // 1. Thoroughly wipe all Google Translate cookies
      clearGoogleTranslateCookies();

      // 2. Set explicit English cookie so translate engine resets
      document.cookie = "googtrans=/en/en; path=/;";
      document.cookie = "googtrans=/auto/en; path=/;";
      if (host && host !== "localhost" && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
        document.cookie = "googtrans=/en/en; path=/; domain=." + host + ";";
      }

      // 3. Reset Google Translate combo in DOM if loaded
      const selectElem = (document.querySelector(".goog-te-combo") ||
        document.querySelector("#google_translate_element select")) as HTMLSelectElement | null;

      if (selectElem) {
        let defaultIndex = 0;
        for (let i = 0; i < selectElem.options.length; i++) {
          if (selectElem.options[i].value === "en" || selectElem.options[i].value === "") {
            defaultIndex = i;
            break;
          }
        }
        selectElem.selectedIndex = defaultIndex;
        selectElem.dispatchEvent(new Event("change"));
      }

      // 4. Force reload after a tiny delay so the clean DOM and English state are restored
      setTimeout(() => {
        window.location.reload();
      }, 150);
      return;
    }

    // Setting a non-English language
    clearGoogleTranslateCookies();

    const cookieVal = "/en/" + lang.code;
    document.cookie = "googtrans=" + cookieVal + "; path=/;";
    if (host && host !== "localhost" && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      document.cookie = "googtrans=" + cookieVal + "; path=/; domain=." + host + ";";
    }

    // Trigger select element in hidden container if available
    const selectElem = (document.querySelector(".goog-te-combo") ||
      document.querySelector("#google_translate_element select")) as HTMLSelectElement | null;

    if (selectElem) {
      selectElem.value = lang.code;
      selectElem.dispatchEvent(new Event("change"));
    } else {
      setTimeout(() => {
        window.location.reload();
      }, 150);
    }
  };

  return (
    <div ref={dropdownRef} className="notranslate" translate="no" style={{ position: "relative", display: "inline-flex", alignItems: "center", height: "38px" }}>
      <style>{`
        .lang-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          background: rgba(31, 58, 46, 0.05);
          border: 1px solid rgba(31, 58, 46, 0.18);
          color: var(--color-primary);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          height: 32px;
          padding: 0 0.5rem;
          border-radius: var(--radius-full);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          outline: none;
          user-select: none;
          box-sizing: border-box;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          line-height: 1;
        }
        .lang-btn:hover {
          background: rgba(31, 58, 46, 0.1);
          border-color: rgba(31, 58, 46, 0.3);
        }
        .lang-btn:active {
          transform: scale(0.98);
        }
        .lang-btn.is-open {
          background: rgba(31, 58, 46, 0.12);
          border-color: var(--color-accent);
          box-shadow: 0 0 0 2px rgba(196, 136, 62, 0.2);
        }
        .lang-text {
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
          line-height: 1.2;
        }
        .lang-dropdown-item {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          text-align: left;
          padding: 0.375rem 0.625rem;
          font-size: 0.8125rem;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .lang-dropdown-item:hover {
          background: rgba(31, 58, 46, 0.06);
        }
        @media (min-width: 640px) {
          .lang-btn {
            padding: 0.3rem 0.55rem;
          }
          .lang-text {
            max-width: none;
          }
        }
      `}</style>

      {/* Hidden Google Translate Container */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* Styled Premium Language Button */}
      <button
        type="button"
        onMouseEnter={loadGoogleTranslateScript}
        onFocus={loadGoogleTranslateScript}
        onClick={() => {
          loadGoogleTranslateScript();
          setIsOpen((prev) => !prev);
        }}
        aria-label="Select Language"
        className={`notranslate lang-btn ${isOpen ? "is-open" : ""}`}
        translate="no"
      >
        <Globe size={15} strokeWidth={1.85} aria-hidden="true" style={{ opacity: 0.9, flexShrink: 0 }} />
        <span className="notranslate lang-text" translate="no">{selectedLang.shortLabel}</span>
      </button>

      {/* Tightly Fitted Compact Dropdown Menu */}
      {isOpen && (
        <div
          className="notranslate"
          translate="no"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "var(--color-card)",
            border: "1px solid rgba(31, 58, 46, 0.15)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 25px -5px rgba(31, 58, 46, 0.15), 0 4px 10px -2px rgba(0,0,0,0.04)",
            padding: "0.25rem",
            width: "max-content",
            minWidth: "105px",
            maxWidth: "150px",
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
                type="button"
                key={lang.code}
                onClick={() => changeLanguage(lang)}
                className="notranslate lang-dropdown-item"
                translate="no"
                style={{
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? "var(--color-primary)" : "var(--color-foreground)",
                  background: isSelected ? "rgba(31, 58, 46, 0.08)" : "transparent",
                }}
              >
                <span className="notranslate" translate="no">{lang.nativeName}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
