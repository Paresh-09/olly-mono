import axios from 'axios';

interface LicenseResponse {
  license_key: string;
  status: string;
  tier: number;
  plan_id: string;
  created_at: string;
  updated_at: string;
}

interface ValidationResult {
  isValid: boolean;
  tier?: number;
  plan_id?: string;
}

export async function validateLicenseKey(licenseKey: string): Promise<ValidationResult> {
  const apiKey = process.env.APPSUMO_LICENSING_API_KEY;
  if (!apiKey) {
    throw new Error('AppSumo Licensing API key is not set');
  }

  try {
    const response = await axios.get<LicenseResponse>(
      `https://api.licensing.appsumo.com/v2/licenses/${licenseKey}`,
      {
        headers: {
          'X-AppSumo-Licensing-Key': apiKey
        }
      }
    );

    // Check if the license is active
    if (response.data.status === 'active') {
      return {
        isValid: true,
        tier: response.data.tier,
        plan_id: response.data.plan_id
      };
    } else {
     
      return { isValid: false };
    }

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        console.log(`License key not found`);
      } else {
        console.error(`Error validating license key: ${error.response.status} - ${error.response.data}`);
      }
    } else {
      console.error(`Unexpected error validating license key: ${error}`);
    }
    return { isValid: false };
  }
}