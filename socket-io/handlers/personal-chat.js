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


    // Receive and send personal message
    socket.on("new-message", ({ message, roomName }) => {

        console.log(
            "User",
            socket.user.email,
            "said:",
            message
        );

        // Send message only to users in this room
        io.to(roomName).emit("new-message", {
            username: socket.user.email,
            message: message
        });
    });

};