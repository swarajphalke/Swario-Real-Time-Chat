import { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";

const HUB_URL = "http://localhost:5000/hubs/chat";

export function useChat(username) {
  const connectionRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connectionState, setConnectionState] = useState("Disconnected");

  // Add a message to the local list
  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() }]);
  }, []);

  useEffect(() => {
    if (!username) return;

    // Build the SignalR connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect() // auto-retry on network blip
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // Handle incoming single message
    connection.on("ReceiveMessage", (msg) => addMessage(msg));

    // Handle message history sent on join
    connection.on("ReceiveHistory", (history) => {
      setMessages(history.map((m) => ({ ...m, id: crypto.randomUUID() })));
    });

    // Track connection lifecycle for UI feedback
    connection.onreconnecting(() => setConnectionState("Reconnecting"));
    connection.onreconnected(() => setConnectionState("Connected"));
    connection.onclose(() => setConnectionState("Disconnected"));

    // Start and announce join
    connection
      .start()
      .then(() => {
        setConnectionState("Connected");
        return connection.invoke("JoinChat", username);
      })
      .catch((err) => {
        console.error("SignalR connection error:", err);
        setConnectionState("Disconnected");
      });

    return () => {
      connection.stop();
    };
  }, [username, addMessage]);

  // Send a message via SignalR
  const sendMessage = useCallback(
    async (text) => {
      if (
        connectionRef.current?.state === signalR.HubConnectionState.Connected
      ) {
        await connectionRef.current.invoke("SendMessage", username, text);
      }
    },
    [username],
  );

  return { messages, sendMessage, connectionState };
}
