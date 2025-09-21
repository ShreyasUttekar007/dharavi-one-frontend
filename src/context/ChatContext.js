import { createContext, useContext, useState, useCallback } from "react";

const ChatCtx = createContext(null);

export const ChatProvider = ({ children }) => {
  const [open, setOpen] = useState(false);              // ← closed by default

  const openChat   = useCallback(() => setOpen(true), []);
  const closeChat  = useCallback(() => setOpen(false), []);
  const toggleChat = useCallback(() => setOpen(v => !v), []);

  return (
    <ChatCtx.Provider value={{ open, openChat, closeChat, toggleChat }}>
      {children}
    </ChatCtx.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
};
