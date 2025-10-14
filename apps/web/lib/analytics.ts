import { google, sheets_v4 } from 'googleapis';

const LEMON_SQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1";
const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
const LEMON_STORE_ID = process.env.LEMON_STORE_ID;

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

export async function fetchGoogleSheetsData() {
  const auth = await getAuthenticatedClient();
  const sheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth: auth as any });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_OLLY_LICENSE_DB,
    range: 'Sheet1!A:F',
  });

  return response.data.values || [];
}

export async function fetchStoreAnalytics() {
  const response = await fetch(`${LEMON_SQUEEZY_API_URL}/stores/${LEMON_STORE_ID}`, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch store analytics: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function fetchLicenseKeysCount(licenseKeysUrl: string) {
  const response = await fetch(licenseKeysUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch license keys count: ${response.statusText}`);
  }

  const data = await response.json();
  return data.meta.page.total;
}