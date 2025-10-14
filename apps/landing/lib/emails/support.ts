import { sendMail } from "@/lib/mail-service";

interface NotificationOptions {
  company?: string;
  teamSize?: string;
  type?: "support" | "sales";
}

interface AcknowledgmentOptions {
  template?: "support" | "sales-inquiry";
}

export async function sendTeamNotificationEmail(
  name: string,
  email: string,
  phone: string,
  message: string,
  options: NotificationOptions = {},
) {
  try {
    const currentDate = new Date().toLocaleDateString();
    const isSalesInquiry = options.type === "sales";

    const subject = isSalesInquiry
      ? `New Enterprise Sales Lead from ${name} - ${options.company}`
      : `New Contact Form Submission by ${name} on ${currentDate}`;

    const emailText = isSalesInquiry
      ? `
Hey Sales Team!

We've received a new enterprise sales inquiry. Here are the details:

Date: ${currentDate}
Name: ${name}
Company: ${options.company}
Team Size: ${options.teamSize}
Phone: ${phone}
Email: ${email}

Message:
${message}

Please reach out to ${name} as soon as possible to discuss their enterprise requirements.

Best regards,
Team Olly
      `
      : `
Hey there!

We've received a new contact form submission from ${name}. Here are the details:

Date: ${currentDate}
Name: ${name}
Phone: ${phone}
Email: ${email}
Message: ${message}

Feel free to reach out to ${name} directly by replying to this email.

Best regards,
Team Olly
      `;

    // Define recipients based on inquiry type
    const recipients = isSalesInquiry
      ? ["yash@olly.social", "yash@explainx.ai", "support@explainx.ai"]
      : [
          "yash@olly.social",
          "yash@explainx.ai",
          "geeta@explainx.ai",
          "pratham@explainx.ai",
          "support@explainx.ai",
        ];

    const replyTo = isSalesInquiry ? "support@explainx.ai" : email;

    await Promise.all(
      recipients.map((recipient) =>
        sendMail(
          subject,
          recipient,
          emailText,
          isSalesInquiry ? "Sales Inquiry" : "Contact Form",
          replyTo,
          true,
        ),
      ),
    );
  } catch (error: any) {
    console.error(`Error sending team notification email: ${error.message}`);
    throw error;
  }
}

export async function sendAcknowledgmentEmail(
  name: string,
  email: string,
  options: AcknowledgmentOptions = {},
) {
  try {
    const isSalesInquiry = options.template === "sales-inquiry";

    const subject = isSalesInquiry
      ? `Thank you for your interest in Olly Enterprise`
      : `We've received your ticket - Olly Support`;

    const emailText = isSalesInquiry
      ? `Hi ${name},

Thank you for your interest in Olly Enterprise Solutions. We've received your inquiry and our sales team will be in touch shortly to discuss how we can help transform your social media strategy.

In the meantime:
1. Schedule a Demo: https://calendly.com/shri-olly/agency
2. Enterprise Case Studies: https://olly.social/case-studies
3. Product Documentation: https://docs.olly.social

Our team typically responds within 1 business day. If you have any immediate questions, feel free to schedule a demo call using the link above.

Best regards,
Olly Enterprise Team`
      : `Hi ${name},

Thank you for reaching out to Olly AI Support. We've received your ticket and will respond as soon as possible.

In the meantime, you might find these resources helpful:

1. AI Assistant for FAQs: https://chatgpt.com/g/g-LVAKUYjrB-olly-faq
2. Documentation: https://docs.olly.social
3. Community Support on Discord: https://discord.gg/Phg8nwJEek

If you have any urgent questions, feel free to check these resources or join our Discord community for faster support.

We appreciate your patience and will get back to you shortly.

Best regards,
Olly Support`;

    const fromEmail = "support@explainx.ai";
    const replyTo = "support@explainx.ai";

    await sendMail(
      subject,
      email,
      emailText,
      isSalesInquiry ? "Olly Enterprise" : "Olly Support",
      fromEmail,
      false,
      replyTo,
    );
  } catch (error: any) {
    console.error(`Error sending acknowledgment email: ${error.message}`);
    throw error;
  }
}

