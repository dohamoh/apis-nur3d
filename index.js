const express = require('express');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000
const nodeMail = require("nodemailer");
const { google } = require("googleapis");
const cors = require("cors");
const multer = require('multer');
const cloudinary = require('./cloudinary.js');
const {HME,myMulter,fileValidation} = require("./multer.js")
var corsOption = {
    origin: "*",
    optionsSuccessStatus: 200
}

app.use(cors("*"))
const OAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID,process.env.CLIENT_SECRET,process.env.REDIRECT_URL) 
OAuth2Client.setCredentials({refresh_token:process.env.REFRESH_TOKEN})

async function sendEmail(email,subject,message) {
    try {
        const accessToken = await OAuth2Client.getAccessToken()
        const transport = nodeMail.createTransport({
            service:'gmail',
            auth:{
                type:'OAuth2',
                user:'nur3dprinter@gmail.com',
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken
            },
        });
        let info = await transport.sendMail({
            from: email,
            to: 'nur3dprinter@gmail.com',
            subject,
            html: message,
        });
        return info
    
    } catch (error) {
        return error
    }
}
app.use(express.json());


app.post('/sendEmail',myMulter(fileValidation.image).array("image"),HME, async(req, res) =>{ //("image",7) the num to tell allow how many images
    let imagesURL = [];
        let imageIds = [];
    if (req.files?.length) {
        for (const file of req.files) {
          let { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: "images" });
          imagesURL.push(secure_url)
          imageIds.push(public_id); //to delete the images by ID
        }
    }
        let {name, email, text ,phone} = req.body;
        let message = `<h4>From: ${email}</h4><br><h4> Name:${name}</h4><br><h4>Phone: ${phone}</h4><br><h4>Message: ${text}</h4><br><h4></h4>`
        for (let i = 0; i < imagesURL.length; i++) {
            const element = imagesURL[i];
            message += ` <a href="${element}">image${i+1}</a><br>`
        }
        let subject =  "Costumers Emails"
        let emailRes = await sendEmail(email,subject,message);
        console.log(emailRes);
        if (emailRes.accepted.length) {
            res.status(201).json({ message: "sended" })
        } else {
            res.status(404).json({ message: "invalid email" })
        }
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))