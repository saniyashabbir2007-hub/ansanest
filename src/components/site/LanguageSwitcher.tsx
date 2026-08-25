import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

const languageDisplayNames: Record<string, { native: string; english: string }> = {
  en: { native: "English", english: "English" },
  kn: { native: "ಕನ್ನಡ", english: "Kannada" },
  hi: { native: "हिंदी", english: "Hindi" },
  mr: { native: "मराठी", english: "Marathi" },
  gu: { native: "ગુજરાતી", english: "Gujarati" },
  ta: { native: "தமிழ்", english: "Tamil" },
  te: { native: "తెలుగు", english: "Telugu" },
  bn: { native: "বাংলা", english: "Bengali" },
  ml: { native: "മലയാളം", english: "Malayalam" },
  es: { native: "Español", english: "Spanish" },
  fr: { native: "Français", english: "French" },
  ja: { native: "日本語", english: "Japanese" },
};

export function LanguageSwitcher() {
  const [selectedLang, setSelectedLang] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app_lang") || "en";
    }
    return "en";
  });

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentDisplay = languageDisplayNames[selectedLang] || languageDisplayNames.en;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize Google Translate script once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.type = "text/javascript";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    }
  }, []);

  const eraseCookie = (name: string) => {
    const host = window.location.hostname;
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    document.cookie = `${name}=; Path=/; Domain=${host}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    document.cookie = `${name}=; Path=/; Domain=.${host}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  };

  const selectLanguage = (code: string) => {
    setSelectedLang(code);
    localStorage.setItem("app_lang", code);

    if (code === "en") {
      eraseCookie("googtrans");
      window.location.reload();
      return;
    }

    const host = window.location.hostname;
    document.cookie = `googtrans=/en/${code}; Path=/;`;
    document.cookie = `googtrans=/en/${code}; Path=/; Domain=${host};`;
    document.cookie = `googtrans=/en/${code}; Path=/; Domain=.${host};`;

    const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (selectEl) {
      selectEl.value = code;
      selectEl.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }

    setOpen(false);
  };

  return (
    <div className="relative notranslate" translate="no" ref={dropdownRef}>
      <div id="google_translate_element" className="hidden" />

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 md:h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[11px] md:text-xs font-medium text-foreground transition-colors hover:bg-muted"
        aria-label="Select Language"
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="notranslate" translate="no">
          {currentDisplay.native} {selectedLang !== "en" && `(${currentDisplay.english})`}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 max-h-64 w-52 overflow-y-auto rounded-2xl border border-border bg-card p-1 shadow-xl z-50 notranslate" translate="no">
          {Object.entries(languageDisplayNames).map(([code, item]) => (
            <button
              key={code}
              type="button"
              onClick={() => selectLanguage(code)}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors notranslate ${
                selectedLang === code
                  ? "bg-foreground/5 font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              translate="no"
            >
              <span className="notranslate" translate="no">
                {item.native} {code !== "en" && <span className="opacity-70 font-normal">({item.english})</span>}
              </span>
              {selectedLang === code && <Check className="h-3.5 w-3.5 text-emerald" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}