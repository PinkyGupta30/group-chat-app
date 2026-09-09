const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");

messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const messageText = messageInput.value.trim();

    if (!messageText) {
        return;
    }

    const userId = 1; // temporary user ID

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