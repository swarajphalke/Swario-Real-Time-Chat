using ChatApp.Hubs;

var builder = WebApplication.CreateBuilder(args);

// ✅ FIX: Bind to Render port properly
builder.WebHost.ConfigureKestrel(options =>
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
    options.ListenAnyIP(int.Parse(port));
});

// 🔧 Services
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .WithOrigins("https://swario-real-time-chat.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// 🚀 App pipeline
var app = builder.Build();

app.UseCors("ReactPolicy");

// SignalR Hub
app.MapHub<ChatHub>("/hubs/chat");

// Health check
app.MapGet("/", () => "ChatApp backend is running");

// Run app
app.Run();