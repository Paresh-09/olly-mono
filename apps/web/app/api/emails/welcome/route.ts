import { sendMail } from "@/lib/mail-service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const firstName = body.firstName;
    const email = body.email;

    // Define the email subject and body
    const subject = firstName === "" ? "Thank you for buying Olly!" : `Thank you for buying Olly!`;
    
    const emailText = `Hi ${firstName},

This is Yash. Maker of Olly Chrome Extension. I am so excited to have you on board. 🎉

Right off the bat, I want to thank you for installing Olly. I hope you find it useful and it helps you you scale your social media like 3000 others.

I would love to speak to you to hear your thoughts on Olly and how I can make it better. You can reply to this email or book a time with me here: https://calendly.com/explainx/discussion

Best,
Yash`;

    // Send the welcome email object
    await sendMail(subject, email, emailText, "Yash @ Olly AI"); // Added the senderName argument

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error(`Error sending welcome email: ${error.message}`);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
