import prismadb from "../prismadb";
export async function generateTemporaryTokenForExtension(
  licenseKeyId: string | null,
  apiKeyId: string | null,
  subLicenseId: string | null = null,
  userId: string | null = null
) {
  // Generate a random token
  const token = crypto.randomUUID();
  
  // Set expiration (10 minutes)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  
  // Prepare data object for temporaryToken creation
  const tokenData: any = {
    token,
    expiresAt,
  };
  
  // Only add apiKeyId if it exists
  if (apiKeyId) {
    tokenData.apiKeyId = apiKeyId;
  }

  // Add either licenseKeyId or subLicenseId based on which one is provided
  if(subLicenseId){
    tokenData.subLicenseId = subLicenseId;
  }
  else if (licenseKeyId) {
    tokenData.licenseKeyId = licenseKeyId;
  }
  if(userId){
    tokenData.userId = userId;
  }
  
  // Store the token in database
  const temporaryToken = await prismadb.temporaryToken.create({
    data: tokenData,
  });
  
  return token;
}
