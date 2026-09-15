module.exports = (socket, next) => {
    const email = socket.handshake.auth.email;

    if (!email) {
        console.log("Socket connection rejected: Email missing");
        return next(new Error("Authentication required"));
    }

    socket.user = {
        email: email
    };

    console.log("Socket authentication successful:", email);

    next();
};