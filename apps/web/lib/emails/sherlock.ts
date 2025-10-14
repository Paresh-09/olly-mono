import { sendMail } from "../mail-service";

export async function sendSherlockEmail(
    email: string,
    username: string,
    totalFound: number,
    validFound: number,
    resultUrl: string,
) {
    try {
        const subject = `🔍 Sherlock Search Complete - ${username}`;

        const emailText = `
    Hi there!
    
    Your Sherlock username search for "${username}" has completed successfully! 
    
    📊 Search Results:
    • Total accounts found: ${totalFound}
    • Valid accounts found: ${validFound}
    • Username searched: ${username}
    
    🔗 View your detailed results here:
    ${resultUrl}
    
    The results include all the social media profiles and websites where this username was found. You can now analyze the findings and take any necessary actions.
    
    Need help interpreting the results or have questions? Just reply to this email!
    
    Best regards,
    The Olly Team
    
    ---
    This is an automated message from your Sherlock search tool.`;

        await sendMail(subject, email, emailText, "Olly AI");
    } catch (error: any) {
        console.error(`Error sending organization invite email: ${error.message}`);
        throw error;
    }
}