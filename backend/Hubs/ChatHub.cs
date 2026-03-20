using backend.Models;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Hubs;

public class ChatHub : Hub
{
    // In-memory store shared across all hub instances
    private static readonly List<ChatMessage> _messageHistory = new();
    private static readonly object _lock = new();

    // Called when a user connects and provides their username
    public async Task JoinChat(string username)
    {
        // Store username in the connection context so we can use it on disconnect
        Context.Items["username"] = username;

        // Send the last 50 messages to the newly joined user
        List<ChatMessage> history;
        lock (_lock)
        {
            history = _messageHistory.TakeLast(50).ToList();
        }
        await Clients.Caller.SendAsync("ReceiveHistory", history);

        // Broadcast join notification to everyone
        var joinMessage = new ChatMessage
        {
            Username = username,
            Message = $"{username} joined the chat",
            Type = "join"
        };
        StoreMessage(joinMessage);
        await Clients.All.SendAsync("ReceiveMessage", joinMessage);
    }

    // Called when a user sends a chat message
    public async Task SendMessage(string username, string message)
    {
        var chatMessage = new ChatMessage
        {
            Username = username,
            Message = message,
            Type = "message"
        };
        StoreMessage(chatMessage);

        // Broadcast to ALL connected clients including the sender
        await Clients.All.SendAsync("ReceiveMessage", chatMessage);
    }

    // Called automatically by SignalR when a connection drops
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Context.Items["username"] is string username)
        {
            var leaveMessage = new ChatMessage
            {
                Username = username,
                Message = $"{username} left the chat",
                Type = "leave"
            };
            StoreMessage(leaveMessage);
            await Clients.All.SendAsync("ReceiveMessage", leaveMessage);
        }
        await base.OnDisconnectedAsync(exception);
    }

    private static void StoreMessage(ChatMessage msg)
    {
        lock (_lock)
        {
            _messageHistory.Add(msg);
            // Keep only last 200 messages in memory
            if (_messageHistory.Count > 200)
                _messageHistory.RemoveAt(0);
        }
    }
}