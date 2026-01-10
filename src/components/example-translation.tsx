"use client";

import React from "react";
import { useTranslation } from "react-i18next";

export function ExampleTranslation() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">
        {t("welcome", "Welcome")} {/* Default text as fallback */}
      </h2>
      <p className="mb-4">
        {t("description", "This is an example of internationalization.")}
      </p>

      <div className="space-x-2">
        <button
          onClick={() => changeLanguage("en")}
          className="px-3 py-1 bg-blue-500 text-white rounded">
          English
        </button>
        <button
          onClick={() => changeLanguage("es")}
          className="px-3 py-1 bg-blue-500 text-white rounded">
          Español
        </button>
        <button
          onClick={() => changeLanguage("fr")}
          className="px-3 py-1 bg-blue-500 text-white rounded">
          Français
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Current language: {i18n.language}
      </p>
    </div>
  );
}
