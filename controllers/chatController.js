const db = require("../config/database");
const { getSuggestions } = require("../services/geminiService");


// ======================================
// SAVE MESSAGE
// ======================================

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

    db.query(
        sql,
        [user_id, message],
        (err, result) => {

            if (err) {

                console.error(
                    "Error saving message:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to save message"
                });

            }

            // ======================================
            // RETURN ACTUAL CHAT MESSAGE
            // ======================================

            const chatMessage = {

                id: result.insertId,

                user_id: user_id,

                message: message,

                created_at: new Date()

            };

            return res.status(201).json(
                chatMessage
            );

        }
    );

};


// ======================================
// GET MESSAGES
// ======================================

exports.getMessages = (req, res) => {

    const sql = `
        SELECT id, user_id, message, created_at
        FROM messages
        ORDER BY created_at ASC
    `;

    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.error(
                    "Error fetching messages:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to fetch messages"
                });

            }

            return res.status(200).json(
                results
            );

        }
    );

};


// ======================================
// AI SUGGESTIONS
// ======================================

exports.getAISuggestions = async (req, res) => {

    try {

        const { message } = req.body;

        if (!message || !message.trim()) {

            return res.status(400).json({
                message: "Message is required"
            });

        }

        const suggestions =
            await getSuggestions(message);

        return res.status(200).json(
            suggestions
        );

    } catch (error) {

        console.error(
            "Gemini AI error:",
            error
        );

        return res.status(500).json({
            message: "Failed to generate AI suggestions"
        });

    }

};