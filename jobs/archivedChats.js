const cron = require("node-cron");
const db = require("../config/database");

cron.schedule("0 0 * * *", () => {

    console.log("Starting chat archive job...");

    // Find messages older than 1 day
    const selectSql = `
        SELECT id, user_id, message, created_at
        FROM messages
        WHERE created_at < NOW() - INTERVAL 1 DAY
    `;

    db.query(selectSql, (err, messages) => {

        if (err) {
            console.error("Error finding old messages:", err);
            return;
        }

        if (messages.length === 0) {
            console.log("No old messages to archive.");
            return;
        }

        // Move messages to archived_messages
        const insertSql = `
            INSERT INTO archived_messages
            (id, user_id, message, created_at)
            VALUES ?
        `;

        const values = messages.map(chat => [
            chat.id,
            chat.user_id,
            chat.message,
            chat.created_at
        ]);

        db.query(insertSql, [values], (err) => {

            if (err) {
                console.error("Error archiving messages:", err);
                return;
            }

            console.log(
                `${messages.length} messages moved to archived_messages.`
            );

            // Delete old messages from messages table
            const deleteSql = `
                DELETE FROM messages
                WHERE created_at < NOW() - INTERVAL 1 DAY
            `;

            db.query(deleteSql, (err) => {

                if (err) {
                    console.error("Error deleting old messages:", err);
                    return;
                }

                console.log(
                    `${messages.length} old messages deleted from messages.`
                );

            });

        });

    });

});