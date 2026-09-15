const { Server } = require("socket.io");

const socketMiddleware = require("./middleware");
const chatHandler = require("./handlers/chat");
const personalChatHandler = require("./handlers/personal-chat");
const groupChatHandler = require("./handlers/group-chat");


function initializeSocket(server) {

    const io = new Server(server);


    // ======================================
    // SOCKET.IO AUTHENTICATION
    // ======================================

    io.use(socketMiddleware);


    // ======================================
    // CONNECTION
    // ======================================

    io.on("connection", (socket) => {

        console.log(
            "Authenticated user connected:",
            socket.user.email
        );

        console.log(
            "Socket ID:",
            socket.id
        );


        // ==================================
        // NORMAL CHAT
        // ==================================

        chatHandler(io, socket);


        // ==================================
        // PERSONAL CHAT
        // ==================================

        personalChatHandler(io, socket);


        // ==================================
        // GROUP CHAT
        // ==================================

        groupChatHandler(io, socket);


        // ==================================
        // DISCONNECT
        // ==================================

        socket.on("disconnect", () => {

            console.log(
                "User disconnected:",
                socket.user.email
            );

        });


        // ==================================
        // SOCKET ERROR
        // ==================================

        socket.on("error", (error) => {

            console.error(
                "Socket.IO error:",
                error
            );

        });

    });


    return io;

}


module.exports = initializeSocket;