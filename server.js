const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const app = express();

const PORT = 3000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Chat routes
const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chat", chatRoutes);

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "signup.html"));
});


// ===============================
// WebSocket
// ===============================

wss.on("connection", (socket) => {

    console.log("User connected through WebSocket");

    socket.on("message", (data) => {

        console.log("New message received:", data.toString());

        // Send message to all connected users
        wss.clients.forEach((client) => {

            if (client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
            }

        });
    });

    socket.on("close", () => {
        console.log("User disconnected");
    });

    socket.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
});


// Start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`WebSocket running at ws://localhost:${PORT}`);
});