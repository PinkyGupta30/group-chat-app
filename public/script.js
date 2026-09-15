// ======================================
// GET HTML ELEMENTS
// ======================================

const messageForm =
    document.getElementById("messageForm");

const messageInput =
    document.getElementById("messageInput");

const messages =
    document.getElementById("messages");


// Personal chat elements
const userEmailInput =
    document.getElementById("userEmailInput");

const joinRoomBtn =
    document.getElementById("joinRoomBtn");

const roomStatus =
    document.getElementById("roomStatus");


// Group chat elements
const groupNameInput =
    document.getElementById("groupNameInput");

const joinGroupBtn =
    document.getElementById("joinGroupBtn");

const leaveGroupBtn =
    document.getElementById("leaveGroupBtn");

const groupStatus =
    document.getElementById("groupStatus");


// ======================================
// GET LOGGED-IN USER
// ======================================

const userEmail =
    localStorage.getItem("userEmail");


// ======================================
// CHECK AUTHENTICATION
// ======================================

if (!userEmail) {

    alert("Please login first");

    window.location.href =
        "login.html";
}


// ======================================
// ROOM VARIABLES
// ======================================

let currentRoom = null;

let currentGroup = null;


// ======================================
// CREATE PERSONAL ROOM ID
// ======================================

function createRoomId(email1, email2) {

    return [email1, email2]
        .sort()
        .join("-");

}


// ======================================
// CONNECT TO SOCKET.IO
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
// SOCKET CONNECTED
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
// SOCKET AUTH ERROR
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
// SOCKET DISCONNECTED
// ======================================

socket.on("disconnect", () => {

    console.log(
        "Socket.IO connection closed"
    );

});


// ======================================
// NORMAL GROUP CHAT MESSAGE
// ======================================

socket.on("message", (chat) => {

    console.log(
        "Message received:",
        chat
    );

    displayMessage(chat);

});


// ======================================
// PERSONAL CHAT MESSAGE
// ======================================

socket.on("new-message", (data) => {

    console.log(
        "Personal message received:",
        data
    );

    displayMessage({

        sender:
            data.username,

        message:
            data.message,

        created_at:
            new Date()

    });

});


// ======================================
// GROUP CHAT MESSAGE
// ======================================

socket.on("group_message", (data) => {

    console.log(
        "Group message received:",
        data
    );


    displayMessage({

        sender:
            data.username,

        message:
            data.message,

        created_at:
            new Date()

    });

});


// ======================================
// JOIN PERSONAL CHAT
// ======================================

if (joinRoomBtn) {

    joinRoomBtn.addEventListener(
        "click",
        async () => {

            const targetEmail =
                userEmailInput.value.trim();


            // Check email
            if (!targetEmail) {

                alert(
                    "Please enter a user email"
                );

                return;
            }


            // Prevent self chat
            if (
                targetEmail ===
                userEmail
            ) {

                alert(
                    "You cannot chat with yourself"
                );

                return;
            }


            try {

                // Check user in database
                const response =
                    await fetch(
                        `/api/auth/check-user?email=${encodeURIComponent(targetEmail)}`
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.exists
                ) {

                    alert(
                        "User not found. Please enter a registered user's email."
                    );

                    return;
                }


                // Create room ID
                currentRoom =
                    createRoomId(
                        userEmail,
                        targetEmail
                    );


                // Leave current personal room
                if (currentRoom) {

                    socket.emit(
                        "leave_room",
                        currentRoom
                    );

                }


                // Join new personal room
                socket.emit(
                    "join_room",
                    currentRoom
                );


                console.log(
                    "Joined personal chat room:",
                    currentRoom
                );


                if (roomStatus) {

                    roomStatus.textContent =
                        `Personal chat started with ${targetEmail}`;

                }

            } catch (error) {

                console.error(
                    "Error checking user:",
                    error
                );

                alert(
                    "Unable to check user. Please try again."
                );

            }

        }
    );

}


// ======================================
// JOIN GROUP
// ======================================

if (joinGroupBtn) {

    joinGroupBtn.addEventListener(
        "click",
        () => {

            const groupName =
                groupNameInput.value.trim();


            // Validate group name
            if (!groupName) {

                alert(
                    "Please enter a group name"
                );

                return;
            }


            // Leave previous group
            if (
                currentGroup &&
                currentGroup !== groupName
            ) {

                socket.emit(
                    "leave_group",
                    currentGroup
                );

            }


            // Set current group
            currentGroup =
                groupName;


            // Join group
            socket.emit(
                "join_group",
                groupName,
                (response) => {

                    console.log(
                        "Join group response:",
                        response
                    );


                    if (
                        response &&
                        response.success
                    ) {

                        if (groupStatus) {

                            groupStatus.textContent =
                                `Joined group: ${groupName}`;

                        }

                    } else {

                        alert(
                            response?.message ||
                            "Unable to join group"
                        );

                    }

                }
            );


            console.log(
                "Joining group:",
                groupName
            );

        }
    );

}


// ======================================
// LEAVE GROUP
// ======================================

if (leaveGroupBtn) {

    leaveGroupBtn.addEventListener(
        "click",
        () => {

            if (!currentGroup) {

                alert(
                    "You are not currently in a group"
                );

                return;
            }


            socket.emit(
                "leave_group",
                currentGroup
            );


            console.log(
                "Left group:",
                currentGroup
            );


            if (groupStatus) {

                groupStatus.textContent =
                    `Left group: ${currentGroup}`;

            }


            currentGroup = null;

        }
    );

}


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
            chat.sender ||
            chat.user_id ||
            "User";


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
// LOAD OLD DATABASE MESSAGES
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
// LOAD OLD MESSAGES
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
        // GROUP CHAT
        // ==================================

        if (currentGroup) {

            if (!socket.connected) {

                console.error(
                    "Socket.IO is not connected"
                );

                return;
            }


            socket.emit(
                "group_message",
                {
                    message:
                        messageText,

                    groupName:
                        currentGroup
                },
                (response) => {

                    console.log(
                        "Group message response:",
                        response
                    );

                }
            );


            messageInput.value = "";

            messageInput.focus();

            return;

        }


        // ==================================
        // PERSONAL CHAT
        // ==================================

        if (currentRoom) {

            if (!socket.connected) {

                console.error(
                    "Socket.IO is not connected"
                );

                return;
            }


            socket.emit(
                "new-message",
                {
                    message:
                        messageText,

                    roomName:
                        currentRoom
                }
            );


            messageInput.value = "";

            messageInput.focus();

            return;

        }


        // ==================================
        // NORMAL GROUP CHAT
        // ==================================

        const userId = 1;


        try {

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

                            user_id:
                                userId,

                            message:
                                messageText

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