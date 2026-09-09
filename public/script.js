const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const logoutBtn = document.getElementById("logoutBtn");


/* Send Message */

messageForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const messageText = messageInput.value.trim();

    if (!messageText) {
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

    /* Automatically scroll to latest message */

    messages.scrollTop = messages.scrollHeight;

    /* Clear input */

    messageInput.value = "";

    messageInput.focus();
});


/* Logout */

logoutBtn.addEventListener("click", () => {

    window.location.href = "/login.html";

});