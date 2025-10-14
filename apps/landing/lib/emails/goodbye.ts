// lib/emails/goodbye.ts
import { sendMail } from "@/lib/mail-service";

export async function sendPersonalGoodbyeEmail(firstName: string, email: string) {
  try {
    const subject = `A personal note from Yash, founder of Olly AI`;
    
    const emailText = `Hi ${firstName},

I hope this email finds you well. This is Yash, the founder of Olly AI, and I wanted to reach out personally because I noticed you've decided to stop using Olly.

First off, I want to thank you for giving Olly AI a try. Your trust means a lot to us, and we're sorry to see you go.

If you have a moment, I'd really appreciate hearing about your experience with Olly. What didn't work for you? Was there something missing that you were hoping for? Your honest feedback is incredibly valuable and will help us improve Olly for others.

Feel free to reply directly to this email. I read every response personally, and your insights will directly influence how we develop Olly moving forward.

Thank you again for your time with us. If there's anything we can do to help with your transition or if you have any questions, please don't hesitate to ask.

Best wishes,
Yash
Founder, Olly AI

P.S. If this was a mistake or if you've changed your mind, just let me know, and I'll sort everything out right away.`;

    await sendMail(subject, email, emailText, "Yash @ Olly AI");
  } catch (error: any) {
    console.error(`Error sending personal goodbye email: ${error.message}`);
    throw error;
  }
}