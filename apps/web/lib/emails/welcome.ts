// lib/send-welcome-email.ts
import { sendMail } from "@/lib/mail-service";

const chromeExtensionLink = "https://chromewebstore.google.com/detail/olly-ai-assistant-for-soc/ofjpapfmglfjdhmadpegoeifocomaeje";

export async function sendWelcomeEmail(firstName: string, email: string, license_key?: string) {
  try {
    const subject = firstName === "" ? "So glad to have you!" : `Welcome, ${firstName}! Your Olly Setup Guide`;
    
    let emailText = `Hi ${firstName},

This is Yash, Maker of Olly AI. I am so excited to have you on board. 🎉

Here's how to get started:

1. Add Olly to Chrome: ${chromeExtensionLink}
   This is the first step to supercharge your social media!

2. Join our Discord for support and updates: https://discord.gg/Phg8nwJEek
`;

    if (license_key) {
      emailText += `
3. Your Activation key: ${license_key}
   Keep this safe - you'll need it to activate the Premium version of Olly.
`;
    }

    emailText += `
For a full setup guide, watch this video: https://youtu.be/878N5HT68g0

If you're an AppSumo Customer (Sumo-ling), check out our special guide: https://youtu.be/sxM84wjUXAg

I'd love to hear your thoughts on Olly. Reply or book a chat: https://calendly.com/explainx/discussion

Best,
Yash`;

    await sendMail(subject, email, emailText, "Yash @ Olly AI");
  } catch (error: any) {
    console.error(`Error sending welcome email: ${error.message}`);
    throw error;
  }
}

export async function sendAppSumoWelcomeEmail(firstName: string, email: string, licenseKey: string) {
  try {
    const subject = `Welcome to Olly, Sumo-ling!`;
    
    const emailText = `Hi ${firstName},

Welcome to Olly AI! I'm Yash, the creator, and I'm thrilled to have you on board. 🎉

Here's your quick-start guide:

1. Add Olly to Chrome: ${chromeExtensionLink}
   This is your first step to social media success!

2. Your Activation Key: ${licenseKey}
   Keep this safe - you'll need it to activate the Premium version of Olly.

3. Sumo-ling Guide: https://youtu.be/sxM84wjUXAg
   Watch this video for a tailored setup walkthrough.

4. Account Activation:
   - Go to https://www.olly.social/set-password
   - Enter your email and details
   - You'll receive a password reset email
   - Follow the steps to activate your account and access advanced analytics

For support and updates, join our Discord: https://discord.gg/Phg8nwJEek

Let's supercharge your social media!

Best,
Yash`;

    await sendMail(subject, email, emailText, "Yash @ Olly AI", "support@explainx.ai", true, "support@explainx.ai");
  } catch (error: any) {
    console.error(`Error sending AppSumo welcome email: ${error.message}`);
    throw error;
  }
}

export async function sendLemonSqueezyWelcomeEmail(firstName: string, email: string, licenseKey: string) {
  try {
    const subject = `Welcome to Olly, ${firstName}!`;
    
    const emailText = `Hi ${firstName},

Welcome to Olly AI! I'm Yash, the creator, and I'm excited to have you join us.

Here's your quick-start guide:

1. Add Olly to Chrome: ${chromeExtensionLink}
   This is your first step to social media success!

2. Your Activation Key: ${licenseKey}
   Keep this handy - you'll need it to activate Olly's Premium features.

3. 3-Minute Setup Guide: https://youtu.be/878N5HT68g0
   Get up and running in no time!

4. Account Activation:
   - Go to https://www.olly.social/set-password
   - Enter your email and details
   - You'll receive a password reset email
   - Follow the steps to activate your account and access advanced analytics

For support and updates, join our Discord: https://discord.gg/Phg8nwJEek

Let's make your social media shine!

Best,
Yash`;

    await sendMail(subject, email, emailText, "Yash @ Olly AI");
  } catch (error: any) {
    console.error(`Error sending Lemon Squeezy welcome email: ${error.message}`);
    throw error;
  }
}

export async function sendGeneralWelcomeEmail(firstName: string, email: string) {
  try {
    const subject = `Welcome to Olly, ${firstName}! Let's Get Started`;
    
    const emailText = `Hi ${firstName},

Welcome to Olly AI! I'm Yash, the creator, and I'm delighted you've joined us. 🚀

Here's how to hit the ground running:

1. Add Olly to Chrome: ${chromeExtensionLink}
   This is your first step to social media success!

2. 3-Minute Setup Guide: https://youtu.be/878N5HT68g0
   Get Olly up and running in no time!

3. Activation Guide: https://youtu.be/878N5HT68g0
   For a detailed walkthrough on activating Olly.

For support and updates, join our Discord: https://discord.gg/Phg8nwJEek

Ready to revolutionize your social media?

Best,
Yash`;

    await sendMail(subject, email, emailText, "Yash @ Olly AI");
  } catch (error: any) {
    console.error(`Error sending general welcome email: ${error.message}`);
    throw error;
  }
}

export async function sendRedeemEmail(firstName: string, email: string, username: string, licenseKey: string) {
  try {
    const subject = `Thank You for Redeeming Olly, ${firstName}!`;
    
    const emailText = `Hi ${firstName},

Thank you for redeeming your Olly AI license! We're thrilled to have you on board.

Here's what you need to know:

1. Add Olly to Chrome: ${chromeExtensionLink}
   This is your first step to social media success!

2. Your License Key: ${licenseKey}
   Keep this safe - you'll need it to activate the Premium version of Olly.

3. Your Account is Ready:
   - Username: ${email}
   - Login Link: https://www.olly.social/login

4. Access Analytics:
   Simply log in using the link above to explore your advanced analytics dashboard.

5. Quick Start Guide: https://youtu.be/878N5HT68g0

Need Help? Join our Discord community: https://discord.gg/Phg8nwJEek

Ready to take your social media game to the next level?

Best regards,
Yash
Founder, Olly AI`;

    await sendMail(subject, email, emailText, "Yash @ Olly AI");
  } catch (error: any) {
    console.error(`Error sending redeem email: ${error.message}`);
    throw error;
  }
}

export async function sendExistingUserRedeemEmail(firstName: string, email: string, licenseKey: string) {
  try {
    const subject = `Your Olly AI License Key is Ready, ${firstName}!`;
    
    const emailText = `Hi ${firstName},

Great news! Your Olly AI license key has been successfully redeemed.

Here's what you need to know:

1. Add Olly to Chrome (if you haven't already): ${chromeExtensionLink}
   This is crucial for using Olly effectively!

2. Your License Key: ${licenseKey}
   Keep this safe - you'll need it to activate the Premium features of Olly.

3. Activate Premium:
   - Log in to your account at https://www.olly.social/login
   - Navigate to the settings or account section
   - Enter your license key to unlock all Premium features

Need Help? Our Discord community is here for support: https://discord.gg/Phg8nwJEek

Thank you for your continued trust in Olly AI. Enjoy your new Premium features!

Best regards,
Yash
Founder, Olly AI`;

    await sendMail(subject, email, emailText, "Yash @ Olly AI");
  } catch (error: any) {
    console.error(`Error sending existing user redeem email: ${error.message}`);
    throw error;
  }
}

export async function sendSignupWithoutLicenseEmail(firstName: string, email: string) {
  try {
    const subject = `Welcome to Olly, ${firstName}! Unlock Premium Features`;
    
    const emailText = `Hi ${firstName},

Welcome to Olly AI! I'm Yash, the creator. 🎉

Get started:
1. Add Olly to Chrome: ${chromeExtensionLink}
2. Upgrade to Premium and Save 30%:
   - Use code AZMZQ4MA for 30% off
   - Upgrade here: https://olly-ai.lemonsqueezy.com/buy/ccbea37a-e676-45b7-8052-e2f45c0210ca
   - Limited time offer!

Need help? Join our Discord: https://discord.gg/Phg8nwJEek

Let's supercharge your social media!

Best,
Yash
Founder, Olly AI`;

    await sendMail(subject, email, emailText, "Yash @ Olly AI");
  } catch (error: any) {
    console.error(`Error sending signup without license email: ${error.message}`);
    throw error;
  }
}

export async function sendLemonLicenseKeyUpdateEmail(firstName: string, email: string, licenseKey: string, status: string) {
  try {
    const subject = `Your Olly AI License Key Has Been Updated, ${firstName}!`;
    
    const emailText = `Hi ${firstName},

We wanted to let you know that your Olly AI license key has been updated.

Here's what you need to know:

1. Your License Key: ${licenseKey}
   This is your updated license key. Please use this for any future activations.

2. Current Status: ${status}
   Your license key is currently ${status.toLowerCase()}.

3. Next Steps:
   ${status === 'ACTIVE' 
     ? "Your license is active. You can continue using Olly AI with all premium features."
     : "If your license is inactive and you believe this is an error, please contact our support team."}

4. Reminder: Add Olly to Chrome: ${chromeExtensionLink}
   If you haven't already, make sure to add Olly to your Chrome browser for the best experience.

Need Help? Our Discord community is here for support: https://discord.gg/Phg8nwJEek

Thank you for being a valued Olly AI user!

Best regards,
Yash
Founder, Olly AI`;

    await sendMail(subject, email, emailText, "Yash @ Olly AI");
  } catch (error: any) {
    console.error(`Error sending license key update email: ${error.message}`);
    throw error;
  }
}