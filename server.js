const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const PORT = 3000;


// ======================================
// CREATE HTTP SERVER
// ======================================

const server = http.createServer(app);


// ======================================
// CREATE SOCKET.IO SERVER
// ======================================

const io = new Server(server);


// ======================================
// MIDDLEWARE
// ======================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ======================================
// SERVE FRONTEND FILES
// ======================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ======================================
// AUTH ROUTES
// ======================================

const authRoutes = require("./routes/authRoutes");

app.use(
    "/api/auth",
    authRoutes
);


// ======================================
// CHAT ROUTES
// ======================================

const chatRoutes = require("./routes/chatRoutes");

app.use(
    "/api/chat",
    chatRoutes
);


// ======================================
// HOME PAGE
// ======================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "signup.html"
        )
    );

});


// ======================================
// SOCKET.IO AUTHENTICATION MIDDLEWARE
// ======================================

io.use((socket, next) => {

    // Get email sent by the frontend
    const email = socket.handshake.auth.email;


    // Check authentication
    if (!email) {

        console.log(
            "Socket connection rejected: Email missing"
        );

        return next(
            new Error("Authentication required")
        );

    }


    // Store authenticated user
    // inside the socket object
    socket.user = {
        email: email
    };


    console.log(
        "Socket authentication successful:",
        email
    );


    next();

});


// ======================================
// SOCKET.IO CONNECTION
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
    // RECEIVE MESSAGE
    // ==================================

    socket.on("message", (data) => {

        console.log(
            "Message received from:",
            socket.user.email
        );

        console.log(
            "Message:",
            data
        );


        // Add authenticated sender
        const messageData = {

            ...data,

            sender: socket.user.email

        };


        // Broadcast message to all users
        io.emit(
            "message",
            messageData
        );

    });


    // ==================================
    // USER DISCONNECTED
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


// ======================================
// START SERVER
// ======================================

server.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});