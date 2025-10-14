import crypto from 'crypto';
import prismadb from '../prismadb';

interface LicenseActivationResult {
  isActivated: boolean;
  vendor?: string;
  activationToken?: string;
  error?: string;
}

interface ActivationDetails {
  deviceType: string | null;
  deviceModel: string | null;
  osName: string | null;
  osVersion: string | null;
  browser: string | null;
  browserVersion: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

async function createActivationRecord(licenseKeyId: string, userId: string, activationDetails: ActivationDetails): Promise<string> {
  const activationToken = crypto.randomBytes(32).toString('hex');
  
  try {
    // Check if the user exists
    const user = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // If user doesn't exist, create a new user
      await prismadb.user.create({
        data: {
          id: userId,
          // Add any other required fields for the User model
        },
      });
    }

    // Create the activation record
    await prismadb.activation.create({
      data: {
        licenseKeyId,
        userId,
        activationToken,
        activationTokenType: 'ACTIVE',
        deviceType: activationDetails.deviceType,
        deviceModel: activationDetails.deviceModel,
        osVersion: activationDetails.osVersion,
        browser: activationDetails.browser,
        browserVersion: activationDetails.browserVersion,
        ipAddress: activationDetails.ipAddress,
      },
    });

    // Increment the activationCount for the license key
    await prismadb.licenseKey.update({
      where: { id: licenseKeyId },
      data: { activationCount: { increment: 1 } },
    });

    return activationToken;
  } catch (error) {
    console.error("Error creating activation record:", error);
    throw new Error("Failed to create activation record");
  }
}

async function checkDatabaseForLicense(licenseKey: string, userId: string, activationDetails: ActivationDetails): Promise<LicenseActivationResult | null> {
  try {
    // Check LicenseKey table
    const license = await prismadb.licenseKey.findUnique({
      where: { key: licenseKey },
    });

    // Check SubLicense table if not found in LicenseKey
    let subLicense;
    if (!license) {
      subLicense = await prismadb.subLicense.findUnique({
        where: { key: licenseKey },
        include: { mainLicenseKey: true },
      });

      if (!subLicense) {
        console.log(`License key not found in database`);
        return null;
      }
    }

    const activeLicense = license || subLicense?.mainLicenseKey;

    if (!activeLicense?.isActive || (subLicense && subLicense.status !== "ACTIVE")) {
      console.log(`License key is inactive in database`);
      return { isActivated: false, error: "Inactive license key" };
    }

    // If the license is active, create an activation record
    try {
      const activationToken = await createActivationRecord(activeLicense.id, userId, activationDetails);

      // Ensure user-license association exists
      await prismadb.userLicenseKey.upsert({
        where: {
          userId_licenseKeyId: {
            userId,
            licenseKeyId: activeLicense.id,
          },
        },
        update: {},
        create: {
          userId,
          licenseKeyId: activeLicense.id,
        },
      });

      // Update subLicense if applicable
      if (subLicense) {
        await prismadb.subLicense.update({
          where: { id: subLicense.id },
          data: {
            assignedUserId: userId,
            activationCount: { increment: 1 },
          },
        });
      }

      return { 
        isActivated: true, 
        vendor: activeLicense.vendor || "local", 
        activationToken,
      };
    } catch (error) {
      console.error("Error creating activation record or user association:", error);
      return { isActivated: false, error: "Error activating license key" };
    }
  } catch (error) {
    console.error("Error checking database for license:", error);
    return { isActivated: false, error: "Error checking database for license" };
  }
}

async function activateLocalLicenseKey(licenseKey: string, userId: string, activationDetails: ActivationDetails): Promise<LicenseActivationResult> {
  try {
    const license = await prismadb.licenseKey.findUnique({
      where: { key: licenseKey },
      include: { users: true },
    });

    if (!license) {
      console.log(`License key not found`);
      return { isActivated: false, error: "Invalid license key" };
    }

    if (!license.isActive) {
      console.log(`License key is inactive`);
      return { isActivated: false, error: "Inactive license key" };
    }

    const userLicenseKey = license.users.find(ul => ul.userId === userId);
    if (!userLicenseKey) {
      return { isActivated: false, error: "License key not assigned to this user" };
    }

    const activationToken = await createActivationRecord(license.id, userId, activationDetails);
    return { isActivated: true, vendor: "local", activationToken };
  } catch (error) {
    console.error("Error activating local license key:", error);
    return { isActivated: false, error: "Error activating local license key" };
  }
}

async function activateLemonSqueezyLicense(licenseKey: string, userId: string, activationDetails: ActivationDetails): Promise<LicenseActivationResult> {
  const apiUrl = "https://api.lemonsqueezy.com/v1/licenses/activate";
  try {
    const instanceName = crypto.randomBytes(16).toString('hex');
    const body = new URLSearchParams({
      license_key: licenseKey,
      instance_name: instanceName,
    });
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: body,
    });
    const data = await response.json();

    if (data.activated) {
      const license = await prismadb.licenseKey.findUnique({
        where: { key: licenseKey },
        include: { users: true },
      });
      if (license) {
        const userLicenseKey = license.users.find(ul => ul.userId === userId);
        if (!userLicenseKey) {
          await prismadb.userLicenseKey.create({
            data: {
              userId,
              licenseKeyId: license.id,
            },
          });
        }
        const activationToken = await createActivationRecord(license.id, userId, activationDetails);
        return { isActivated: true, vendor: "lemonsqueezy", activationToken };
      }
    }
    return { isActivated: false, error: data.error || "Error activating LemonSqueezy license" };
  } catch (error) {
    console.error("Error activating LemonSqueezy license:", error);
    return { isActivated: false, error: "Error activating LemonSqueezy license" };
  }
}

async function activateAppSumoLicenseKey(licenseKey: string, userId: string, activationDetails: ActivationDetails): Promise<LicenseActivationResult> {
  try {
    const apiUrl = `https://api.licensing.appsumo.com/v2/licenses/${licenseKey}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-AppSumo-Licensing-Key": process.env.APPSUMO_API_KEY as string,
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { isActivated: false, error: "AppSumo license not found" };
      }
      const errorText = await response.text();
      console.error("AppSumo API error:", errorText);
      return { isActivated: false, error: "Error activating AppSumo license" };
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (data.status === "active") {
        const license = await prismadb.licenseKey.findUnique({
          where: { key: licenseKey },
          include: { users: true },
        });
        if (license) {
          const userLicenseKey = license.users.find(ul => ul.userId === userId);
          if (!userLicenseKey) {
            await prismadb.userLicenseKey.create({
              data: {
                userId,
                licenseKeyId: license.id,
              },
            });
          }
          const activationToken = await createActivationRecord(license.id, userId, activationDetails);
          return { isActivated: true, vendor: "appsumo", activationToken };
        }
      }
      console.log(`AppSumo license is not active`);
      return { isActivated: false, error: "Invalid or inactive AppSumo license" };
    } else {
      const text = await response.text();
      console.error("Unexpected response format from AppSumo API:", text);
      return { isActivated: false, error: "Unexpected response format from AppSumo API" };
    }
  } catch (error) {
    console.error("Error activating AppSumo license:", error);
    return { isActivated: false, error: "Error activating AppSumo license" };
  }
}

export async function activateLicenseKey(licenseKey: string, userId: string, activationDetails: ActivationDetails): Promise<LicenseActivationResult> {
  // Ensure activationDetails is always an object with the correct shape
  const safeActivationDetails: ActivationDetails = {
    deviceType: activationDetails?.deviceType ?? null,
    deviceModel: activationDetails?.deviceModel ?? null,
    osName: activationDetails?.osName ?? null,
    osVersion: activationDetails?.osVersion ?? null,
    browser: activationDetails?.browser ?? null,
    browserVersion: activationDetails?.browserVersion ?? null,
    ipAddress: activationDetails?.ipAddress ?? null,
    userAgent:  activationDetails?.userAgent ?? null,
  };

  // First, check if the license exists in our database
  const databaseResult = await checkDatabaseForLicense(licenseKey, userId, safeActivationDetails);
  if (databaseResult) {
    if (databaseResult.isActivated) {
      console.log(`License key activated from database`);
      return databaseResult;
    } else {
      console.log(`License key found in database but not activated: ${databaseResult.error}`);
      return databaseResult;
    }
  }

  // Try Local activation
  const localResult = await activateLocalLicenseKey(licenseKey, userId, safeActivationDetails);
  if (localResult.isActivated) {
      console.log(`Local activation successful`);
    return localResult;
  }

  // If Local fails, try LemonSqueezy
  const lemonSqueezyResult = await activateLemonSqueezyLicense(licenseKey, userId, safeActivationDetails);
  if (lemonSqueezyResult.isActivated) {
    console.log(`LemonSqueezy activation successful`);
    return lemonSqueezyResult;
  }

  // If LemonSqueezy fails, try AppSumo
  const appSumoResult = await activateAppSumoLicenseKey(licenseKey, userId, safeActivationDetails);
  if (appSumoResult.isActivated) {
    console.log(`AppSumo activation successful`);
    return appSumoResult;
  }

  // If all activations fail, return an error
  return { isActivated: false, error: "Failed to activate license key" };
}