const {
    uploadToS3
} = require("../config/s3");


exports.uploadMedia = async (req, res) => {

    try {

        // Check file
        if (!req.file) {

            return res.status(400).json({

                message:
                    "Please select a file"

            });

        }


        const {
            roomName,
            sender
        } = req.body;


        // Check room
        if (!roomName) {

            return res.status(400).json({

                message:
                    "Room name is required"

            });

        }


        // Check sender
        if (!sender) {

            return res.status(400).json({

                message:
                    "Sender is required"

            });

        }


        // Upload to S3
        const uploaded =
            await uploadToS3(req.file);


        console.log(
            "File uploaded to S3:",
            uploaded.url
        );


        // Get Socket.IO
        const io =
            req.app.get("io");


        // Broadcast media to room
        if (io) {

            io.to(roomName).emit(
                "media-message",
                {

                    sender:
                        sender,

                    roomName:
                        roomName,

                    fileName:
                        uploaded.originalName,

                    fileType:
                        uploaded.mimeType,

                    url:
                        uploaded.url

                }
            );

        }


        return res.status(200).json({

            success:
                true,

            message:
                "File uploaded successfully",

            file:
                uploaded

        });


    } catch (error) {

        console.error(
            "S3 upload error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Failed to upload file",

            error:
                error.message

        });

    }

};