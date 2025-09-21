import React from "react";
import ReactDOM from "react-dom";
import { useChat } from "../context/ChatContext";
import LLMAssistant from "./LLMAssistant";
import "../css/chat.css";

export default function ChatSheet() {
  const { open, closeChat } = useChat();
  if (!open) return null;

  const modal = (
    <div className="nb-chat-overlay" onClick={closeChat} role="dialog" aria-modal="true">
      <div className="nb-chat-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="nb-chat-header">
          <span>Info Assistant</span>
          <button className="nb-chat-close" onClick={closeChat} aria-label="Close">×</button>
        </div>
        <div className="nb-chat-body">
          <LLMAssistant compact />
        </div>
      </div>
    </div>
  );

  // render outside any page container so it can’t be clipped
  return ReactDOM.createPortal(modal, document.body);
}
