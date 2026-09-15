const {
    S3Client,
    PutObjectCommand
} = require("@aws-sdk/client-s3");


const s3 = new S3Client({

    region:
        process.env.AWS_REGION,

    credentials: {

        accessKeyId:
            process.env.AWS_ACCESS_KEY_ID,

        secretAccessKey:
            process.env.AWS_SECRET_ACCESS_KEY

    }

});


async function uploadToS3(file) {

    const fileName =
        `${Date.now()}-${file.originalname}`;

    const key =
        `media/${fileName}`;


    const command =
        new PutObjectCommand({

            Bucket:
                process.env.AWS_S3_BUCKET,

            Key:
                key,

            Body:
                file.buffer,

            ContentType:
                file.mimetype

        });


    await s3.send(command);


    const fileUrl =
        `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;


    return {

        key: key,

        url: fileUrl,

        originalName:
            file.originalname,

        mimeType:
            file.mimetype

    };

}


module.exports = {
    uploadToS3
};