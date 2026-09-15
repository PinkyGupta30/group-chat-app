// ======================================
// GET HTML ELEMENTS
// ======================================

const messageForm =
    document.getElementById("messageForm");


const messageInput =
    document.getElementById("messageInput");


const messages =
    document.getElementById("messages");


// Personal chat

const userEmailInput =
    document.getElementById("userEmailInput");


const joinRoomBtn =
    document.getElementById("joinRoomBtn");


const roomStatus =
    document.getElementById("roomStatus");


// Group chat

const groupNameInput =
    document.getElementById("groupNameInput");


const joinGroupBtn =
    document.getElementById("joinGroupBtn");


const leaveGroupBtn =
    document.getElementById("leaveGroupBtn");


const groupStatus =
    document.getElementById("groupStatus");


// Media

const mediaInput =
    document.getElementById("mediaInput");


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

function createRoomId(
    email1,
    email2
) {

    return [
        email1,
        email2
    ]
        .sort()
        .join("-");

}


// ======================================
// CONNECT SOCKET.IO
// ======================================

const socket =
    io(
        "http://localhost:3000",
        {

            auth: {

                email:
                    userEmail

            }

        }
    );


// ======================================
// CONNECTED
// ======================================

socket.on(
    "connect",
    () => {

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

    }
);


// ======================================
// CONNECTION ERROR
// ======================================

socket.on(
    "connect_error",
    (error) => {

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

    }
);


// ======================================
// DISCONNECT
// ======================================

socket.on(
    "disconnect",
    () => {

        console.log(
            "Socket.IO connection closed"
        );

    }
);


// ======================================
// NORMAL GROUP MESSAGE
// ======================================

socket.on(
    "message",
    (chat) => {

        console.log(
            "Message received:",
            chat
        );

        displayMessage(chat);

    }
);


// ======================================
// PERSONAL MESSAGE
// ======================================

socket.on(
    "new-message",
    (data) => {

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

    }
);


// ======================================
// GROUP MESSAGE
// ======================================

socket.on(
    "group_message",
    (data) => {

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

    }
);


// ======================================
// MEDIA MESSAGE
// ======================================

socket.on(
    "media-message",
    (data) => {

        console.log(
            "Media received:",
            data
        );


        displayMediaMessage(data);

    }
);


// ======================================
// JOIN PERSONAL CHAT
// ======================================

if (joinRoomBtn) {

    joinRoomBtn.addEventListener(
        "click",
        async () => {

            const targetEmail =
                userEmailInput.value.trim();


            if (!targetEmail) {

                alert(
                    "Please enter a user email"
                );

                return;

            }


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
                        "User not found"
                    );

                    return;

                }


                currentRoom =
                    createRoomId(
                        userEmail,
                        targetEmail
                    );


                socket.emit(
                    "join_room",
                    currentRoom
                );


                console.log(
                    "Joined personal chat:",
                    currentRoom
                );


                if (roomStatus) {

                    roomStatus.textContent =
                        `Personal chat started with ${targetEmail}`;

                }

            }
            catch (error) {

                console.error(
                    "Error checking user:",
                    error
                );


                alert(
                    "Unable to check user"
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


            if (!groupName) {

                alert(
                    "Please enter a group name"
                );

                return;

            }


            if (
                currentGroup &&
                currentGroup !== groupName
            ) {

                socket.emit(
                    "leave_group",
                    currentGroup
                );

            }


            currentGroup =
                groupName;


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

                    }
                    else {

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


            if (groupStatus) {

                groupStatus.textContent =
                    `Left group: ${currentGroup}`;

            }


            currentGroup = null;

        }
    );

}


// ======================================
// DISPLAY NORMAL MESSAGE
// ======================================

function displayMessage(chat) {

    const message =
        document.createElement("div");


    message.classList.add(
        "message"
    );


    const messageTime =
        new Date(
            chat.created_at ||
            Date.now()
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


    message
        .querySelector(
            ".message-user"
        )
        .textContent =
            chat.sender ||
            chat.user_id ||
            "User";


    message
        .querySelector(
            ".message-text"
        )
        .textContent =
            chat.message;


    messages.appendChild(
        message
    );


    messages.scrollTop =
        messages.scrollHeight;

}


// ======================================
// DISPLAY MEDIA MESSAGE
// ======================================

function displayMediaMessage(data) {

    const message =
        document.createElement("div");


    message.classList.add(
        "message"
    );


    const time =
        new Date().toLocaleTimeString(
            [],
            {

                hour:
                    "2-digit",

                minute:
                    "2-digit"

            }
        );


    const userDiv =
        document.createElement("div");


    userDiv.className =
        "message-user";


    userDiv.textContent =
        data.sender;


    message.appendChild(
        userDiv
    );


    // IMAGE

    if (
        data.fileType &&
        data.fileType.startsWith(
            "image/"
        )
    ) {

        const image =
            document.createElement("img");


        image.src =
            data.url;


        image.alt =
            data.fileName;


        image.className =
            "media-image";


        message.appendChild(
            image
        );

    }


    // VIDEO

    else if (
        data.fileType &&
        data.fileType.startsWith(
            "video/"
        )
    ) {

        const video =
            document.createElement("video");


        video.controls =
            true;


        video.className =
            "media-video";


        const source =
            document.createElement("source");


        source.src =
            data.url;


        source.type =
            data.fileType;


        video.appendChild(
            source
        );


        message.appendChild(
            video
        );

    }


    // OTHER FILE

    else {

        const link =
            document.createElement("a");


        link.href =
            data.url;


        link.target =
            "_blank";


        link.textContent =
            `Open ${data.fileName}`;


        message.appendChild(
            link
        );

    }


    const timeDiv =
        document.createElement("div");


    timeDiv.className =
        "message-time";


    timeDiv.textContent =
        time;


    message.appendChild(
        timeDiv
    );


    messages.appendChild(
        message
    );


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


        data.forEach(
            (chat) => {

                displayMessage(
                    chat
                );

            }
        );


        messages.scrollTop =
            messages.scrollHeight;

    }
    catch (error) {

        console.error(
            "Error loading messages:",
            error
        );

    }

}


loadMessages();


// ======================================
// SEND MESSAGE / MEDIA
// ======================================

messageForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const messageText =
            messageInput.value.trim();


        // ==================================
        // MEDIA UPLOAD
        // ==================================

        if (
            mediaInput &&
            mediaInput.files.length > 0
        ) {

            const file =
                mediaInput.files[0];


            const roomName =
                currentGroup ||
                currentRoom;


            if (!roomName) {

                alert(
                    "Please join a group or personal chat first."
                );

                return;

            }


            console.log(
                "Uploading file:",
                file.name
            );


            const formData =
                new FormData();


            formData.append(
                "media",
                file
            );


            formData.append(
                "roomName",
                roomName
            );


            formData.append(
                "sender",
                userEmail
            );


            try {

                const response =
                    await fetch(
                        "/api/media/upload",
                        {

                            method:
                                "POST",

                            body:
                                formData

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Upload response:",
                    data
                );


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Upload failed"
                    );

                    return;

                }


                mediaInput.value =
                    "";


                messageInput.value =
                    "";


            }
            catch (error) {

                console.error(
                    "Upload error:",
                    error
                );


                alert(
                    "Failed to upload file"
                );

            }


            return;

        }


        // ==================================
        // EMPTY TEXT
        // ==================================

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


            messageInput.value =
                "";


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


            messageInput.value =
                "";


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

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

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

            }


            messageInput.value =
                "";


            messageInput.focus();

        }
        catch (error) {

            console.error(
                "Error sending message:",
                error
            );

        }

    }
);