"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/opensign/redux/store";

interface OpenSignProviderProps {
  children: React.ReactNode;
}

export const OpenSignProvider: React.FC<OpenSignProviderProps> = ({
  children,
}) => {
  return <Provider store={store}>{children}</Provider>;
};

export default OpenSignProvider;
