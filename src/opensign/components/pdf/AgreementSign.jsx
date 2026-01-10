import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AgreementContent from "./AgreementContent";

function AgreementSign(props) {
  const { t } = useTranslation();
  const [isShowAgreeTerms, setIsShowAgreeTerms] = useState(false);

  return (
    <>
      {/* Modal backdrop */}
      <div className="fixed inset-0 z-[999] flex items-center justify-center backdrop-blur-sm">
        {/* Modal content */}
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-[95%] md:w-[60%] lg:w-[40%] max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex flex-row items-center mb-4">
              <div className="text-[11px] md:text-base text-gray-700">
                <span>{t("agree-p1")}</span>
                <span
                  className="font-bold text-blue-600 cursor-pointer hover:text-blue-800 underline"
                  onClick={() => {
                    setIsShowAgreeTerms(true);
                  }}>
                  {t("agree-p2")}
                </span>
                <span> {t("agree-p3")}</span>
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <button
                onClick={() => {
                  props.setIsAgree(true);
                  props.showFirstWidget();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 w-full md:w-auto">
                {t("agrre-button")}
              </button>
            </div>
            <div className="text-center text-gray-600">
              <span className="text-[11px]">{t("agreement-note")}</span>
            </div>
          </div>
        </div>
      </div>
      {isShowAgreeTerms && (
        <AgreementContent
          setIsAgree={props.setIsAgree}
          setIsShowAgreeTerms={setIsShowAgreeTerms}
          showFirstWidget={props.showFirstWidget}
        />
      )}
    </>
  );
}

export default AgreementSign;
