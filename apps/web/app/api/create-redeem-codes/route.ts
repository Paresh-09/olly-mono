// app/api/create-redeem-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { RedeemCodeStatus } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import { randomUUID } from "crypto";

// Define metadata types for type safety
interface BatchMetadata {
  tier: string;
  credits: number;
  createdById: string;
  createdByName: string;
}

interface LicenseMetadata {
  credits: number;
}

interface SubLicenseMetadata {
  parentTier: string;
}

/**
 * Generate a random redeem code
 */
function generateRedeemCode() {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
}

/**
 * Generate a unique license key with OLLYR prefix
 * Format: OLLYR-XXXX-XXXX-XXXX-XXXX
 */
async function generateUniqueLicenseKey() {
  // Keep trying until we get a unique key
  let isUnique = false;
  let licenseKey = "";
  while (!isUnique) {
    // Generate a UUID and format it
    const uuid = randomUUID().replace(/-/g, "").toUpperCase();
    // Format into parts
    const parts = [
      uuid.substring(0, 4),
      uuid.substring(4, 8),
      uuid.substring(8, 12),
      uuid.substring(12, 16),
    ];
    // Add the OLLYR prefix
    licenseKey = `OLLYR-${parts.join("-")}`;
    // Check if this key already exists in the database
    const existingKey = await prismadb.licenseKey.findUnique({
      where: { key: licenseKey },
    });
    // If no existing key found, we have a unique one
    if (!existingKey) {
      isUnique = true;
    }
  }
  return licenseKey;
}

/**
 * Generate a unique sublicense key with OLLYS prefix
 * Format: OLLYS-XXXX-XXXX-XXXX-XXXX
 */
async function generateUniqueSubLicenseKey() {
  // Keep trying until we get a unique key
  let isUnique = false;
  let sublicenseKey = "";
  while (!isUnique) {
    // Generate a UUID and format it
    const uuid = randomUUID().replace(/-/g, "").toUpperCase();
    // Format into parts
    const parts = [
      uuid.substring(0, 4),
      uuid.substring(4, 8),
      uuid.substring(8, 12),
      uuid.substring(12, 16),
    ];
    // Add the OLLYS prefix for sublicense
    sublicenseKey = `OLLYS-${parts.join("-")}`;
    // Check if this key already exists in the database
    const existingKey = await prismadb.subLicense.findUnique({
      where: { key: sublicenseKey },
    });
    // If no existing key found, we have a unique one
    if (!existingKey) {
      isUnique = true;
    }
  }
  return sublicenseKey;
}

/**
 * Get number of sublicenses for a tier
 */
function getSubLicenseCount(tier: string): number {
  switch (tier) {
    case "T1":
      return 0;
    case "T2":
      return 4;
    case "T3":
      return 9;
    case "T4":
      return 14;
    case "T5":
      return 19;
    default:
      return 0;
  }
}

/**
 * Create a batch of redeem codes for promotional periods
 */
export async function POST(req: NextRequest) {
  try {
    // Validate the request to ensure only admins can create codes
    const { user } = await validateRequest();
    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Only admins can create redeem codes.",
        },
        { status: 403 },
      );
    }
    // Parse request body
    const body = await req.json();
    const {
      quantity = 10,
      campaign = "Promotion",
      validityDays = 30,
      name = `Promo-${new Date().toISOString().split("T")[0]}`,
      tier = "T1", // Default to T1 if not specified
      credits = 0, // Allow admin to specify credits (default to 0 if not specified)
    } = body;
    // Validate input
    if (quantity <= 0 || quantity > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Quantity must be between 1 and 1000",
        },
        { status: 400 },
      );
    }
    // Validate tier
    if (!["T1", "T2", "T3", "T4", "T5"].includes(tier)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid tier. Must be one of T1, T2, T3, T4, or T5.",
        },
        { status: 400 },
      );
    }
    // Validate credits
    if (credits < 0 || !Number.isInteger(credits)) {
      return NextResponse.json(
        {
          success: false,
          error: "Credits must be a non-negative integer.",
        },
        { status: 400 },
      );
    }
    // Calculate validity date
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + validityDays);

    // Create batch metadata
    const batchMetadata: BatchMetadata = {
      tier,
      credits,
      createdById: user.id,
      createdByName: user.email || "Admin",
    };

    // Create a batch record with the credits information
    const batch = await prismadb.redeemCodeBatch.create({
      data: {
        name,
        campaign,
        quantity,
        validity: validityDate,
        createdBy: user.id,
        metadata: JSON.stringify(batchMetadata), // Store tier and credits in metadata
      },
    });

    // Get the number of sublicenses based on tier
    const subLicenseCount = getSubLicenseCount(tier);

    // Generate the specified number of redeem codes
    const redeemCodes = [];
    for (let i = 0; i < quantity; i++) {
      redeemCodes.push({
        code: generateRedeemCode(),
        licenseKey: await generateUniqueLicenseKey(),
      });
    }

    // Create redeem codes, license keys, and sublicenses in the database
    const createdCodes = [];
    for (const { code, licenseKey } of redeemCodes) {
      // Create license key metadata
      const licenseMetadata: LicenseMetadata = { credits };

      // Create license key
      const license = await prismadb.licenseKey.create({
        data: {
          key: licenseKey,
          isActive: false, // Will be activated when redeemed
          vendor: "OLLY_PROMO",
          tier: parseInt(tier.substring(1)), // Extract the numeric part (e.g., T1 => 1)
          metadata: JSON.stringify(licenseMetadata), // Store credits in metadata
        },
      });

      // Create sublicenses if needed
      const sublicenses = [];
      for (let i = 0; i < subLicenseCount; i++) {
        const sublicenseKey = await generateUniqueSubLicenseKey();
        // Create sublicense metadata
        const sublicenseMetadata: SubLicenseMetadata = { parentTier: tier };

        const sublicense = await prismadb.subLicense.create({
          data: {
            key: sublicenseKey,
            status: "INACTIVE", // Will be activated when main license is redeemed
            mainLicenseKeyId: license.id,
            originalLicenseKey: licenseKey,
            vendor: "OLLY_PROMO",
            metadata: JSON.stringify(sublicenseMetadata), // Store parent tier in metadata
          },
        });
        sublicenses.push({
          key: sublicense.key,
          id: sublicense.id,
        });
      }

      // Create redeem code metadata with credits
      const redeemCodeMetadata = { credits };

      // Create redeem code linked to the batch and license key
      const redeemCode = await prismadb.redeemCode.create({
        data: {
          code,
          status: RedeemCodeStatus.ACTIVE,
          batchId: batch.id,
          licenseKeyId: license.id,
          metadata: JSON.stringify(redeemCodeMetadata), // Store credits in metadata
        },
      });
      createdCodes.push({
        code: redeemCode.code,
        licenseKey: license.key,
        tier,
        credits,
        sublicenses: sublicenses,
      });
    }
    return NextResponse.json(
      {
        success: true,
        message: "Redeem codes have been generated successfully",
        batch: {
          id: batch.id,
          name: batch.name,
          campaign: batch.campaign,
          quantity: batch.quantity,
          validity: batch.validity,
          tier,
          credits,
        },
        codes: createdCodes,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error generating redeem codes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while generating redeem codes",
      },
      { status: 500 },
    );
  }
}

/**
 * Get information about existing redeem code batches
 */
export async function GET(req: NextRequest) {
  try {
    // Validate the request to ensure only admins can view codes
    const { user } = await validateRequest();
    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Only admins can view redeem codes.",
        },
        { status: 403 },
      );
    }
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    if (batchId) {
      // Get a specific batch with its codes
      const batch = await prismadb.redeemCodeBatch.findUnique({
        where: { id: batchId },
        include: {
          codes: {
            take: limit,
            skip,
            orderBy: { createdAt: "desc" },
            include: {
              licenseKey: {
                include: {
                  subLicenses: true, // Include sublicenses
                },
              },
            },
          },
          _count: { select: { codes: true } },
        },
      });
      if (!batch) {
        return NextResponse.json(
          {
            success: false,
            error: "Batch not found",
          },
          { status: 404 },
        );
      }
      // Extract metadata
      let metadataObj: Partial<BatchMetadata> = {};
      try {
        if (batch.metadata) {
          //@ts-ignore
          metadataObj = JSON.parse(batch.metadata) as Partial<BatchMetadata>;
        }
      } catch (e) {
        console.error("Error parsing batch metadata:", e);
      }
      // Format the response
      const formattedBatch = {
        ...batch,
        tier: metadataObj.tier || "T1",
        credits: metadataObj.credits || 0,
      };
      return NextResponse.json({
        success: true,
        batch: formattedBatch,
        pagination: {
          total: batch._count.codes,
          page,
          limit,
          pages: Math.ceil(batch._count.codes / limit),
        },
      });
    } else {
      // Get all batches
      const batches = await prismadb.redeemCodeBatch.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { codes: true } },
        },
      });
      const totalBatches = await prismadb.redeemCodeBatch.count();
      // Format batches with metadata
      const formattedBatches = batches.map((batch) => {
        let metadataObj: Partial<BatchMetadata> = {};
        try {
          if (batch.metadata) {
            //@ts-ignore
            metadataObj = JSON.parse(batch.metadata) as Partial<BatchMetadata>;
          }
        } catch (e) {
          console.error("Error parsing batch metadata:", e);
        }
        return {
          ...batch,
          tier: metadataObj.tier || "T1",
          credits: metadataObj.credits || 0,
        };
      });
      return NextResponse.json({
        success: true,
        batches: formattedBatches,
        pagination: {
          total: totalBatches,
          page,
          limit,
          pages: Math.ceil(totalBatches / limit),
        },
      });
    }
  } catch (error) {
    console.error("Error fetching redeem codes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while fetching redeem codes",
      },
      { status: 500 },
    );
  }
}

// app/api/create-redeem-code/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import prismadb from "@/lib/prismadb";
// import { RedeemCodeStatus } from "@repo/db";
// import { validateRequest } from "@/lib/auth";
// import { randomUUID } from "crypto";

// /**
//  * Generate a random redeem code
//  */
// function generateRedeemCode() {
//   return Math.random().toString(36).substring(2, 12).toUpperCase();
// }

// /**
//  * Generate a unique license key with OLLYR prefix
//  * Format: OLLYR-XXXX-XXXX-XXXX-XXXX
//  */
// async function generateUniqueLicenseKey() {
//   // Keep trying until we get a unique key
//   let isUnique = false;
//   let licenseKey = "";

//   while (!isUnique) {
//     // Generate a UUID and format it
//     const uuid = randomUUID().replace(/-/g, "").toUpperCase();

//     // Format into parts
//     const parts = [
//       uuid.substring(0, 4),
//       uuid.substring(4, 8),
//       uuid.substring(8, 12),
//       uuid.substring(12, 16),
//     ];

//     // Add the OLLYR prefix
//     licenseKey = `OLLYR-${parts.join("-")}`;

//     // Check if this key already exists in the database
//     const existingKey = await prismadb.licenseKey.findUnique({
//       where: { key: licenseKey },
//     });

//     // If no existing key found, we have a unique one
//     if (!existingKey) {
//       isUnique = true;
//     }
//   }

//   return licenseKey;
// }

// /**
//  * Create a batch of redeem codes for promotional periods
//  */
// export async function POST(req: NextRequest) {
//   try {
//     // Validate the request to ensure only admins can create codes
//     const { user } = await validateRequest();
//     if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Unauthorized. Only admins can create redeem codes.",
//         },
//         { status: 403 },
//       );
//     }

//     // Parse request body
//     const body = await req.json();
//     const {
//       quantity = 10,
//       campaign = "Promotion",
//       validityDays = 30,
//       name = `Promo-${new Date().toISOString().split("T")[0]}`,
//     } = body;

//     // Validate input
//     if (quantity <= 0 || quantity > 1000) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Quantity must be between 1 and 1000",
//         },
//         { status: 400 },
//       );
//     }

//     // Calculate validity date
//     const validityDate = new Date();
//     validityDate.setDate(validityDate.getDate() + validityDays);

//     // Create a batch record
//     const batch = await prismadb.redeemCodeBatch.create({
//       data: {
//         name,
//         campaign,
//         quantity,
//         validity: validityDate,
//         createdBy: user.id,
//       },
//     });

//     // Generate the specified number of redeem codes
//     const redeemCodes = [];
//     for (let i = 0; i < quantity; i++) {
//       redeemCodes.push({
//         code: generateRedeemCode(),
//         licenseKey: await generateUniqueLicenseKey(),
//       });
//     }

//     // Create redeem codes and license keys in the database
//     const createdCodes = [];
//     for (const { code, licenseKey } of redeemCodes) {
//       // Create license key
//       const license = await prismadb.licenseKey.create({
//         data: {
//           key: licenseKey,
//           isActive: false, // Will be activated when redeemed
//           vendor: "OLLY_PROMO",
//         },
//       });

//       // Create redeem code linked to the batch and license key
//       const redeemCode = await prismadb.redeemCode.create({
//         data: {
//           code,
//           status: RedeemCodeStatus.ACTIVE,
//           batchId: batch.id,
//           licenseKeyId: license.id,
//         },
//       });

//       createdCodes.push({
//         code: redeemCode.code,
//         licenseKey: license.key,
//       });
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Redeem codes have been generated successfully",
//         batch: {
//           id: batch.id,
//           name: batch.name,
//           campaign: batch.campaign,
//           quantity: batch.quantity,
//           validity: batch.validity,
//         },
//         codes: createdCodes,
//       },
//       { status: 201 },
//     );
//   } catch (error) {
//     console.error("Error generating redeem codes:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "An error occurred while generating redeem codes",
//       },
//       { status: 500 },
//     );
//   }
// }

// /**
//  * Get information about existing redeem code batches
//  */
// export async function GET(req: NextRequest) {
//   try {
//     // Validate the request to ensure only admins can view codes
//     const { user } = await validateRequest();
//     if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Unauthorized. Only admins can view redeem codes.",
//         },
//         { status: 403 },
//       );
//     }

//     // Get query parameters
//     const { searchParams } = new URL(req.url);
//     const batchId = searchParams.get("batchId");
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const page = parseInt(searchParams.get("page") || "1");
//     const skip = (page - 1) * limit;

//     if (batchId) {
//       // Get a specific batch with its codes
//       const batch = await prismadb.redeemCodeBatch.findUnique({
//         where: { id: batchId },
//         include: {
//           codes: {
//             take: limit,
//             skip,
//             orderBy: { createdAt: "desc" },
//             include: { licenseKey: true },
//           },
//           _count: { select: { codes: true } },
//         },
//       });

//       if (!batch) {
//         return NextResponse.json(
//           {
//             success: false,
//             error: "Batch not found",
//           },
//           { status: 404 },
//         );
//       }

//       return NextResponse.json({
//         success: true,
//         batch,
//         pagination: {
//           total: batch._count.codes,
//           page,
//           limit,
//           pages: Math.ceil(batch._count.codes / limit),
//         },
//       });
//     } else {
//       // Get all batches
//       const batches = await prismadb.redeemCodeBatch.findMany({
//         take: limit,
//         skip,
//         orderBy: { createdAt: "desc" },
//         include: {
//           _count: { select: { codes: true } },
//         },
//       });

//       const totalBatches = await prismadb.redeemCodeBatch.count();

//       return NextResponse.json({
//         success: true,
//         batches,
//         pagination: {
//           total: totalBatches,
//           page,
//           limit,
//           pages: Math.ceil(totalBatches / limit),
//         },
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching redeem codes:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "An error occurred while fetching redeem codes",
//       },
//       { status: 500 },
//     );
//   }
// }
