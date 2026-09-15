const express = require("express");
const multer = require("multer");

const router = express.Router();

const mediaController =
    require("../controllers/mediaControllers");

const upload =
    multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 50 * 1024 * 1024
        }
    });

router.post(
    "/upload",
    upload.single("media"),
    mediaController.uploadMedia
);

module.exports = router;