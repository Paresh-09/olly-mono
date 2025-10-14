import { NextRequest, NextResponse } from "next/server";
import { sendDiscordNotification } from "@/service/discord-notify";
import { sendRedeemEmail, sendWelcomeEmail } from "@/lib/emails/welcome";
import { google, sheets_v4 } from 'googleapis';
import { updateBrevoContact } from "@/lib/brevo-contact-update";
import prismadb from "@/lib/prismadb";
import { Prisma, RedeemCodeStatus } from "@repo/db";
import bcrypt from "bcryptjs";
import { lucia } from "@/lib/auth";

function getDecodedCredentials() {
  const encodedKey = process.env.GOOGLE_SERVICE_KEY;
  if (!encodedKey) {
    throw new Error('GOOGLE_SERVICE_KEY is not set in the environment variables');
  }
  const decodedKey = Buffer.from(encodedKey, 'base64').toString();
  return JSON.parse(decodedKey);
}

async function getAuthenticatedClient() {
  const credentials = getDecodedCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
}

async function updateDatabase(name: string, email: string | null, licenseKey: string, vendor: string, redeemCode: string) {
  try {
    await prismadb.$transaction(async (prisma) => {
      let userId: string | null = null;

      // Create user if email is provided
      if (email) {
        const user = await prisma.user.upsert({
          where: { email: email },
          update: {},
          create: {
            email: email,
          },
        });
        userId = user.id;
      }

      // Create or update license key
      const license = await prisma.licenseKey.upsert({
        where: { key: licenseKey },
        update: {
          isActive: true,
          activatedAt: new Date(),
        },
        create: {
          key: licenseKey,
          isActive: true,
          activatedAt: new Date(),
        },
      });

      // If user exists, create the relation between user and license key
      if (userId) {
        await prisma.userLicenseKey.upsert({
          where: {
            userId_licenseKeyId: {
              userId: userId,
              licenseKeyId: license.id,
            },
          },
          update: {},
          create: {
            userId: userId,
            licenseKeyId: license.id,
          },
        });
      }

      // Create or update redeem code
      await prisma.redeemCode.upsert({
        where: { code: redeemCode },
        update: {
          status: RedeemCodeStatus.CLAIMED,
          claimedAt: new Date(),
          licenseKeyId: license.id,
        },
        create: {
          code: redeemCode,
          status: RedeemCodeStatus.CLAIMED,
          claimedAt: new Date(),
          licenseKeyId: license.id,
        },
      });
    });

    console.log('Successfully updated database');
  } catch (error) {
    console.error('Error updating database:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('A unique constraint would be violated. This operation cannot be performed.');
      }
    }
    throw error;
  }
}


async function updateGoogleSheets(redeemCode: string, name: string, email: string, licenseKey: string, vendor: string) {
  try {
    const auth = await getAuthenticatedClient();
    const sheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth: auth as any });

    // Update GOOGLE_DEAL_DB
    const dealResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_DEAL_DB,
      range: 'REDEEM_KEYS!A:F',
    });

    const dealRows = dealResponse.data.values;
    if (dealRows) {
      for (let i = 0; i < dealRows.length; i++) {
        if (dealRows[i][0] === redeemCode) {
          if (dealRows[i][2] && dealRows[i][2].toLowerCase() === 'claimed') {
            throw new Error("This redeem code has already been claimed");
          }
          
          const date = new Date().toISOString().split('T')[0];
          await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_DEAL_DB,
            range: `REDEEM_KEYS!C${i+1}:F${i+1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [['claimed', name, email, date]],
            },
          });
          break;
        }
      }
    }

    // Update GOOGLE_OLLY_LICENSE_DB
    const licenseResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_OLLY_LICENSE_DB,
      range: 'Sheet1!A:F', // Extended to include the status column
    });

    const licenseRows = licenseResponse.data.values;
    let licenseExists = false;
    if (licenseRows) {
      for (let i = 0; i < licenseRows.length; i++) {
        if (licenseRows[i][3] === licenseKey) {
          licenseExists = true;
          if (licenseRows[i][1] && licenseRows[i][2]) {
            throw new Error("This license key has already been claimed");
          }
          const date = new Date().toISOString().split('T')[0];
          await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_OLLY_LICENSE_DB,
            range: `Sheet1!A${i+1}:F${i+1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[date, name, email, licenseKey, vendor, 'ACTIVE']],
            },
          });
          break;
        }
      }
    }

    if (!licenseExists) {
      const date = new Date().toISOString().split('T')[0];
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_OLLY_LICENSE_DB,
        range: 'Sheet1!A:F',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[date, name, email, licenseKey, vendor, 'ACTIVE']],
        },
      });
    }

    console.log('Successfully updated Google Sheets');
  } catch (error) {
    console.error('Error updating Google Sheets:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, username, password, redeemCode, licenseKey, vendor } = body;

    if (!redeemCode || !licenseKey || !vendor || !email) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let userId: string | undefined;
    let userCreated = false;

    // Handle user creation/update separately
    if (username && password) {
      // Validate username and password
      if (
        typeof username !== "string" ||
        username.length < 3 ||
        username.length > 31 ||
        !/^[a-z0-9_-]+$/.test(username)
      ) {
        return NextResponse.json({ success: false, error: "Invalid username" }, { status: 400 });
      }

      if (typeof password !== "string" || password.length < 6 || password.length > 255) {
        return NextResponse.json({ success: false, error: "Invalid password" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      try {
        const user = await prismadb.user.upsert({
          where: { email: email },
          update: {
            name,
            username,
            password: hashedPassword,
          },
          create: {
            email,
            name,
            username,
            password: hashedPassword,
          },
        });
        userId = user.id;
        userCreated = true;
      } catch (error) {
        console.error('Failed to create/update user:', error);
        // Continue with license activation even if user creation fails
      }
    }

    // Update Google Sheets
    await updateGoogleSheets(redeemCode, name, email, licenseKey, vendor);

    // Update database
    await updateDatabase(name, email, licenseKey, vendor, redeemCode);

    console.log('Successfully updated database');

    // Create session only if user was successfully created
    let sessionCookie;
    if (userCreated && userId) {
      const session = await lucia.createSession(userId, {});
      sessionCookie = lucia.createSessionCookie(session.id);
    }

    // Send Discord notification
    const message = `@everyone, new activation! License key activated: ${name || 'Unknown'} (${email}) ${licenseKey} via ${vendor}`;
    await sendDiscordNotification(message, true);

    // Send welcome email
    const firstName = name ? name.split(' ')[0] : 'User';
    const lastName = name ? name.split(' ').slice(1).join(' ') : '';
    const brevoResponse = await updateBrevoContact({
      email,
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
        SOURCE: "LOCAL_Olly_Redeem_Code",
        PAID: true
      },
      listIds: [12],
      updateEnabled: true
    });

    if (brevoResponse.status !== 200) {
      console.error('Failed to update Brevo contact:', await brevoResponse.text());
    }
    await sendRedeemEmail(firstName, email, username, licenseKey);

    const response = NextResponse.json({ 
      success: true, 
      message: userCreated 
        ? "License activated and account created successfully" 
        : "License activated successfully",
      userCreated: userCreated
    }, { status: 200 });
    
    // Set the session cookie if it exists
    if (sessionCookie) {
      response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }

    return response;
  } catch (error: any) {
    console.error(`Error processing license key activation: ${error.message}`);
    await sendDiscordNotification(`Error processing license key activation: ${error.message}`);

    if (error.message.includes("has already been claimed")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: error.message || "An unexpected error occurred. Please try again or contact support." }, { status: 500 });
  }
}