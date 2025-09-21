import React, { useState } from "react";
import axios from "axios";
import "../css/llmAssistant.css";

/**
 * Reusable chat box.
 * Use <LLMAssistant /> in the desktop panel and <LLMAssistant compact />
 * inside the mobile sheet. Both call the same API and render the same bubbles.
 */
const LLMAssistant = ({ compact = false }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        "https://ml.dharaviambassador.me/api/chat",
        { query: q }
      );
      setAnswer(data?.response || "No response received.");
    } catch (err) {
      console.error("LLM API error:", err);
      setAnswer("Error fetching response. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`llm-panel ${compact ? "llm-panel--compact" : ""}`}>
      {!compact && <h2 className="llm-title">LLM Assistant</h2>}

      <div className="llm-response">
        {question && <div className="llm-bubble user">{question}</div>}
        {answer && <div className="llm-bubble assistant">{answer}</div>}
      </div>

      <textarea
        className="llm-input"
        placeholder="Ask something about these structures…"
        rows={compact ? 5 : 6}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            ask();
          }
        }}
      />

      <button className="llm-btn" onClick={ask} disabled={loading}>
        {loading ? "Thinking..." : "Send"}
      </button>
    </div>
  );
};

export default LLMAssistant;
