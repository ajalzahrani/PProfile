import React from "react";
import { getWidgetType, isMobile } from "../../constant/Utils";
import { useTranslation } from "react-i18next";

function WidgetList(props) {
  const { t } = useTranslation();
  return props.updateWidgets.map((item, ind) => {
    return (
      <div className="" key={ind}>
        <div
          data-tut="isSignatureWidget"
          className="select-none mx-1 md:mx-0 cursor-all-scroll hover:bg-gray-50 rounded-md transition-colors duration-200 p-0.5"
          onClick={() => {
            props.addPositionOfSignature &&
              props.addPositionOfSignature("onclick", item);
          }}
          ref={(element) => !isMobile && item.ref(element)}
          onMouseMove={(e) => !isMobile && props?.handleDivClick(e)}
          onMouseDown={() => !isMobile && props?.handleMouseLeave()}
          onTouchStart={(e) => !isMobile && props?.handleDivClick(e)}>
          {item.ref && getWidgetType(item, t(`widgets-name.${item.type}`))}
        </div>
      </div>
    );
  });
}

export default WidgetList;
