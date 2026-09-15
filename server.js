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
// SOCKET.IO CONNECTION
// ======================================

io.on("connection", (socket) => {

    console.log(
        "User connected through Socket.IO:",
        socket.id
    );


    // ==================================
    // RECEIVE MESSAGE FROM CLIENT
    // ==================================

    socket.on("message", (data) => {

        console.log(
            "New message received:",
            data
        );


        // ==============================
        // BROADCAST MESSAGE TO ALL USERS
        // ==============================

        io.emit(
            "message",
            data
        );

    });


    // ==================================
    // USER DISCONNECTED
    // ==================================

    socket.on("disconnect", () => {

        console.log(
            "User disconnected:",
            socket.id
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