const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");


// ======================================
// CONNECT TO WEBSOCKET
// ======================================

const socket = new WebSocket("ws://localhost:3000");


// WebSocket connected
socket.addEventListener("open", () => {
    console.log("Connected to WebSocket server");
});


// WebSocket connection error
socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
});


// WebSocket disconnected
socket.addEventListener("close", () => {
    console.log("WebSocket connection closed");
});


// ======================================
// RECEIVE LIVE MESSAGE
// ======================================

socket.addEventListener("message", (event) => {

    try {

        const chat = JSON.parse(event.data);

        displayMessage(chat);

    } catch (error) {

        console.error("Error receiving WebSocket message:", error);

    }

});


// ======================================
// DISPLAY MESSAGE
// ======================================

function displayMessage(chat) {

    const message = document.createElement("div");

    message.classList.add("message", "sent");


    const messageTime = new Date(
        chat.created_at || Date.now()
    ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });


    message.innerHTML = `
        <div class="message-text"></div>

        <div class="message-time">
            ${messageTime}
        </div>
    `;


    // Add message safely
    message.querySelector(".message-text").textContent =
        chat.message;


    messages.appendChild(message);

    messages.scrollTop = messages.scrollHeight;
}


// ======================================
// GET OLD MESSAGES FROM DATABASE
// ======================================

async function loadMessages() {

    try {

        const response = await fetch("/api/chat/messages");

        const data = await response.json();


        if (!response.ok) {

            console.error("Failed to load messages:", data);

            return;
        }


        messages.innerHTML = "";


        data.forEach((chat) => {

            displayMessage(chat);

        });


        messages.scrollTop = messages.scrollHeight;


    } catch (error) {

        console.error("Error loading messages:", error);

    }
}


// Load old messages when page opens
loadMessages();


// ======================================
// SEND MESSAGE
// ======================================

messageForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const messageText = messageInput.value.trim();


    if (!messageText) {
        return;
    }


    // Temporary user ID
    const userId = 1;


    try {

        // Save message to database
        const response = await fetch("/api/chat/messages", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                user_id: userId,
                message: messageText
            })

        });


        const data = await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        // ======================================
        // SEND SAVED MESSAGE THROUGH WEBSOCKET
        // ======================================

        if (socket.readyState === WebSocket.OPEN) {

            socket.send(JSON.stringify(data));

        } else {

            console.error("WebSocket is not connected");

        }


        // Clear input
        messageInput.value = "";

        messageInput.focus();


    } catch (error) {

        console.error("Error sending message:", error);

    }

});