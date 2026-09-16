const express = require("express");
const path = require("path");
const http = require("http");
require("./jobs/archivedChats");

require("dotenv").config();

const app = express();
const PORT = 3000;

const server = http.createServer(app);


// ======================================
// INITIALIZE SOCKET.IO
// ======================================

const initializeSocket = require("./socket-io");

const io = initializeSocket(server);

app.set("io", io);


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
// SERVE FRONTEND
// ======================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ======================================
// AUTH ROUTES
// ======================================

const authRoutes =
    require("./routes/authRoutes");

app.use(
    "/api/auth",
    authRoutes
);


// ======================================
// CHAT ROUTES
// ======================================

const chatRoutes =
    require("./routes/chatRoutes");

app.use(
    "/api/chat",
    chatRoutes
);


// ======================================
// MEDIA ROUTES
// ======================================

const mediaRoutes =
    require("./routes/mediaRoutes");

app.use(
    "/api/media",
    mediaRoutes
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
// START SERVER
// ======================================

server.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);