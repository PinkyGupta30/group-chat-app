const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");


// Get messages from database
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

            const message = document.createElement("div");

            message.classList.add("message", "sent");

            const messageTime = new Date(chat.created_at)
                .toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });

            message.innerHTML = `
                <div class="message-text">
                    ${chat.message}
                </div>

                <div class="message-time">
                    ${messageTime}
                </div>
            `;

            messages.appendChild(message);
        });

        messages.scrollTop = messages.scrollHeight;

    } catch (error) {

        console.error("Error loading messages:", error);

    }
}


// Load messages when chat page opens
loadMessages();


// Send message
messageForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const messageText = messageInput.value.trim();

    if (!messageText) {
        return;
    }

    const userId = 1;

    try {

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


        // Display newly sent message
        const message = document.createElement("div");

        message.classList.add("message", "sent");

        const currentTime = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        message.innerHTML = `
            <div class="message-text">
                ${messageText}
            </div>

            <div class="message-time">
                ${currentTime}
            </div>
        `;

        messages.appendChild(message);

        messages.scrollTop = messages.scrollHeight;

        messageInput.value = "";

        messageInput.focus();

    } catch (error) {

        console.error("Error sending message:", error);

    }
});