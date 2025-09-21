import React, { createContext, useContext, useState, useMemo } from "react";

const SidebarCtx = createContext(null);

export const SidebarProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const api = useMemo(
    () => ({
      sidebarOpen,
      open: () => setSidebarOpen(true),
      close: () => setSidebarOpen(false),
      toggle: () => setSidebarOpen((s) => !s),
      set: setSidebarOpen,
    }),
    [sidebarOpen]
  );

  return <SidebarCtx.Provider value={api}>{children}</SidebarCtx.Provider>;
};

export const useSidebar = () => {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return ctx;
};
