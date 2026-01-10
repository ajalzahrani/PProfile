// Type definitions for OpenSign components
declare module "@/opensign/components/pdf/RenderPdf" {
  import { ReactNode } from "react";

  export interface RenderPdfProps {
    pdfBase64Url: string;
    pageNumber: number;
    scale: number;
    setScale: (scale: number) => void;
    setZoomPercent: (percent: number) => void;
    pdfOriginalWH: Array<{ pageNumber: number; width: number; height: number }>;
    containerWH: { width: number; height: number };
    signerPos?: any[];
    setSignerPos?: (pos: any[]) => void;
    signedSigners?: any[];
    placeholder?: boolean;
    pdfRequest?: boolean;
    isSelfSign?: boolean;
    isAlllowModify?: boolean;
    signerObjectId?: string;
    isDragging?: boolean;
    pdfDetails?: any[];
    unSignedWidgetId?: string;
    setCurrWidgetsDetails?: (details: any) => void;
    uniqueId?: string;
    ispublicTemplate?: boolean;
    handleUserDetails?: () => void;
    isResize?: boolean;
    handleTabDrag?: (key: string) => void;
    handleStop?: (
      event: any,
      dragElement: any,
      id?: string,
      key?: string
    ) => void;
    setUniqueId?: (id: string) => void;
    setIsSelectId?: (id: number) => void;
    handleDeleteSign?: (key: string, id?: string) => void;
    setIsPageCopy?: (copy: boolean) => void;
    handleTextSettingModal?: (show: boolean) => void;
    handleCellSettingModal?: () => void;
    setIsCheckbox?: (show: boolean) => void;
    assignedWidgetId?: string[];
    setCellCount?: (count: number) => void;
    setFontSize?: (size: number) => void;
    fontSize?: number;
    fontColor?: string;
    setFontColor?: (color: string) => void;
    setRequestSignTour?: (show: boolean) => void;
    currWidgetsDetails?: any;
    setTempSignerId?: (id: string) => void;
    xyPosition?: any[];
    setXyPosition?: (pos: any[]) => void;
    index?: number;
    divRef?: React.RefObject<HTMLDivElement>;
    pdfLoad?: boolean;
    setPdfLoad?: (load: boolean) => void;
    pageDetails?: (pdf: any) => void;
    drop?: (node: HTMLElement) => void;
    successEmail?: boolean;
  }

  const RenderPdf: React.FC<RenderPdfProps>;
  export default RenderPdf;
}

declare module "@/opensign/components/pdf/Placeholder" {
  import { ReactNode } from "react";

  export interface PlaceholderProps {
    pos: any;
    handleSignYourselfImageResize?: (
      ref: any,
      key: string,
      xyPosition: any[],
      setXyPosition: (pos: any[]) => void,
      index: number,
      containerScale: number,
      scale: number,
      id?: string,
      isResize?: boolean
    ) => void;
    index: number;
    xyPosition: any[];
    setXyPosition: (pos: any[]) => void;
    data?: any;
    setIsResize?: (resize: boolean) => void;
    isShowBorder?: boolean;
    isAlllowModify?: boolean;
    signerObjId?: string;
    isShowDropdown?: boolean;
    isNeedSign?: boolean;
    isSelfSign?: boolean;
    isSignYourself?: boolean;
    posWidth: (pos: any, signYourself?: boolean) => number;
    posHeight: (pos: any, signYourself?: boolean) => number;
    showGuidelines?: (
      show: boolean,
      x?: number,
      y?: number,
      width?: number,
      height?: number
    ) => void;
    isDragging?: boolean;
    pdfDetails?: any;
    unSignedWidgetId?: string;
    setCurrWidgetsDetails?: (details: any) => void;
    uniqueId?: string;
    scale: number;
    containerWH: { width: number; height: number };
    pdfOriginalWH: Array<{ pageNumber: number; width: number; height: number }>;
    pageNumber: number;
    ispublicTemplate?: boolean;
    handleUserDetails?: () => void;
    isResize?: boolean;
    handleTabDrag?: (key: string) => void;
    handleStop?: (
      event: any,
      dragElement: any,
      id?: string,
      key?: string
    ) => void;
    setUniqueId?: (id: string) => void;
    setIsSelectId?: (id: number) => void;
    handleDeleteSign?: (key: string, id?: string) => void;
    setIsPageCopy?: (copy: boolean) => void;
    handleTextSettingModal?: (show: boolean) => void;
    handleCellSettingModal?: () => void;
    setIsCheckbox?: (show: boolean) => void;
    isFreeResize?: boolean;
    isOpenSignPad?: boolean;
    assignedWidgetId?: string[];
    isApplyAll?: boolean;
    setCellCount?: (count: number) => void;
    setFontSize?: (size: number) => void;
    fontSize?: number;
    fontColor?: string;
    setFontColor?: (color: string) => void;
    setRequestSignTour?: (show: boolean) => void;
    calculateFontsize?: (pos: any) => string;
    currWidgetsDetails?: any;
    setTempSignerId?: (id: string) => void;
    isPlaceholder?: boolean;
    setShowDropdown?: (show: boolean) => void;
    setIsValidate?: (validate: boolean) => void;
    setIsRadio?: (radio: boolean) => void;
    handleNameModal?: (show: boolean) => void;
    handleLinkUser?: (id: string) => void;
  }

  const Placeholder: React.FC<PlaceholderProps>;
  export default Placeholder;
}

// Redux store types
declare module "@/opensign/redux/store" {
  import { Store } from "redux";

  export const store: Store;
}

// Utility types
declare module "@/opensign/constant/Utils" {
  export const defaultWidthHeight: (type: string) => {
    width: number;
    height: number;
  };
  export const getContainerScale: (
    pdfOriginalWH: any[],
    pageNumber: number,
    containerWH: { width: number; height: number }
  ) => number;
  export const handleImageResize: (
    ref: any,
    key: string,
    xyPosition: any[],
    setXyPosition: (pos: any[]) => void,
    index: number,
    containerScale: number,
    scale: number,
    id?: string,
    isResize?: boolean
  ) => void;
  export const handleSignYourselfImageResize: (
    ref: any,
    key: string,
    xyPosition: any[],
    setXyPosition: (pos: any[]) => void,
    index: number,
    containerScale: number,
    scale: number,
    id?: string,
    isResize?: boolean
  ) => void;
  export const isMobile: boolean;
  export const changeDateToMomentFormat: (format: string) => string;
  export const fontColorArr: string[];
  export const fontsizeArr: number[];
  export const handleCopyNextToWidget: (
    pos: any,
    type: string,
    xyPosition: any[],
    index: number,
    setXyPosition: (pos: any[]) => void,
    id?: string
  ) => void;
  export const handleCopySignUrl: (
    pos: any,
    existSignPosition: any,
    setXyPosition: (pos: any[]) => void,
    xyPosition: any[],
    pageNumber: number,
    signerObjId: string
  ) => void;
  export const handleHeighlightWidget: (
    getCurrentSignerPos: any,
    key: string,
    pageNumber: number
  ) => any[];
  export const onChangeInput: (
    value: any,
    key: string,
    xyPosition: any[],
    index: number,
    setXyPosition: (pos: any[]) => void,
    id?: string,
    isResize?: boolean,
    format?: string,
    fontSize?: number,
    fontColor?: string,
    isReadOnly?: boolean
  ) => void;
  export const radioButtonWidget: string;
  export const textInputWidget: string;
  export const cellsWidget: string;
  export const textWidget: string;
  export const selectFormat: (format: string) => string;
}

// Constants
declare module "@/opensign/constant/const" {
  export const themeColor: string;
}

// App info
declare module "@/opensign/constant/appinfo" {
  export const serverUrl_fn: () => string;
}

// Primitives
declare module "@/opensign/primitives/Alert" {
  interface AlertProps {
    type: "success" | "error" | "warning" | "info";
    children: React.ReactNode;
  }

  const Alert: React.FC<AlertProps>;
  export default Alert;
}

declare module "@/opensign/primitives/ModalUi" {
  interface ModalUiProps {
    isOpen: boolean;
    title: string;
    showClose?: boolean;
    children: React.ReactNode;
  }

  const ModalUi: React.FC<ModalUiProps>;
  export default ModalUi;
}

declare module "@/opensign/primitives/Loader" {
  const Loader: React.FC;
  export default Loader;
}

// Hook types
declare module "@/opensign/hook/usePdfPinchZoom" {
  export default function usePdfPinchZoom(
    pdfContainerRef: React.RefObject<HTMLElement>,
    scale: number,
    setScale: (scale: number) => void,
    setZoomPercent: (percent: number) => void
  ): void;
}

// i18n types
declare module "@/opensign/i18n" {
  // This will be handled by react-i18next types
}

// Global types for OpenSign
declare global {
  interface Window {
    Parse?: any;
  }
}
