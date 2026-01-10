import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// Check if we're in the browser environment
const isClient = typeof window !== "undefined";

const i18nInstance = i18n.createInstance();

if (isClient) {
  i18nInstance
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json",
      },
      fallbackLng: "en",
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
      },
      ns: ["translation"],
      defaultNS: "translation",
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      supportedLngs: ["en", "es", "fr", "it", "de", "hi"],
      // React 19 specific options
      react: {
        useSuspense: false, // Disable suspense for React 19 compatibility
        bindI18n: "languageChanged",
        bindI18nStore: "",
        transEmptyNodeValue: "",
        transSupportBasicHtmlNodes: true,
        transKeepBasicHtmlNodesFor: ["br", "strong", "i"],
      },
    });
} else {
  // Server-side initialization with minimal config
  i18nInstance.init({
    fallbackLng: "en",
    ns: ["translation"],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18nInstance;
