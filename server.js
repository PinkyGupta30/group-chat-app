const express = require("express");
const path = require("path");
const http = require("http");

const app = express();
const PORT = 3000;

const server = http.createServer(app);

// Initialize Socket.IO
const initializeSocket = require("./socket-io");
initializeSocket(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chat", chatRoutes);

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});