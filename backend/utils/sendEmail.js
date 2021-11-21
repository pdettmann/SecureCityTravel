const mailgun = require("mailgun-js");

const sendEmail = async (email, resetLink) => {
    try {
        const DOMAIN = 'sandbox1f008a2182e347999141ba6678ba0da4.mailgun.org';
        const api_key = process.env.MAILGUNAPIKEY;
        const mg = mailgun({apiKey: api_key, domain: DOMAIN});
        const data = {
            from: 'pauladettmann@aol.com',
            to: email,
            subject: "SecureCityTravel password reset",
            text: `Forgot your password? Don't worry, it happens. Click the link below to reset the password. ${resetLink}`, // plain text body
        };
        mg.messages().send(data, function (error, body) {
            if (error) {
                console.log(error);
            }
            console.log(body);
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports = sendEmail;

