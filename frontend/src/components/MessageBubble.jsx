import React from "react";

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Generate a consistent hue from a username string
function usernameColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 65%)`;
}

export default function MessageBubble({ msg, isOwn }) {
  if (msg.type === "join" || msg.type === "leave") {
    return (
      <div className="system-msg">
        <span
          className="system-dot"
          style={{ background: msg.type === "join" ? "#4ade80" : "#f87171" }}
        />
        {msg.message}
        <span className="system-time">{formatTime(msg.timestamp)}</span>
      </div>
    );
  }

  return (
    <div className={`bubble-row ${isOwn ? "own" : "other"}`}>
      {!isOwn && (
        <div
          className="avatar"
          style={{ background: usernameColor(msg.username) }}
        >
          {msg.username[0].toUpperCase()}
        </div>
      )}
      <div className="bubble-content">
        {!isOwn && (
          <span
            className="bubble-username"
            style={{ color: usernameColor(msg.username) }}
          >
            {msg.username}
          </span>
        )}
        <div className={`bubble ${isOwn ? "bubble-own" : "bubble-other"}`}>
          <p>{msg.message}</p>
          <span className="bubble-time">{formatTime(msg.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
