const db = require("../config/database");


// Save message
exports.sendMessage = (req, res) => {

    const { user_id, message } = req.body || {};

    if (!user_id || !message) {
        return res.status(400).json({
            message: "User ID and message are required"
        });
    }

    const sql = `
        INSERT INTO messages (user_id, message)
        VALUES (?, ?)
    `;

    db.query(sql, [user_id, message], (err, result) => {

        if (err) {
            console.error("Error saving message:", err);

            return res.status(500).json({
                message: "Failed to save message"
            });
        }

        return res.status(201).json({
            message: "Chat message saved successfully",
            messageId: result.insertId
        });
    });
};


// Get messages
exports.getMessages = (req, res) => {

    const sql = `
        SELECT id, user_id, message, created_at
        FROM messages
        ORDER BY created_at ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Error fetching messages:", err);

            return res.status(500).json({
                message: "Failed to fetch messages"
            });
        }

        return res.status(200).json(results);
    });
};