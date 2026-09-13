const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const PORT = 3000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server);

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


// ======================================
// SOCKET.IO
// ======================================

io.on("connection", (socket) => {

    console.log("User connected through Socket.IO:", socket.id);

    // Receive message from frontend
    socket.on("message", (data) => {

        console.log("New message received:", data);

        // Send message to all connected users
        io.emit("message", data);

    });

    // User disconnected
    socket.on("disconnect", () => {

        console.log("User disconnected:", socket.id);

    });

});


// ======================================
// START SERVER
// ======================================

server.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});