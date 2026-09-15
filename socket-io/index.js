const { Server } = require("socket.io");

const socketMiddleware = require("./middleware");
const chatHandler = require("./handlers/chat");
const personalChatHandler = require("./handlers/personal-chat");

function initializeSocket(server) {
    const io = new Server(server);

    // Socket.IO authentication middleware
    io.use(socketMiddleware);

    // Handle client connections
    io.on("connection", (socket) => {
        console.log("Authenticated user connected:", socket.user.email);
        console.log("Socket ID:", socket.id);

        // Chat events
        chatHandler(io, socket);
        personalChatHandler(io, socket);

        // Disconnect
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.user.email);
        });

        // Socket error
        socket.on("error", (error) => {
            console.error("Socket.IO error:", error);
        });
    });

    return io;
}

module.exports = initializeSocket;