# ◈ Swario — Real-time Chat App

A full-stack real-time chat application built with **ASP.NET Core + SignalR** (backend)
and **Vite + React** (frontend).

---

## Folder Structure

```
ChatApp/
├── backend/
│   └── ChatApp/
│       ├── ChatApp.csproj          # .NET project file
│       ├── Program.cs              # App entry point — registers SignalR & CORS
│       ├── appsettings.json        # Config (port = 5000)
│       ├── Hubs/
│       │   └── ChatHub.cs          # SignalR hub — handles all real-time events
│       └── Models/
│           └── ChatMessage.cs      # Message data model
│
└── frontend/
    ├── index.html                  # Vite HTML entry point
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx                # React root
        ├── App.jsx                 # Main component (join screen + chat screen)
        ├── index.css               # Global styles
        ├── hooks/
        │   └── useChat.js          # Custom hook — manages SignalR connection
        └── components/
            └── MessageBubble.jsx   # Single message renderer
```

---

## Prerequisites

| Tool           | Version   | Install link |
|----------------|-----------|--------------|
| .NET SDK       | 8.0+      | https://dotnet.microsoft.com/download |
| Node.js        | 18+       | https://nodejs.org |
| npm            | 9+        | Comes with Node.js |

---

## Setup & Running

### 1 — Start the Backend

```bash
cd ChatApp/backend
dotnet run
```

You should see:
```
Now listening on: http://localhost:5000
```

> The SignalR hub is now live at `ws://localhost:5000/hubs/chat`

---

### 2 — Start the Frontend (in a new terminal)

```bash
cd ChatApp/frontend
npm install          # Install dependencies (first time only)
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXXms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

### 3 — Test with Multiple Users

Open **two browser tabs** (or different browsers) at `http://localhost:5173`.
Give each a different username and start chatting — messages appear in real time!

---

## How It Works — Key Parts Explained

### Backend

#### `ChatHub.cs`
The heart of the backend. A `Hub` is a SignalR class where:
- Each **method** can be called by any connected client (`Clients.Caller.SendAsync`)
- You can broadcast to **all clients** via `Clients.All.SendAsync`
- `OnDisconnectedAsync` fires automatically when a browser tab closes

```csharp
// Client calls this:  connection.invoke("SendMessage", username, text)
public async Task SendMessage(string username, string message)
{
    var chatMessage = new ChatMessage { Username = username, Message = message };
    StoreMessage(chatMessage);
    await Clients.All.SendAsync("ReceiveMessage", chatMessage); // push to everyone
}
```

#### `Program.cs`
Two critical registrations:
1. **`AddSignalR()`** — enables the SignalR middleware
2. **`AddCors()`** — allows `localhost:5173` to connect (required for WebSockets cross-origin)

---

### Frontend

#### `useChat.js` (Custom Hook)
Encapsulates all SignalR logic:
- Builds a `HubConnection` using `@microsoft/signalr`
- `withAutomaticReconnect()` — silently reconnects if the server restarts
- `.on("ReceiveMessage", handler)` — listens for server pushes
- `connection.invoke("SendMessage", ...)` — calls a hub method

#### `App.jsx`
Manages two screens:
- **Join screen** — collects username, then triggers `useChat(username)`
- **Chat screen** — renders messages, handles send form

#### `MessageBubble.jsx`
Renders each message differently based on `msg.type`:
- `"message"` — chat bubble (right-aligned if own, left-aligned if others)
- `"join"` / `"leave"` — centered system notification

---

## Features Checklist

- [x] Real-time messaging via WebSockets (SignalR)
- [x] Username shown with each message
- [x] Timestamps on every message
- [x] Join/leave notifications
- [x] Message history on join (last 50 messages)
- [x] Auto-scroll to latest message
- [x] Connection status indicator (Connected / Reconnecting / Disconnected)
- [x] Auto-reconnect on network drop
- [x] Avatar with username initial + unique colour per user
- [x] In-memory message store (no database needed)

---

## Common Issues

| Problem | Solution |
|---|---|
| `CORS error` in browser console | Make sure the backend is running on port 5000 |
| `npm install` fails | Ensure Node.js ≥ 18 is installed |
| `dotnet` command not found | Install .NET 8 SDK from microsoft.com |
| Messages not appearing | Check both servers are running; look at browser DevTools Network tab |
