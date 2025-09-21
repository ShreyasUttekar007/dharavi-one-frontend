import React from "react";
import { useChat } from "../context/ChatContext";
import "../css/chat.css";

export default function ChatFab() {
  const { toggleChat } = useChat();
  return (
    <button className="nb-chat-fab" onClick={toggleChat} aria-label="Chat">
      💬
    </button>
  );
}
