import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PW
    }
});

export async function sendSherlockCompleteEmail({
    email,
    username,
    totalFound,
    validFound,
    resultUrl,
}: {
    email: string;
    username: string;
    totalFound: number;
    validFound: number;
    resultUrl: string;
}) {
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: 'Your Sherlock Search Results Are Ready',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Search Results Ready</h1>
        <p>Your search for username "${username}" is complete!</p>
        <p>We found ${validFound} valid accounts out of ${totalFound} total matches.</p>
        <p>
          <a href="${resultUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Full Results
          </a>
        </p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}