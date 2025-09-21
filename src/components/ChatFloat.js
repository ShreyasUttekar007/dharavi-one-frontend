import React from "react";
import { useChat } from "../context/ChatContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import "../css/chatFab.css";

export default function ChatFloat() {
  const { toggle } = useChat();
  return (
    <button
      className="nb-chat-fab"
      onClick={toggle}
      aria-label="Open assistant"
      title="Assistant"
    >
      <FontAwesomeIcon icon={faComments} />
    </button>
  );
}
