// lib/emails/plan-change.ts
import { sendMail } from "@/lib/mail-service";

export async function sendPlanChangeEmail(firstName: string, email: string, isUpgrade: boolean, newTier: number) {
  try {
    const action = isUpgrade ? "Upgraded" : "Downgraded";
    const subject = `Your Olly AI plan has been ${action}`;
    
    const emailText = `Hi ${firstName},

I hope this email finds you well. This is Yash, the founder of Olly AI, and I wanted to reach out personally because I noticed you've ${action} your Olly AI plan.

${isUpgrade 
  ? `Congratulations on your upgrade! We're excited to offer you more features and capabilities. Here's what you can expect with your new plan:

  ${getTierFeatures(newTier)}

We're confident these new features will help you get even more value from Olly AI.`
  : `We're sorry to see you downgrade, but we understand that needs change. Your new plan still includes these great features:

  ${getTierFeatures(newTier)}

We hope these features continue to provide value for you.`
}

If you have any questions about your new plan or need help taking advantage of ${isUpgrade ? "the new features" : "your current features"}, please don't hesitate to reach out. We're here to help!

Thank you for your continued support of Olly AI. Your feedback and engagement help us improve and grow.

Best wishes,
Yash
Founder, Olly AI

P.S. If you have any feedback about why you decided to ${action} your plan, I'd love to hear it. Your insights help us improve Olly AI for everyone.`;

    await sendMail(subject, email, emailText, "Yash @ Olly AI");
  } catch (error: any) {
    console.error(`Error sending plan change email: ${error.message}`);
    throw error;
  }
}

function getTierFeatures(tier: number): string {
  // You should customize these features based on your actual tier offerings
  switch(tier) {
    case 1:
      return "- Individual Lifetime license \n- Basic analytics\n- Email support";
    case 2:
      return "- 5 Lifetime licenses\n- Advanced Team analytics\n- Priority email support";
    case 3:
        return "- 10 Lifetime licenses\n- Advanced Team analytics\n- Priority email support";
    default:
        return "- Individual Lifetime license \n- Basic analytics\n- Email support";
    }
}