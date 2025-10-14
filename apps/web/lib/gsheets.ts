import { google, sheets_v4 } from 'googleapis';

function getDecodedCredentials() {
    const encodedKey = process.env.GOOGLE_SERVICE_KEY;
    if (!encodedKey) {
      throw new Error('GOOGLE_SERVICE_KEY is not set in the environment variables');
    }
    const decodedKey = Buffer.from(encodedKey, 'base64').toString();
    return JSON.parse(decodedKey);
  }
  
export async function getAuthenticatedClient() {
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