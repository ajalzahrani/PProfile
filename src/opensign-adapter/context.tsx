// src/opensign-adapter/context.tsx
"use client";
import React, { createContext, useContext } from "react";
import type { OpenSignAdapter } from "./types";

const OpenSignAdapterContext = createContext<OpenSignAdapter | null>(null);
export const useOpenSignAdapter = () => {
  const ctx = useContext(OpenSignAdapterContext);
  if (!ctx) throw new Error("OpenSignAdapter not provided");
  return ctx;
};
export const OpenSignAdapterProvider = ({
  adapter,
  children,
}: {
  adapter: OpenSignAdapter;
  children: React.ReactNode;
}) => (
  <OpenSignAdapterContext.Provider value={adapter}>
    {children}
  </OpenSignAdapterContext.Provider>
);
