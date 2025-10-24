import prismadb from "../prismadb";

interface LicenseValidationResult {
  isValid: boolean;
  vendor?: string;
  error?: string;
}

async function validateLocalLicenseKey(licenseKey: string, userId: string): Promise<LicenseValidationResult> {
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
    }

    const activeLicense = license || subLicense?.mainLicenseKey;

    if (activeLicense?.isActive && (!subLicense || subLicense.status === "ACTIVE")) {
      return { 
        isValid: true, 
        vendor: activeLicense.vendor || "local",
      };
    } else {
      return { isValid: false, error: "Invalid or inactive license key" };
    }
  } catch (error) {
    console.error("Error validating local license key:", error);
    return { isValid: false, error: "Error validating local license key" };
  }
}
async function validateLemonSqueezyLicenseKey(licenseKey: string): Promise<LicenseValidationResult> {
  const apiUrl = "https://api.lemonsqueezy.com/v1/licenses/validate";
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `license_key=${licenseKey}`,
    });
    const data = await response.json();

    if (data.valid) {
      const storeId = "24431";
      const productIds = ["146562", "187133", "187134"];
      if (
        data.meta.store_id == storeId &&
        productIds.includes(data.meta.product_id) &&
        data.license_key.activation_usage < 5
      ) {
        return { isValid: true, vendor: "lemonsqueezy" };
      }
    }
    return { isValid: false, error: "Invalid LemonSqueezy license key" };
  } catch (error) {
    console.error("Error validating LemonSqueezy license:", error);
    return { isValid: false, error: "Error validating LemonSqueezy license" };
  }
}

async function validateAppSumoLicenseKey(licenseKey: string): Promise<LicenseValidationResult> {
  const apiUrl = `https://api.licensing.appsumo.com/v2/licenses/${licenseKey}`;
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-AppSumo-Licensing-Key": process.env.APPSUMO_API_KEY as string,
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { isValid: false, error: "AppSumo license not found" };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return { 
        isValid: data.status === "active", 
        vendor: "appsumo", 
        error: data.status !== "active" ? "Inactive AppSumo license" : undefined 
      };
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      console.error("Unexpected response format from AppSumo API:", text);
      return { isValid: false, error: "Unexpected response format from AppSumo API" };
    }
  } catch (error) {
    console.error("Error validating AppSumo license:", error);
    return { isValid: false, error: "Error validating AppSumo license" };
  }
}

export async function validateLicenseKey(licenseKey: string, userId: string): Promise<LicenseValidationResult> {
  // Local validation
  const localResult = await validateLocalLicenseKey(licenseKey, userId);
  if (localResult.isValid) return localResult;

  // LemonSqueezy validation
  const lemonSqueezyResult = await validateLemonSqueezyLicenseKey(licenseKey);
  if (lemonSqueezyResult.isValid) return lemonSqueezyResult;

  // AppSumo validation
  const appSumoResult = await validateAppSumoLicenseKey(licenseKey);
  if (appSumoResult.isValid) return appSumoResult;

  // If all validations fail
  return { isValid: false, error: "Invalid license key" };
}