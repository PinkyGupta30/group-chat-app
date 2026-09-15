const messageForm =
    document.getElementById("messageForm");

const messageInput =
    document.getElementById("messageInput");

const messages =
    document.getElementById("messages");


// ======================================
// GET LOGGED-IN USER
// ======================================

const userEmail =
    localStorage.getItem("userEmail");


// ======================================
// CHECK USER AUTHENTICATION
// ======================================

if (!userEmail) {

    alert(
        "Please login first"
    );

    window.location.href =
        "login.html";

}


// ======================================
// CONNECT TO SOCKET.IO
// WITH AUTHENTICATION
// ======================================

const socket = io(
    "http://localhost:3000",
    {
        auth: {
            email: userEmail
        }
    }
);


// ======================================
// SOCKET.IO CONNECTED
// ======================================

socket.on("connect", () => {

    console.log(
        "Connected to Socket.IO server"
    );

    console.log(
        "Socket ID:",
        socket.id
    );

    console.log(
        "Authenticated user:",
        userEmail
    );

});


// ======================================
// SOCKET.IO AUTH ERROR
// ======================================

socket.on("connect_error", (error) => {

    console.error(
        "Socket.IO connection error:",
        error.message
    );


    if (
        error.message ===
        "Authentication required"
    ) {

        localStorage.removeItem(
            "userEmail"
        );

        window.location.href =
            "login.html";

    }

});


// ======================================
// SOCKET.IO DISCONNECTED
// ======================================

socket.on("disconnect", () => {

    console.log(
        "Socket.IO connection closed"
    );

});


// ======================================
// RECEIVE LIVE MESSAGE
// ======================================

socket.on("message", (chat) => {

    console.log(
        "Message received:",
        chat
    );

    displayMessage(chat);

});


// ======================================
// DISPLAY MESSAGE
// ======================================

function displayMessage(chat) {

    const message =
        document.createElement("div");


    message.classList.add(
        "message",
        "sent"
    );


    const messageTime =
        new Date(
            chat.created_at || Date.now()
        ).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    message.innerHTML = `

        <div class="message-user"></div>

        <div class="message-text"></div>

        <div class="message-time">
            ${messageTime}
        </div>

    `;


    // Display sender safely
    message
        .querySelector(".message-user")
        .textContent =
            chat.sender || chat.user_id || "User";


    // Display message safely
    message
        .querySelector(".message-text")
        .textContent =
            chat.message;


    messages.appendChild(message);


    messages.scrollTop =
        messages.scrollHeight;

}


// ======================================
// LOAD OLD MESSAGES
// ======================================

async function loadMessages() {

    try {

        const response =
            await fetch(
                "/api/chat/messages"
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Failed to load messages:",
                data
            );

            return;

        }


        messages.innerHTML = "";


        data.forEach((chat) => {

            displayMessage(chat);

        });


        messages.scrollTop =
            messages.scrollHeight;


    } catch (error) {

        console.error(
            "Error loading messages:",
            error
        );

    }

}


// ======================================
// LOAD OLD MESSAGES WHEN PAGE OPENS
// ======================================

loadMessages();


// ======================================
// SEND MESSAGE
// ======================================

messageForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const messageText =
            messageInput.value.trim();


        if (!messageText) {

            return;

        }


        // ==================================
        // TEMPORARY USER ID
        // ==================================

        const userId = 1;


        try {

            // ==================================
            // SAVE MESSAGE TO DATABASE
            // ==================================

            const response =
                await fetch(
                    "/api/chat/messages",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            user_id: userId,

                            message: messageText

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message
                );

                return;

            }


            // ==================================
            // SEND THROUGH SOCKET.IO
            // ==================================

            if (socket.connected) {

                socket.emit(
                    "message",
                    data
                );

            } else {

                console.error(
                    "Socket.IO is not connected"
                );

            }


            // Clear input
            messageInput.value = "";

            messageInput.focus();


        } catch (error) {

            console.error(
                "Error sending message:",
                error
            );

        }

    }
);