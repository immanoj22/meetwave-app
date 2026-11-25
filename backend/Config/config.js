import dotenv from 'dotenv'
dotenv.config({ path: `./env/.env.${process.env.NODE_ENV}` })
// require('dotenv').config({path:`./env/.env.${process.env.NODE_ENV}`})

var EnvName = process.env.NODE_ENV;
console.log('EnvName : api : ', EnvName);
const Key = {
    FRONT_URL: process.env.FRONT_URL,
    NOTIFICATION_URL: process.env.NOTIFICATION_URL,

    PORT: process.env.PORT,
    MONGOURI: process.env.MONGOURI,
    SECRET_KEY: process.env.SECRET_KEY,
    Decryptkey: process.env.Decryptkey,
    backUrl: process.env.backUrl,
    ADMIN_URL: process.env.ADMIN_URL,
    ImgUrl: process.env.ImgUrl,
    adminmail: process.env.adminmail,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    CDN_URL: process.env.CDN_URL,
    keyEnvBased: {
        emailGateway: {

            fromMail: process.env.SMTP_USER,
            nodemailer: {
                host: process.env.NOMAILER_HOST,
                port: 465,
                secure: true,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS

                }
            }
        }
    },

    FrontUrl: ["http://localhost:3000/", "http://localhost:3001/", process.env.ADMIN_URL]
}


export default Key;