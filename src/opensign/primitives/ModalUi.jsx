import React from "react";
import "../styles/signature.css";

const ModalUi = ({
  children,
  title,
  isOpen,
  handleClose,
  showHeader = true,
  showClose = true,
  reduceWidth,
  position,
  modalId = "selectSignerModal",
}) => {
  const width = reduceWidth;
  const isBottom = position === "bottom" ? "items-end pb-2" : "";
  return (
    <>
      {isOpen && (
        <div
          id={modalId}
          className="fixed inset-0 z-[9999] flex items-center justify-center  bg-opacity-30">
          <div
            className={`${
              width || "md:min-w-[500px]"
            } bg-white rounded-lg shadow-2xl border border-gray-200 p-0 max-h-[90vh] overflow-y-auto text-sm`}>
            {showHeader && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {title && (
                  <h3 className="text-gray-800 font-bold text-lg">{title}</h3>
                )}
                {showClose && (
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    onClick={() => handleClose && handleClose()}>
                    ✕
                  </button>
                )}
              </div>
            )}
            <div>{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalUi;
