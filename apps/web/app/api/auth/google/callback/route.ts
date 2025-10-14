import { googleOAuthClient } from "@/lib/auth/google-oauth";
import prismadb from "@/lib/prismadb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { lucia } from "../../../../../lib/auth";
import { generateApiKey, generateRandomName } from '@/lib/utils';
import { sendDiscordNotification } from "@/service/discord-notify";
import { updateBrevoContact } from "@/lib/brevo-contact-update";
import { PostHogUserServer } from "@/lib/posthog-utils-server";

async function getUniqueOrgName(baseName: string): Promise<string> {
    let uniqueName = baseName;
    let counter = 1;

    while (true) {
        const existingOrg = await prismadb.organization.findUnique({
            where: { name: uniqueName }
        });

        if (!existingOrg) {
            return uniqueName;
        }

        uniqueName = `${baseName}${counter}`;
        counter++;
    }
}

async function getUniqueUsername(name: string): Promise<string> {
    let username = name.toLowerCase().replace(/\s+/g, '_')
    let uniqueUsername = username
    let counter = 1

    while (true) {
        const existingUser = await prismadb.user.findUnique({
            where: { username: uniqueUsername }
        })

        if (!existingUser) {
            return uniqueUsername
        }

        uniqueUsername = `${username}_${counter}`
        counter++
    }
}

export async function GET(req: NextRequest) {
    const url = req.nextUrl;
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
        console.error('no code or state');
        return new NextResponse('Invalid Request', { status: 400 });
    }

    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get('codeVerifier')?.value;
    const savedState = cookieStore.get('state')?.value;

    if (!codeVerifier || !savedState) {
        console.error('no code verifier or state');
        return new NextResponse('Invalid Request', { status: 400 });
    }

    // Decode the state to get original state and return URL
    let decodedState;
    try {
        const decodedString = Buffer.from(state, 'base64').toString();
        decodedState = JSON.parse(decodedString);
    } catch (error) {
        console.error('Invalid state format');
        return new NextResponse('Invalid Request', { status: 400 });
    }

    if (savedState !== state) {
        console.error('state mismatch');
        return new NextResponse('Invalid Request', { status: 400 });
    }

    try {
        const { accessToken } = await googleOAuthClient.validateAuthorizationCode(code, codeVerifier);
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const googleData = await googleResponse.json() as {
            id: string,
            email: string,
            name: string,
            picture: string
        };

        let user = await prismadb.user.findUnique({
            where: {
                email: googleData.email
            }
        });

        if (!user) {
            // Split name into first and last name for Brevo
            const nameParts = googleData.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            // Create new user
            user = await prismadb.user.create({
                data: {
                    name: googleData.name,
                    email: googleData.email,
                    picture: googleData.picture,
                    username: await getUniqueUsername(googleData.name),
                    signInMethod: "GOOGLE",
                    isEmailVerified: true
                }
            });

            // Set PostHog identity - for new users - only send user ID for privacy
            PostHogUserServer.setIdentityInCookie(user.id, {
                // Only include non-personal information and metadata
                signup_method: "google",
                signup_date: new Date().toISOString(),
                is_new_user: true
            }, req, cookieStore);

            // Create user credit
            await prismadb.userCredit.create({
                data: {
                    userId: user.id,
                    balance: 10,
                }
            });

            try {
                await updateBrevoContact({
                    email: googleData.email,
                    attributes: {
                        FIRSTNAME: firstName,
                        LASTNAME: lastName || '',
                        SOURCE: 'Google OAuth Signup',
                        PAID: false,
                        SIGNUP_DATE: new Date().toISOString(),
                    },
                    listIds: [16], // Add to new users list (adjust list ID as needed)
                    updateEnabled: true
                });
            } catch (brevoError) {
                console.error("Error updating Brevo contact:", brevoError);
                // Optionally, you could add this to a queue for retry
            }

            // Generate and store API key
            const apiKey = generateApiKey();
            await prismadb.apiKey.create({
                data: {
                    key: apiKey,
                    users: {
                        create: {
                            userId: user.id
                        }
                    }
                }
            });

            // Create organization
            const domain = googleData.email.split('@')[1];
            const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']; // Add more as needed
            let baseName: string;

            if (!genericDomains.includes(domain)) {
                baseName = domain.split('.')[0];
            } else {
                const firstName = googleData.name?.split(' ')[0] || googleData.email.split('@')[0];
                if (firstName && firstName.length > 1) {
                    baseName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
                } else {
                    baseName = generateRandomName();
                }
            }

            const uniqueOrgName = await getUniqueOrgName(baseName);
            await prismadb.organization.create({
                data: {
                    name: uniqueOrgName,
                    users: {
                        create: {
                            userId: user.id,
                            role: 'OWNER'
                        }
                    }
                }
            });

            // Send Discord notification
            try {
                await sendDiscordNotification(`New user signed up via Google: ${user.username} (${googleData.email})`);
            } catch (error) {
                console.error("Error sending Discord notification:", error);
            }
        } else {
            // Set PostHog identity - for existing users - only send user ID for privacy
            PostHogUserServer.setIdentityInCookie(user.id, {
                // Only include non-personal information and metadata
                signup_method: "google",
                last_login: new Date().toISOString(),
                is_new_user: false
            }, req, cookieStore);
        }

        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        // Use the saved return URL from the state
        const returnUrl = decodedState.returnUrl || '/dashboard';
        const response = NextResponse.redirect(new URL(returnUrl, req.url));
        response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

        // Clear the state and codeVerifier cookies
        response.cookies.set('state', '', { maxAge: 0 });
        response.cookies.set('codeVerifier', '', { maxAge: 0 });

        // Apply PostHog identity cookies to the response
        PostHogUserServer.applyIdentityCookiesToResponse(response);

        return response;
    } catch (error) {
        console.error("Error during Google OAuth callback:", error);
        return new NextResponse('An error occurred during sign-in', { status: 500 });
    }
}