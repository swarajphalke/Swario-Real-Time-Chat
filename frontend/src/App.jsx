import { useState, useRef, useEffect } from "react";
import { useChat } from "./hooks/useChat";
import MessageBubble from "./components/MessageBubble";

export default function App() {
  const [inputName, setInputName] = useState("");
  const [username, setUsername] = useState("");
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  const { messages, sendMessage, connectionState } = useChat(username);

  // Auto-scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleJoin(e) {
    e.preventDefault();
    const name = inputName.trim();
    if (name.length >= 2) setUsername(name);
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || connectionState !== "Connected") return;
    await sendMessage(text);
    setDraft("");
  }

  // ── Join Screen ──────────────────────────────────────────────────────────────
  if (!username) {
    return (
      <div className="join-screen">
        <div className="join-card">
          <div className="join-logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Swario</span>
          </div>
          <p className="join-sub">Real-time chat. No signup required.</p>
          <form onSubmit={handleJoin} className="join-form">
            <input
              autoFocus
              className="join-input"
              placeholder="Choose a username…"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              maxLength={20}
            />
            <button
              type="submit"
              className="join-btn"
              disabled={inputName.trim().length < 2}
            >
              Enter Chat →
            </button>
          </form>
          <p className="join-hint">At least 2 characters</p>
        </div>
      </div>
    );
  }

  // ── Chat Screen ──────────────────────────────────────────────────────────────
  const statusColor =
    connectionState === "Connected"
      ? "#4ade80"
      : connectionState === "Reconnecting"
        ? "#fbbf24"
        : "#f87171";

  return (
    <div className="chat-screen">
      {/* Header */}
      <header className="chat-header">
        <div className="header-left">
          <span className="logo-icon small">◈</span>
          <span className="logo-text small">Swario</span>
        </div>
        <div className="header-center">
          <span className="status-dot" style={{ background: statusColor }} />
          <span className="status-label">{connectionState}</span>
        </div>
        <div className="header-right">
          <span className="you-badge">{username}</span>
        </div>
      </header>

      {/* Message list */}
      <main className="message-list">
        {messages.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">◈</span>
            <p>No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.username === username}
          />
        ))}
        <div ref={bottomRef} />
      </main>

      {/* Input bar */}
      <footer className="chat-footer">
        <form onSubmit={handleSend} className="input-row">
          <input
            autoFocus
            className="msg-input"
            placeholder={
              connectionState === "Connected"
                ? "Type a message…"
                : "Connecting…"
            }
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={connectionState !== "Connected"}
            maxLength={500}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!draft.trim() || connectionState !== "Connected"}
          >
            Send ↑
          </button>
        </form>
      </footer>
    </div>
  );
}
