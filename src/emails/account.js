const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from: 'ibrahim.fatih.yavuz@gmail.com',
        subject:'Thank You For Joining Us',
        text:`Hello ${name},Welcome to task-manager-app`
    })
}

const sendGoodByeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'ibrahim.fatih.yavuz@gmail.com',
        subject:'Everything is OK!',
        text:`Goodbye ${name}, May we ask you is that wyh do you decide to leave from Task-Manager-App`
    })
}

module.exports = {
    sendWelcomeEmail: sendWelcomeEmail,
    sendGoodByeEmail: sendGoodByeEmail
}