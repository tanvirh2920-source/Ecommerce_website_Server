import nodeMailer from "nodemailer";

export const sendEmail = async ({email, subject, message}) => {
    try {
        const transporter = nodeMailer.createTransport({
            service: process.env.SMTP_SERVICE,
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: email,   
            subject,     
            html: message
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", result.messageId);
        return result;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};
