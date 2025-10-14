import { sendMail } from "../mail-service";

export async function sendSubLicenseActivationEmail(
  recipientEmail: string,
  licenseKey: string,
  inviterName: string,
  inviterEmail: string,
  orgName: string
) {
  const subject = 'You have been invited to use Olly!';
  const body = `
    Hi There!

    ${inviterName} (${inviterEmail}) from ${orgName} has invited you to use Olly. Please find your license key below and follow this guide to get started.

    Your license key: ${licenseKey}

    To activate your license and get started, please follow this guide: https://www.youtube.com/watch?v=878N5HT68g0

    If you have any questions, please don't hesitate to contact our support team.

    Best regards,
    The Olly Team
  `;

  try {
    await sendMail(subject, recipientEmail, body);
 
  } catch (error: any) {
    console.error(`Error sending activation email to ${recipientEmail}:`, error);
    throw new Error(`Failed to send activation email: ${error.message}`);
  }
}
