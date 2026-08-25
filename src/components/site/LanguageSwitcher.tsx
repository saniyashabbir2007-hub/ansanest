import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "kn", label: "English", native: "ಕನ್ನಡ" },
  { code: "hi", label: "English", native: "हिंदी" },
  { code: "mr", label: "English", native: "मराठी" },
  { code: "gu", label: "English", native: "ગુજરાતી" },
  { code: "ta", label: "English", native: "தமிழ்" },
  { code: "te", label: "English", native: "తెలుగు" },
  { code: "bn", label: "English", native: "বাংলা" },
  { code: "ml", label: "English", native: "മലയാളം" },
  { code: "es", label: "English", native: "Español" },
  { code: "fr", label: "English", native: "Français" },
  { code: "ja", label: "English", native: "日本語" },
];

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

  const selectLanguage = (code: string) => {
    setSelectedLang(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("app_lang", code);

      if (code === "en") {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
        window.location.reload();
      } else {
        document.cookie = `googtrans=/en/${code}; path=/;`;
        document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname};`;

        const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (combo) {
          combo.value = code;
          combo.dispatchEvent(new Event("change"));
        } else {
          window.location.reload();
        }
      }
    }
    setOpen(false);
  };

  return (
    <div className="relative notranslate" translate="no" ref={dropdownRef}>
      <div id="google_translate_element" className="hidden" />

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 items-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
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
        <div className="absolute right-0 mt-2 max-h-72 w-56 overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-xl z-50 notranslate" translate="no">
          {Object.entries(languageDisplayNames).map(([code, item]) => (
            <button
              key={code}
              type="button"
              onClick={() => selectLanguage(code)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors notranslate ${
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