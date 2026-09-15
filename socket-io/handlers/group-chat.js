// Store group members
const groupMembers = new Map();


module.exports = (io, socket) => {

    // ======================================
    // CREATE / JOIN GROUP
    // ======================================

    socket.on("join_group", (groupName, callback) => {

        // Validate group name
        if (
            typeof groupName !== "string" ||
            !groupName.trim()
        ) {

            if (callback) {
                callback({
                    success: false,
                    message: "Group name is required"
                });
            }

            return;
        }


        groupName = groupName.trim();


        // Join Socket.IO room
        socket.join(groupName);


        // Track user in the group
        if (!groupMembers.has(groupName)) {
            groupMembers.set(groupName, new Map());
        }

        groupMembers
            .get(groupName)
            .set(socket.id, socket.user.email);


        console.log(
            socket.user.email,
            "joined group:",
            groupName
        );


        // Acknowledgement
        if (callback) {
            callback({
                success: true,
                message: `Joined group ${groupName}`,
                groupName: groupName
            });
        }

    });


    // ======================================
    // GROUP MESSAGE
    // ======================================

    socket.on(
        "group_message",
        ({ message, groupName }, callback) => {

            // Validate data
            if (
                typeof message !== "string" ||
                !message.trim()
            ) {

                if (callback) {
                    callback({
                        success: false,
                        message: "Message is required"
                    });
                }

                return;
            }


            if (
                typeof groupName !== "string" ||
                !groupName.trim()
            ) {

                if (callback) {
                    callback({
                        success: false,
                        message: "Group name is required"
                    });
                }

                return;
            }


            message = message.trim();
            groupName = groupName.trim();


            // Send only to the group
            io.to(groupName).emit("group_message", {

                username: socket.user.email,

                message: message,

                groupName: groupName

            });


            console.log(
                "Group message from:",
                socket.user.email
            );

            console.log(
                "Group:",
                groupName
            );

            console.log(
                "Message:",
                message
            );


            // Acknowledgement
            if (callback) {
                callback({
                    success: true
                });
            }

        }
    );


    // ======================================
    // LEAVE GROUP
    // ======================================

    socket.on("leave_group", (groupName) => {

        if (
            typeof groupName !== "string" ||
            !groupName.trim()
        ) {
            return;
        }


        groupName = groupName.trim();


        socket.leave(groupName);


        // Remove user from tracking
        if (groupMembers.has(groupName)) {

            groupMembers
                .get(groupName)
                .delete(socket.id);


            // Delete empty group
            if (
                groupMembers
                    .get(groupName)
                    .size === 0
            ) {

                groupMembers.delete(groupName);

            }

        }


        console.log(
            socket.user.email,
            "left group:",
            groupName
        );

    });


    // ======================================
    // DISCONNECT CLEANUP
    // ======================================

    socket.on("disconnect", () => {

        for (const [
            groupName,
            members
        ] of groupMembers.entries()) {

            members.delete(socket.id);


            // Remove empty groups
            if (members.size === 0) {

                groupMembers.delete(groupName);

            }

        }

    });

};