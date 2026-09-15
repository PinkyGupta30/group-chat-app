module.exports = (io, socket) => {

    socket.on("message", (data) => {
        console.log("Message received from:", socket.user.email);
        console.log("Message:", data);

        const messageData = {
            ...data,
            sender: socket.user.email,
            socketId: socket.id
        };

        io.emit("message", messageData);
    });

};