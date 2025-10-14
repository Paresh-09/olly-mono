import nodemailer, { SentMessageInfo } from 'nodemailer';

export async function sendMail(
  subject: string, 
  toEmail: string | string[], 
  emailText: string, 
  senderName: string = "Yash @ Olly", 
  replyTo?: string,
  isImportant: boolean = false,
  cc?: string | string[]  // New optional cc parameter
): Promise<SentMessageInfo> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PW,
    },
  });

  const mailOptions: nodemailer.SendMailOptions = {
    from: `${senderName} <${process.env.NODEMAILER_EMAIL}>`,
    to: Array.isArray(toEmail) ? toEmail.join(', ') : toEmail,
    subject: subject,
    text: emailText,
    replyTo: replyTo || process.env.NODEMAILER_EMAIL,
    headers: isImportant ? { 'Importance': 'high', 'X-Priority': '1' } : undefined,
  };

  // Add cc to mailOptions if it exists
  if (cc) {
    mailOptions.cc = Array.isArray(cc) ? cc.join(', ') : cc;
  }

  return await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err: Error | null, response: SentMessageInfo) => {
      if (err) {
        console.error('Error sending email:', err);
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}