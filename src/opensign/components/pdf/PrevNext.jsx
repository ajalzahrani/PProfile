import React from "react";
import { useTranslation } from "react-i18next";

function PrevNext({ pageNumber, allPages, changePage }) {
  const { t } = useTranslation();
  //for go to previous page
  function previousPage() {
    changePage(-1);
  }
  //for go to next page
  function nextPage() {
    changePage(1);
  }

  return (
    <div className="flex items-center">
      <button
        className="px-2 py-1 md:px-3 md:py-2 border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-md transition-colors duration-200 font-semibold text-xs"
        disabled={pageNumber <= 1}
        onClick={previousPage}>
        <span className="block">
          <i className="fa-solid fa-backward" aria-hidden="true"></i>
        </span>
      </button>
      <span className="text-xs text-base-content font-medium mx-2 2xl:text-[20px]">
        {pageNumber || (allPages ? 1 : "--")} {t("of")} {allPages || "--"}
      </span>
      <button
        className="px-2 py-1 md:px-3 md:py-2 border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-md transition-colors duration-200 font-semibold text-xs"
        disabled={pageNumber >= allPages}
        onClick={nextPage}>
        <span className="block">
          <i className="fa-solid fa-forward" aria-hidden="true"></i>
        </span>
      </button>
    </div>
  );
}

export default PrevNext;
