import { NextRequest, NextResponse } from "next/server";
import { google, sheets_v4 } from 'googleapis';
import { sendDiscordNotification } from "@/service/discord-notify";
import prismadb from "@/lib/prismadb";
import { v4 as uuidv4 } from 'uuid';

function generateActivationToken(): string {
  return uuidv4();
}

type DatabaseResult = {
  isValid: boolean;
  status: string;
  license: any;
  isSubLicense: boolean;
} | null;

type SheetsResult = {
  isValid: boolean;
  status: string;
  rowIndex: number;
  email: string;
  name: string;
  vendor: string;
  planId: string;
  externalUserId: string;
} | null;

async function checkLicenseKeyInSheets(licenseKey: string): Promise<SheetsResult> {
  try {
    const auth = await getAuthenticatedClient();
    const sheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth: auth as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_OLLY_LICENSE_DB,
      range: 'Sheet1!A:J',
    });

    const values = response.data.values;
    if (!values) {
      return null;
    }

    const rowIndex = values.findIndex(row => row[3] === licenseKey);
    if (rowIndex === -1) {
      return null;
    }

    const row = values[rowIndex];

    const name = row[1] || '';
    const email = row[2] || '';
    const vendor = row[4] || '';
    const status = row[5]?.toUpperCase() || '';
    const isValid = status === "ACTIVE";
    const planId = row[7] || '';
    const externalUserId = row[8] || '';

    return {
      isValid,
      status: status.toLowerCase(),
      rowIndex,
      email,
      name,
      vendor,
      planId,
      externalUserId,
    };
  } catch (error) {
    console.error('Error checking license key in Google Sheets:', error);
    throw error;
  }
}

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



async function logUsageTracking(
  licenseKeyId: string | null,
  subLicenseId: string | null,
  userId: string | null,
  externalUserId: string | null,
  action: string,
  platform: string,
  event: string | null
) {
  try {
    
    await prismadb.usageTracking.create({
      data: {
        licenseKeyId,
        subLicenseId,
        userId,
        externalUserId,
        action,
        platform,
        event,
      },
    });
  } catch (error) {
    console.error('Error logging usage tracking:', error);
  }
}

async function logLicenseKeyCheckInDatabase(licenseKey: string, userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const licenseExists = await prismadb.licenseKey.findUnique({ where: { key: licenseKey } });
    if (!licenseExists) {
      console.warn(`Attempted to log a license key check for a non-existent license key: ${licenseKey}`);
      return;
    }

    await prismadb.licenseKeyLog.upsert({
      where: {
        date_userId_licenseKey: {
          date: today,
          userId: userId,
          licenseKey: licenseKey,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        date: today,
        userId: userId,
        licenseKey: licenseKey,
        count: 1,
      },
    });
  } catch (error) {
    console.error('Error logging license key check in database:', error);
  }
}

async function logLicenseKeyCheck(sheets: sheets_v4.Sheets, licenseKey: string, userId: string) {
  const today = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_OLLY_LICENSE_DB,
    range: 'Sheet2!A:D',
  });

  const values = response.data.values || [];

  const rowIndex = values.findIndex(row =>
    row[0] === today && row[1] === userId && row[2] === licenseKey
  );

  if (rowIndex === -1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_OLLY_LICENSE_DB,
      range: 'Sheet2!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[today, userId, licenseKey, '1']]
      }
    });
  } else {
    const currentCount = parseInt(values[rowIndex][3] || '0', 10);
    const newCount = currentCount + 1;

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_OLLY_LICENSE_DB,
      range: `Sheet2!D${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newCount.toString()]]
      }
    });
  }
}

async function checkLicenseKeyInDatabase(licenseKey: string): Promise<{ isValid: boolean, status: string, license: any, isSubLicense: boolean } | null> {
  try {
    // First, check in the LicenseKey table
    const license = await prismadb.licenseKey.findUnique({
      where: { key: licenseKey },
      include: { users: true }
    });

    if (license) {
      const isValid = license.isActive;
      const status = isValid ? "active" : "inactive";
      return { isValid, status, license, isSubLicense: false };
    }

    // If not found in LicenseKey table, check in SubLicense table
    const subLicense = await prismadb.subLicense.findUnique({
      where: { key: licenseKey },
      include: { mainLicenseKey: true, assignedUser: true }
    });

    if (subLicense) {
      const isValid = subLicense.status === "ACTIVE";
      const status = subLicense.status.toLowerCase();
      return { isValid, status, license: subLicense, isSubLicense: true };
    }

    // If not found in either table
    return null;
  } catch (error) {
    console.error('Error checking license key in database:', error);
    throw error;
  }
}

async function updateSubLicenseUsage(subLicense: any, userId: string, isActivation: boolean): Promise<void> {
  try {
    await prismadb.subLicense.update({
      where: { id: subLicense.id },
      data: {
        activationCount: isActivation ? { increment: 1 } : undefined,
        assignedUserId: userId,
        assignedEmail: subLicense.assignedEmail || (await prismadb.user.findUnique({ where: { id: userId } }))?.email,
        updatedAt: new Date(),
      },
    });

    await logUsageTracking(
      subLicense.mainLicenseKeyId,
      subLicense.id,
      userId,
      null, // We don't have externalUserId in this context
      isActivation ? 'activation' : 'usage',
      'server', // Assuming this is server-side usage
      isActivation ? 'activation' : 'check'
    );
  } catch (error) {
    console.error('Error updating sub-license usage:', error);
    throw error;
  }
}

async function checkAndUpdateLicenseKey(
  licenseKey: string,
  userId: string,
  isActivation: boolean,
  platform: string = 'server' // Default to 'server' if not provided
): Promise<{ isValid: boolean; status: string; activationToken?: string }> {
  let dbResult: DatabaseResult = null;
  let sheetsResult: SheetsResult = null;

  try {
    dbResult = await checkLicenseKeyInDatabase(licenseKey);
  } catch (dbError) {
    console.error('Database check failed:', dbError);
  }

  if (!dbResult) {
    try {
      sheetsResult = await checkLicenseKeyInSheets(licenseKey);
    } catch (sheetsError) {
      console.error('Google Sheets check failed:', sheetsError);
    }
  }

  if (!dbResult && !sheetsResult) {
    return { isValid: false, status: "inactive" };
  }

  try {
    let dbLicense = dbResult?.license;
    let isSubLicense = dbResult?.isSubLicense || false;

    if (!dbLicense && sheetsResult) {
      dbLicense = await prismadb.licenseKey.create({
        data: {
          key: licenseKey,
          isActive: sheetsResult.isValid,
          vendor: sheetsResult.vendor,
          planId: sheetsResult.planId,
        },
      });
      isSubLicense = false;
    }

    let user = null;
    if (dbLicense) {
      if (isSubLicense) {
        user = dbLicense.assignedUser || (await prismadb.user.findUnique({ where: { id: userId } }));
      } else {
        const existingUserLicenseKey = await prismadb.userLicenseKey.findFirst({
          where: { licenseKeyId: dbLicense.id },
          include: { user: true },
        });
        user = existingUserLicenseKey?.user;
      }
      console.log(`Existing user found for license key`);
    }

    if (!user) {
      if (userId) {
        user = await prismadb.user.findUnique({ where: { id: userId } });
      }

      if (!user && sheetsResult?.email) {
        user = await prismadb.user.findUnique({ where: { email: sheetsResult.email } });
      }

      if (!user && sheetsResult?.email) {
        const existingUserWithExternalId = await prismadb.user.findUnique({
          where: { externalUserId: sheetsResult.externalUserId }
        });

        if (existingUserWithExternalId) {
          user = existingUserWithExternalId;
        } else {
          user = await prismadb.user.create({
            data: {
              id: userId || undefined,
              email: sheetsResult.email,
              name: sheetsResult.name,
              externalUserId: sheetsResult.externalUserId,
            },
          });
        }
      }
    }

    if (user && dbLicense) {
      if (isSubLicense) {
        await updateSubLicenseUsage(dbLicense, user.id, isActivation);
      } else {
        await prismadb.user.update({
          where: { id: user.id },
          data: {
            name: sheetsResult?.name || user.name,
            externalUserId: sheetsResult?.externalUserId || user.externalUserId,
            licenseKeys: {
              connectOrCreate: {
                where: {
                  userId_licenseKeyId: {
                    userId: user.id,
                    licenseKeyId: dbLicense.id,
                  },
                },
                create: {
                  licenseKeyId: dbLicense.id,
                },
              },
            },
          },
        });

        // Log usage for regular license
        await logUsageTracking(
          dbLicense.id,
          null,
          user.id,
          user.externalUserId,
          isActivation ? 'activation' : 'usage',
          platform,
          isActivation ? 'activation' : 'check'
        );
      }
    }

    let activationToken: string | undefined;

    if (isActivation && dbLicense && user) {
      activationToken = generateActivationToken();

      if (isSubLicense) {
        await logUsageTracking(
          dbLicense.mainLicenseKeyId,
          dbLicense.id,
          user.id,
          user.externalUserId,
          'activation',
          platform,
          'activation'
        );
      } else {
        await prismadb.licenseKey.update({
          where: { id: dbLicense.id },
          data: {
            activationCount: { increment: 1 },
            activatedAt: dbLicense.activatedAt || new Date(),
            activations: {
              create: {
                userId: user.id,
                activationToken: activationToken,
                activationTokenType: "ACTIVE"
              },
            },
          },
        });
      }
    }

    if (user) {
      await logLicenseKeyCheckInDatabase(licenseKey, user.id);
    }

    if (sheetsResult?.rowIndex !== undefined) {
      const auth = await getAuthenticatedClient();
      const sheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth: auth as any });

      if (user?.id) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_OLLY_LICENSE_DB,
          range: `Sheet1!I${sheetsResult.rowIndex + 1}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[user.id]]
          }
        });
      }

      if (isActivation) {
        const activationCountResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_OLLY_LICENSE_DB,
          range: `Sheet1!J${sheetsResult.rowIndex + 1}`,
        });

        const currentActivationCount = parseInt(activationCountResponse.data.values?.[0]?.[0] || '0', 10);
        const newActivationCount = currentActivationCount + 1;

        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_OLLY_LICENSE_DB,
          range: `Sheet1!J${sheetsResult.rowIndex + 1}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[newActivationCount.toString()]]
          }
        });
      }

      if (user) {
        await logLicenseKeyCheck(sheets, licenseKey, user.id);
      }
    }

    return {
      isValid: isSubLicense ? dbLicense.status === "ACTIVE" : (dbLicense?.isActive || sheetsResult?.isValid || false),
      status: isSubLicense ? dbLicense.status.toLowerCase() : ((dbLicense?.isActive || sheetsResult?.isValid) ? "active" : "inactive"),
      activationToken
    };
  } catch (error) {
    console.error('Error updating license key:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { licenseKey, userId, activation, platform } = body;

    if (!licenseKey) {
      return NextResponse.json({
        success: true,
        isValid: false,
        status: "error",
        message: "License key is required"
      }, { status: 200 });
    }

    const result = await checkAndUpdateLicenseKey(licenseKey, userId || '', activation, platform || 'server');

    return NextResponse.json({
      success: true,
      status: result.status,
      isValid: result.isValid,
      activationToken: result.activationToken,
      message: result.isValid ? "License key is valid" : "Invalid or inactive license key"
    }, { status: 200 });

  } catch (error: any) {
    console.error(`Error validating license key: ${error.message}`);
    await sendDiscordNotification(`Error validating license key: ${error.message}`);

    return NextResponse.json({
      success: true,
      isValid: false,
      status: "error",
      message: "Error validating license key"
    }, { status: 200 });
  }
}