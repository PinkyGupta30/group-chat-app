module.exports = (io, socket) => {

    // Join a personal chat room
    socket.on("join_room", (roomName) => {
        socket.join(roomName);

        console.log(
            socket.user.email,
            "joined room:",
            roomName
        );
    });

    // Send a message to a specific room
    socket.on("new-message", ({ message, roomName }) => {

        console.log(
            "User",
            socket.user.email,
            "said:",
            message
        );

        io.to(roomName).emit("new-message", {
            username: socket.user.email,
            message: message
        });
    });

};