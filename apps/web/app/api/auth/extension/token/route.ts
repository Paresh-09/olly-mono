import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(request: Request) {
  try {
    const { code, client_id } = await request.json();

    // First attempt: Find the temporary auth code in your database
    const temporaryToken = await prismadb.temporaryToken.findUnique({
      where: {
        token: code,
        expiresAt: { gt: new Date() }, // Check if token is not expired
      },
      include: {
        licenseKey: {
          include: {
            settings: true,
            apiKey: true,
            users: {
              select: {
                userId: true
              },
              take: 1
            }
          },
        },
        apiKey: true,
      },
    });


    // If temporary token exists, process it
    if (temporaryToken) {
      let response;
      
      // Check if this token has a subLicenseId
      if (temporaryToken.subLicenseId) {
        // Fetch the sublicense separately since the relation isn't directly includable
        const sublicense = await prismadb.subLicense.findUnique({
          where: {
            id: temporaryToken.subLicenseId,
          },
          include: {
            settings: true,
            mainLicenseKey: {
              include: {
                apiKey: true,
              },
            },
          },
        });

        if (sublicense) {
          // Get API key from parent license if it exists
          const apiKey = temporaryToken.apiKey?.key || sublicense.mainLicenseKey?.apiKey?.key || "";

          // Get user settings from sublicense
          const settings = sublicense.settings || null;

          // Prepare response data
          response = {
            success: true,
            license_key: sublicense.key,
            is_sublicense: true,
            parent_license_key: sublicense.mainLicenseKey.key,
            api_key: apiKey,
            user_settings: settings
              ? {
                  llmVendor : settings.llmVendor || "olly",
                  model: settings.model || "olly_v1",
                  replyTone: settings.replyTone || "friendly",
                  replyLength: settings.replyLength || "short (150 Characters)",
                  toneIntent: settings.toneIntent || "Ask an Interesting Question",
                  language: settings.language || "english",
                  usePostNativeLanguage: settings.usePostNativeLanguage || false,
                  customButtons: settings.customButtons || [],
                  customActions: settings.customActions || [],
                }
              : {},
            db_user_id: temporaryToken?.userId || null,
          };
        }
      } else {
        // Get the license key and settings
        const licenseKey = temporaryToken.licenseKey;
        
        if (licenseKey) {
          // Standard license key flow
          // Get API key if it exists
          const apiKey = temporaryToken.apiKey?.key || "";
          
          // Get user settings
          const settings = licenseKey.settings || null;
          
          // Prepare response data
          response = {
            success: true,
            license_key: licenseKey.key,
            is_sublicense: false,
            api_key: apiKey,
            user_settings: settings
              ? {
                  llmVendor : settings.llmVendor || "olly", 
                  model: settings.model || "olly_v1",
                  replyTone: settings.replyTone || "friendly",
                  replyLength: settings.replyLength || "short (150 Characters)",
                  toneIntent: settings.toneIntent || "Ask an Interesting Question",
                  language: settings.language || "english",
                  usePostNativeLanguage: settings.usePostNativeLanguage || false,
                  customButtons: settings.customButtons || [],
                  customActions: settings.customActions || [],
                }
              : {},
            db_user_id: temporaryToken?.userId || null,
          };
        } else {
          // Check if this is a paid user by looking for active license or sublicense
          const userLicenses = temporaryToken.userId ? await prismadb.userLicenseKey.findFirst({
            where: {
              userId: temporaryToken.userId,
              licenseKey: {
                isActive: true
              }
            },
            include: {
              licenseKey: true
            }
          }) : null;

          const userSubLicense = temporaryToken.userId ? await prismadb.subLicense.findFirst({
            where: {
              assignedUserId: temporaryToken.userId,
              status: "ACTIVE"
            },
            include: {
              mainLicenseKey: true
            }
          }) : null;

          const isPaidUser = !!(userLicenses || userSubLicense);
          const licenseKey = userLicenses?.licenseKey?.key || userSubLicense?.key || null;
          const apiKey = temporaryToken.apiKey?.key || "";
          
          response = {
            success: true,
            is_free_user: !isPaidUser,
            license_key: licenseKey,
            is_sublicense: !!userSubLicense,
            parent_license_key: userSubLicense ? userSubLicense.mainLicenseKey.key : undefined,
            api_key: apiKey,
            user_settings: {
              llmVendor: "olly",
              model: "olly_v1",
              replyTone: "friendly",
              replyLength: "short (150 Characters)",
              toneIntent: "Ask an Interesting Question",
              language: "english",
              usePostNativeLanguage: false,
              customButtons: [],
              customActions: [],
            },
            db_user_id: temporaryToken?.userId || null,
          };
        }
      }

      // Delete the temporary token after use - with error handling
      if (response) {
        try {
          await prismadb.temporaryToken.delete({
            where: { token: code },
          });
        } catch (deleteError) {
          console.log("trying to delete token", code);
          console.error("Error deleting temporary token:", deleteError);
        }
       
        return NextResponse.json(response);
      }
    }

    // Second attempt: Check if the code directly matches a sublicense key
    const sublicense = await prismadb.subLicense.findFirst({
      where: {
        key: code,
        status: "ACTIVE",
      },
      include: {
        settings: true,
        mainLicenseKey: {
          include: {
            apiKey: true,
          },
        },
      },
    });

    if (sublicense) {
      // Get API key from parent license if it exists
      const apiKey = sublicense.mainLicenseKey?.apiKey?.key || "";

      // Get user settings from sublicense
      const settings = sublicense.settings || null;

      // Prepare response data
      const response = {
        success: true,
        license_key: sublicense.key,
        is_sublicense: true,
        parent_license_key: sublicense.mainLicenseKey.key,
        api_key: apiKey,
        user_settings: settings
          ? {
              llmVendor : settings.llmVendor || "olly",
              model: settings.model || "olly_v1",
              replyTone: settings.replyTone || "friendly",
              replyLength: settings.replyLength || "short (150 Characters)",
              toneIntent: settings.toneIntent || "Ask an Interesting Question",
              language: settings.language || "english",
              usePostNativeLanguage: settings.usePostNativeLanguage || false,
              customButtons: settings.customButtons || [],
              customActions: settings.customActions || [],
            }
          : {},
        db_user_id: temporaryToken?.userId || null,
      };

    
      return NextResponse.json(response);
    }

    // If we reach here, neither a temporary token with license key nor a sublicense was found
    const errorResponse = { error: "Invalid or expired code" };

    return NextResponse.json(
      errorResponse,
      { status: 401 },
    );
  } catch (error: any) {
    console.error("Token exchange error:", error);
    const errorResponse = {
      error: "Server error",
      message: error.message,
    };
    return NextResponse.json(
      errorResponse,
      { status: 500 },
    );
  }
}
