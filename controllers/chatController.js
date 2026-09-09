const db = require("../config/database");

exports.sendMessage = (req, res) => {

    const { user_id, message } = req.body || {};

    // Validate input
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