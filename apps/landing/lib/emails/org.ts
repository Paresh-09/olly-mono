import { sendMail } from "../mail-service";

export async function sendOrganizationInviteEmail(email: string, inviterName: string, token: string) {
    try {
      const subject = `You've been invited to join an organization on Olly`;
      
      const emailText = `Hello,
  
  ${inviterName} has invited you to join their organization on Olly AI.
  
  To accept this invitation, please click the link below:
  
  ${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${token}
  
  This invitation will expire in 7 days.
  
  If you don't have an Olly account yet, you'll be able to create one when you accept the invitation.
  
  If you didn't expect this invitation, you can safely ignore this email.
  
  Best regards,
  The Olly Team`;
  
      await sendMail(subject, email, emailText, "Olly AI");
    } catch (error: any) {
      console.error(`Error sending organization invite email: ${error.message}`);
      throw error;
    }
  }