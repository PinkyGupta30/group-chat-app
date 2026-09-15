const express = require("express");
const router = express.Router();

const db = require("../config/database");


// ======================================
// TEST ROUTE
// ======================================

router.get("/test", (req, res) => {

    res.json({
        message: "Auth routes working"
    });

});


// ======================================
// CHECK IF USER EXISTS
// ======================================

router.get("/check-user", (req, res) => {

    const email = req.query.email;

    // Check email was provided
    if (!email) {

        return res.status(400).json({
            message: "Email is required"
        });

    }


    const sql = `
        SELECT id, email
        FROM users
        WHERE email = ?
        LIMIT 1
    `;


    db.query(sql, [email], (err, results) => {

        if (err) {

            console.error(
                "Error checking user:",
                err
            );

            return res.status(500).json({
                message: "Failed to check user"
            });

        }


        // User does not exist
        if (results.length === 0) {

            return res.status(404).json({
                exists: false,
                message: "User not found"
            });

        }


        // User exists
        return res.status(200).json({
            exists: true,
            user: results[0]
        });

    });

});


module.exports = router;