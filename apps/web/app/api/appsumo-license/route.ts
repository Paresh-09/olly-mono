import { NextRequest, NextResponse } from "next/server";
import { sendDiscordNotification } from "@/service/discord-notify";
import { google, sheets_v4 } from 'googleapis';
import prismadb from "@/lib/prismadb";
import { sendPersonalGoodbyeEmail } from "@/lib/emails/goodbye";
import { sendPlanChangeEmail } from "@/lib/emails/plan-change";

import { v4 as uuidv4 } from 'uuid';
import { PlanVendor, Prisma, TransactionType } from "@repo/db";
import { handleConvertedTeamLicenseChange } from "@/lib/appsumo/webhook-functions";
import { deactivateUserSubscription, handlePlanUpdate } from "@/utils/plans/plan-management";

const PLAN_IDS = {
    INDIVIDUAL: process.env.APPSUMO_INDIVIDUAL_TIER_ID || "1",
    TEAM: process.env.APPSUMO_TEAM_TIER_ID || "2",
    AGENCY: process.env.APPSUMO_AGENCY_TIER_ID || "3",
    ENTERPRISE: process.env.APPSUMO_ENTERPRISE_TIER_ID || "4"
};

type TierNumber = 1 | 2 | 3 | 4;

const TIER_CREDITS: Record<TierNumber, number> = {
    1: 100,  // Individual tier = 100 credits
    2: 500,  // Team tier = 500 credits
    3: 1000, // Agency tier = 1000 credits
    4: 2000  // Enterprise tier = 2000 credits
};

async function adjustLLMCredits(userId: string, newTier: TierNumber, prevTier: TierNumber) {
    try {
        const newTierCredits = TIER_CREDITS[newTier];
        const prevTierCredits = TIER_CREDITS[prevTier];
        const creditAdjustment = newTierCredits - prevTierCredits;

        if (creditAdjustment !== 0) {
            // Update user's credit balance
            const userCredit = await prismadb.userCredit.upsert({
                where: { userId },
                update: { 
                    balance: {
                        increment: creditAdjustment // This will add or subtract based on the sign
                    }
                },
                create: {
                    userId,
                    balance: Math.max(0, creditAdjustment), // Ensure non-negative for new users
                },
            });

            // Create a credit transaction record
            await prismadb.creditTransaction.create({
                data: {
                    userCreditId: userCredit.id,
                    amount: creditAdjustment,
                    type: TransactionType.PLAN_CREDITS_ADJUSTED,
                    description: `Plan change credit adjustment (tier ${prevTier} → ${newTier}): ${Math.abs(creditAdjustment)} credits ${creditAdjustment > 0 ? 'added' : 'removed'}`,
                },
            });

            return creditAdjustment;
        }

        return 0;
    } catch (error) {
        console.error('Error adjusting LLM credits:', error);
        throw error;
    }
}

type TierConfig = {
    subLicenses: number;
};

// Define the TIER_CONFIGS object with a proper type
const TIER_CONFIGS: { [key: number]: TierConfig } = {
    1: { subLicenses: 0 },
    2: { subLicenses: 5 },
    3: { subLicenses: 10 },
    4: { subLicenses: 20 }
};

async function deactivateSubLicense(subLicenseKey: string) {
    try {
        const subLicense = await prismadb.subLicense.findUnique({
            where: { key: subLicenseKey }
        });

        if (!subLicense) {
            console.warn(`Sub-license ${subLicenseKey} not found`);
            return null;
        }

        const updatedSubLicense = await prismadb.subLicense.update({
            where: { key: subLicenseKey },
            data: {
                status: "INACTIVE",
                deactivatedAt: new Date()
            }
        });

        return updatedSubLicense;
    } catch (error) {
        console.error(`Error deactivating sub-license ${subLicenseKey}:`, error);
        throw error;
    }
}

async function deactivateLicenseAndSubLicenses(licenseKey: string) {
    try {
        // First, get the license key record with its sub-licenses
        const licenseKeyRecord = await prismadb.licenseKey.findUnique({
            where: { key: licenseKey },
            include: { subLicenses: true }
        });

        if (!licenseKeyRecord) {
            console.warn(`License key ${licenseKey} not found for deactivation`);
            return;
        }

        // Update the main license key
        await prismadb.licenseKey.update({
            where: { key: licenseKey },
            data: { 
                isActive: false,
                deActivatedAt: new Date()
            }
        });
        
        // If there are sub-licenses, update them all to inactive
        if (licenseKeyRecord.subLicenses.length > 0) {
            await prismadb.subLicense.updateMany({
                where: { mainLicenseKeyId: licenseKeyRecord.id },
                data: { 
                    status: "INACTIVE",
                    deactivatedAt: new Date(),
                    originalLicenseKey: licenseKey // Store the original license key
                }
            });
        }
    } catch (error) {
        console.error(`Error deactivating license key and sub-licenses:`, error);
        throw error;
    }
}

function validateTier(tier: number): number {
    if (tier >= 1 && tier <= 4) {
        return tier;
    }
    return 1; // Default to individual tier if invalid
}

async function deactivatePreviousLicense(prevLicenseKey: string) {
    try {
        const deactivatedLicense = await prismadb.licenseKey.update({
            where: { key: prevLicenseKey },
            data: { 
                isActive: false,
                deActivatedAt: new Date()
            },
            include: { subLicenses: true }
        });
        
        if (deactivatedLicense.subLicenses.length > 0) {
            await prismadb.subLicense.updateMany({
                where: { mainLicenseKeyId: deactivatedLicense.id },
                data: { status: "INACTIVE" }
            });
        }
    } catch (error) {
        console.error(`Error deactivating previous license key:`, error);
        throw error;
    }
}

async function createSubLicenses(mainLicenseKey: string, tierId: number, status: string) {
    try {
        const tierConfig = TIER_CONFIGS[tierId];
        if (!tierConfig) {
            console.warn(`Unknown tier ID: ${tierId}. No sub-licenses created.`);
            return;
        }

        const subLicenseCount = tierConfig.subLicenses;
        if (subLicenseCount === 0) {
            return;
        }

        // Fetch the LicenseKey record
        const licenseKeyRecord = await prismadb.licenseKey.findUnique({
            where: { key: mainLicenseKey },
            include: { subLicenses: true }
        });

        if (!licenseKeyRecord) {
            throw new Error(`LicenseKey record not found for key: ${mainLicenseKey}`);
        }

        // Check for existing sub-licenses
        if (licenseKeyRecord.subLicenses.length === subLicenseCount) {
            return;
        }

        // Check for existing inactive sub-licenses with the same original license key
        const existingInactiveSubLicenses = await prismadb.subLicense.findMany({
            where: {
                originalLicenseKey: mainLicenseKey,
                status: "INACTIVE"
            }
        });

        if (existingInactiveSubLicenses.length > 0) {
            console.log(`Found inactive sub-licenses from original license key `);
            // You might want to handle these differently or notify the user
        }

        // Create new sub-licenses if needed
        const newLicensesNeeded = subLicenseCount - licenseKeyRecord.subLicenses.length;
        for (let i = 0; i < newLicensesNeeded; i++) {
            let subLicenseKey = uuidv4();
            let created = false;

            while (!created) {
                try {
                    await prismadb.subLicense.create({
                        data: {
                            key: subLicenseKey,
                            status: status,
                            originalLicenseKey: mainLicenseKey,
                            mainLicenseKey: {
                                connect: { id: licenseKeyRecord.id }
                            }
                        }
                    });
                    created = true;
                } catch (error: any) {
                    if (error.code === 'P2002') {
                        console.warn(`Duplicate sub-license key generated. Retrying with a new UUID.`);
                        subLicenseKey = uuidv4();
                    } else {
                        console.error(`Error creating sub-license:`, error);
                        break;
                    }
                }
            }
        }

        console.log(`Created new sub-licenses for main license key: `);
    } catch (error) {
        console.error(`Error managing sub-licenses for :`, error);
        throw error;
    }
}

function validateWebhook(timestamp: string, signature: string): boolean {
    const currentTime = Date.now();
    const webhookTime = parseInt(timestamp, 10);
    const fiveMinutesAgo = currentTime - 5 * 60 * 1000;

    if (isNaN(webhookTime) || webhookTime < fiveMinutesAgo || webhookTime > currentTime) {
        console.error("Invalid or outdated timestamp");
        return false;
    }

    if (typeof signature !== 'string' || signature.length === 0) {
        console.error("Invalid signature format");
        return false;
    }

    return true;
}

async function updateDatabase(userName: string, userEmail: string, licenseKey: string, planId: string, tierId: number, status: string, prevLicenseKey?: string, event?: string) {
    try {
        const isActive = status === "ACTIVE";
        const now = new Date();

        // Create or update the new LicenseKey
        const licenseKeyRecord = await prismadb.licenseKey.upsert({
            where: { key: licenseKey },
            update: {
                isActive: isActive,
                activatedAt: isActive ? now : undefined,
                planId: planId,
                tier: tierId,
                isMainKey: true,
                vendor: 'AppSumo'
            },
            create: {
                key: licenseKey,
                isActive: isActive,
                activatedAt: isActive ? now : undefined,
                planId: planId,
                tier: tierId,
                isMainKey: true,
                vendor: 'AppSumo'
            },
        });

        let user;

        if (prevLicenseKey && event === 'upgrade') {
            // Find the user associated with the previous license key
            const prevUserLicenseKey = await prismadb.userLicenseKey.findFirst({
                where: { licenseKey: { key: prevLicenseKey } },
                include: { user: true },
            });

            if (prevUserLicenseKey) {
                user = prevUserLicenseKey.user;

                // Deactivate the previous license key
                await prismadb.licenseKey.update({
                    where: { key: prevLicenseKey },
                    data: { isActive: false, deActivatedAt: now },
                });

                try {
                    await prismadb.subLicense.updateMany({
                        where: { mainLicenseKeyId: prevLicenseKey },
                        data: { status: "INACTIVE" }
                    });
                    console.log(`Updated all sub-licenses for  to INACTIVE`);
                } catch (error) {
                    console.error(`Error updating sub-licenses:`, error);
                }

                // Delete the UserLicenseKey record for the previous license key
                await prismadb.userLicenseKey.delete({
                    where: {
                        userId_licenseKeyId: {
                            userId: user.id,
                            licenseKeyId: prevUserLicenseKey.licenseKeyId,
                        },
                    },
                });

                console.log(`Deactivated previous license key  and deleted UserLicenseKey record for user `);
            }

            // If user is still undefined (no previous license key or couldn't find user), create or update the user
            if (!user) {
                user = await prismadb.user.upsert({
                    where: { email: userEmail },
                    update: {},
                    create: {
                        email: userEmail,
                        name: userName,
                    },
                });
            }

            // Now that we're sure user is defined, create the new UserLicenseKey relationship
            await prismadb.userLicenseKey.create({
                data: {
                    userId: user.id,
                    licenseKeyId: licenseKeyRecord.id,
                },
            });

            console.log(`Created new UserLicenseKey for user with license key`);

            // Create an Installation record
            await prismadb.installation.create({
                data: {
                    status: isActive ? 'INSTALLED' : 'UNINSTALLED',
                    licenseKeyId: licenseKeyRecord.id,
                },
            });
    
            // Update or create Leaderboard entry
            await prismadb.leaderboard.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                    userId: user.id,
                },
            });
    
            console.log('Successfully updated Prisma database');
        }

        if (prevLicenseKey && event === 'downgrade') {
            // Find the user associated with the previous license key
            const prevUserLicenseKey = await prismadb.userLicenseKey.findFirst({
                where: { licenseKey: { key: prevLicenseKey } },
                include: { user: true },
            });

            if (prevUserLicenseKey) {
                user = prevUserLicenseKey.user;

                // Deactivate the previous license key
                await prismadb.licenseKey.update({
                    where: { key: prevLicenseKey },
                    data: { isActive: false, deActivatedAt: now },
                });

                try {
                    await prismadb.subLicense.updateMany({
                        where: { mainLicenseKeyId: prevLicenseKey },
                        data: { status: "INACTIVE" }
                    });
                    console.log(`Updated all sub-licenses for to INACTIVE`);
                } catch (error) {
                    console.error(`Error updating sub-licenses:`, error);
                }

                // Delete the UserLicenseKey record for the previous license key
                await prismadb.userLicenseKey.delete({
                    where: {
                        userId_licenseKeyId: {
                            userId: user.id,
                            licenseKeyId: prevUserLicenseKey.licenseKeyId,
                        },
                    },
                });

                console.log(`Deactivated previous license key  and deleted UserLicenseKey record for user `);
            }

            // If user is still undefined (no previous license key or couldn't find user), create or update the user
            if (!user) {
                user = await prismadb.user.upsert({
                    where: { email: userEmail },
                    update: {},
                    create: {
                        email: userEmail,
                        name: userName,
                    },
                });
            }

            // Now that we're sure user is defined, create the new UserLicenseKey relationship
            await prismadb.userLicenseKey.create({
                data: {
                    userId: user.id,
                    licenseKeyId: licenseKeyRecord.id,
                },
            });

          

            // Create an Installation record
            await prismadb.installation.create({
                data: {
                    status: isActive ? 'INSTALLED' : 'UNINSTALLED',
                    licenseKeyId: licenseKeyRecord.id,
                },
            });
    
            // Update or create Leaderboard entry
            await prismadb.leaderboard.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                    userId: user.id,
                },
            });
    
            console.log('Successfully updated Prisma database');
        }

        // Create sub-licenses for the new license key
        if (tierId !== 1 && TIER_CONFIGS[tierId]) {
            await createSubLicenses(licenseKey, tierId, status);
        }

    } catch (error) {
        console.error('Error updating database:', error);
        throw error;
    }
}

export async function POST(req: NextRequest) {
    const timestamp = req.headers.get('X-AppSumo-Timestamp');
    const signature = req.headers.get('X-AppSumo-Signature');

    if (!timestamp || !signature) {
        console.error("Missing required AppSumo headers");
        return new NextResponse("Missing required headers", { status: 400 });
    }

    if (!validateWebhook(timestamp, signature)) {
        console.error("Webhook validation failed");
        return new NextResponse("Webhook validation failed", { status: 401 });
    }

    const bodyText = await req.text();

    let body;
    try {
        body = JSON.parse(bodyText);
    } catch (error) {
        console.error("Error parsing JSON body:", error);
        return new NextResponse("Invalid JSON body", { status: 400 });
    }

    const event = body.event as string;
    const licenseKey = body.license_key as string;
    const prevLicenseKey = body.prev_license_key as string;
    const planId = body.plan_id as string;
    const licenseStatus = body.license_status as string;
    const tier = body.tier as number;
    const tierId = body.tier as number;
    const isTest = body.test as boolean;
    const userName = body.user_name || '';
    const userEmail = body.user_email || '';

    let message = "";
    let status = "";
    let sendGoodbyeEmail = false;
    let errors = [];

    switch (event) {
        case "purchase":
            message = `🎉 New purchase! License key: ${licenseKey}, Plan: ${planId}, Tier: ${tier}`;
            status = "ACTIVE";
            break;
    
        case "activate":
            status = "ACTIVE";
            message = `✅ License activated! Key: ${licenseKey}, Plan: ${planId}, Tier: ${tier}`;
            
            if (userEmail) {
                try {
                    const user = await prismadb.user.findUnique({
                        where: { email: userEmail }
                    });
                    
                    if (user) {
                        await handlePlanUpdate({
                            userId: user.id,
                            vendor: PlanVendor.APPSUMO,
                            appsumoTier: tier
                        });
                        console.log(`Successfully updated plan `);
                    } else {
                        console.warn(`User not found for email`);
                        errors.push("User not found for plan update");
                    }
                } catch (error) {
                    console.error('Failed to update plan:', error);
                    errors.push("Plan update failed but continuing with other operations");
                }
            }
            break;
    
        case "upgrade":
        case "downgrade":
            const actionType = event === "upgrade" ? "upgraded" : "downgraded";
            status = "ACTIVE";
            
            try {
                // First check if this is a converted team license
                const convertedTeamResult = await handleConvertedTeamLicenseChange(
                    prevLicenseKey,
                    licenseKey,
                    planId,
                    tierId,
                    event as 'upgrade' | 'downgrade',
                    userName,
                    userEmail
                );
        
                if (convertedTeamResult) {
                    message = `${event === "upgrade" ? "⬆️" : "⬇️"} Converted team license ${actionType}! ` +
                        `New key: ${licenseKey}, Previous sub-license key: ${prevLicenseKey}, New tier: ${tier}`;
                } else {
                    // Handle regular license upgrade/downgrade
                    message = `${event === "upgrade" ? "⬆️" : "⬇️"} License ${actionType}! ` +
                        `New key: ${licenseKey}, Previous key: ${prevLicenseKey}, New tier: ${tier}`;

                    // Get the previous license to find the user and previous tier
                    const prevLicense = await prismadb.licenseKey.findFirst({
                        where: { key: prevLicenseKey },
                        include: {
                            users: {
                                include: { user: true }
                            }
                        }
                    });

                    if (prevLicense?.users[0]?.user) {
                        const user = prevLicense.users[0].user;
                        const prevTier = (prevLicense.tier || 1) as TierNumber;
                        const newTier = (tier || 1) as TierNumber;

                        // Adjust credits based on tier change
                        const creditAmount = await adjustLLMCredits(user.id, newTier, prevTier);
                        if (creditAmount !== 0) {
                            const adjustmentText = creditAmount > 0 ? `added ${creditAmount}` : `removed ${Math.abs(creditAmount)}`;
                            message += `, Credits ${adjustmentText}`;
                        }

                        // Update the user's plan
                        await handlePlanUpdate({
                            userId: user.id,
                            vendor: PlanVendor.APPSUMO,
                            appsumoTier: tier
                        });
                        console.log(`Successfully updated plan `);

                        // Send plan change email if we have the user's name and email
                        if (user.name && user.email) {
                            const firstName = user.name.split(' ')[0];
                            await sendPlanChangeEmail(firstName, user.email, event === "upgrade", tier);
                         
                        }
                    } else {
                        console.warn(`User not found for previous license key`);
                        errors.push("User not found for credit adjustment and plan update");
                    }
        
                    if (prevLicenseKey) {
                        await deactivatePreviousLicense(prevLicenseKey);
                    }
                    await updateDatabase(userName, userEmail, licenseKey, planId, tierId, status, prevLicenseKey, event);
                }
            } catch (error) {
                console.error('Error handling license change:', error);
                errors.push("Failed to process license change");
            }
            break;
    
        case "deactivate":
            message = `❌ License deactivated! Key: ${licenseKey}, Plan: ${planId}, Tier: ${tier}`;
            status = "INACTIVE";
            sendGoodbyeEmail = true;

            if (userEmail) {
                try {
                    const user = await prismadb.user.findUnique({
                        where: { email: userEmail }
                    });
                    
                    if (user) {
                        await deactivateUserSubscription(user.id);
                        console.log(`Successfully deactivated subscription`);
                    } else {
                        console.warn(`User not found for email`);
                        errors.push("User not found for subscription deactivation");
                    }
                } catch (error) {
                    console.error('Failed to deactivate subscription:', error);
                    errors.push("Subscription deactivation failed but continuing with other operations");
                }
            }

            try {
                const subLicense = await prismadb.subLicense.findFirst({
                    where: { key: licenseKey }
                });

                if (subLicense) {
                    // This is a sub-license deactivation
                    await deactivateSubLicense(licenseKey);
                    message = `❌ Sub-license deactivated! Key: ${licenseKey}`;
                } else {
                    // This is a main license deactivation
                    await deactivateLicenseAndSubLicenses(licenseKey);
                }
            } catch (error) {
                console.error('Error handling deactivation:', error);
                errors.push("Failed to process deactivation");
            }
            break;
    
        case "refund":
            message = `💸 License refunded! Key: ${licenseKey}, Plan: ${planId}, Tier: ${tier}`;
            status = "INACTIVE";
            sendGoodbyeEmail = true;

            try {
                // Find the user associated with the license key
                const licenseRecord = await prismadb.licenseKey.findFirst({
                    where: { key: licenseKey },
                    include: {
                        users: {
                            include: { user: true }
                        }
                    }
                });

                if (licenseRecord?.users[0]?.user) {
                    const user = licenseRecord.users[0].user;
                    const currentTier = (licenseRecord.tier || 1) as TierNumber;
                    
                    // On refund, we remove all credits from the current tier
                    const creditDeduction = -TIER_CREDITS[currentTier];
                    
                    // Update user's credit balance
                    const userCredit = await prismadb.userCredit.upsert({
                        where: { userId: user.id },
                        update: { 
                            balance: {
                                increment: creditDeduction
                            }
                        },
                        create: {
                            userId: user.id,
                            balance: 0
                        },
                    });

                    // Create a credit transaction record
                    await prismadb.creditTransaction.create({
                        data: {
                            userCreditId: userCredit.id,
                            amount: creditDeduction,
                            type: TransactionType.PLAN_CREDITS_ADJUSTED,
                            description: `Refund credit adjustment (tier ${currentTier}): ${Math.abs(creditDeduction)} credits removed`,
                        },
                    });

                    message += `, Removed ${Math.abs(creditDeduction)} credits`;
                } else {
                    console.warn(`User not found for license key: ${licenseKey}`);
                    errors.push("User not found for credit deduction");
                }
            } catch (error) {
                console.error('Error handling credit deduction for refund:', error);
                errors.push("Credit deduction failed but continuing with other operations");
            }
            
            break;
    
        default:
            message = `Unhandled event: ${event} for license key: ${licenseKey}`;
            status = "UNKNOWN";
    }

    try {
        await sendDiscordNotification(message, !isTest);
    } catch (error) {
        console.error(`Error sending Discord notification:`, error);
        errors.push("Discord notification failed");
    }

    try {
        if (prevLicenseKey) {
            await deactivatePreviousLicense(prevLicenseKey);
        }
        await updateDatabase(userName, userEmail, licenseKey, planId, tierId, status, prevLicenseKey, event);
    } catch (error) {
        console.error(`Error updating database:`, error);
        errors.push("Database update failed");
    }

    if ((event === "upgrade" || event === "downgrade") && userName && userEmail) {
        try {
            const firstName = userName.split(' ')[0];
            await sendPlanChangeEmail(firstName, userEmail, event === "upgrade", tier);
            console.log(`Plan change email sent `);
        } catch (error) {
            console.error(`Error sending plan change email:`, error);
            errors.push("Plan change email failed");
        }
    }

    if (sendGoodbyeEmail && !isTest && userName && userEmail) {
        try {
            const firstName = userName.split(' ')[0];
            await sendPersonalGoodbyeEmail(firstName, userEmail);
            console.log(`Goodbye email sent  `);
        } catch (error) {
            console.error(`Error sending goodbye email:`, error);
            errors.push("Goodbye email sending failed");
        }
    } else if (sendGoodbyeEmail && !isTest) {
        console.warn("Skipping goodbye email: missing user name or email");
        errors.push("Goodbye email skipped due to missing information");
    }

    // For deactivation and refund events, update all associated sub-licenses to INACTIVE
    if (status === "INACTIVE") {
        try {
            await prismadb.subLicense.updateMany({
                where: { mainLicenseKeyId: licenseKey },
                data: { status: "INACTIVE" }
            });
            console.log(`Updated all sub-licenses for to INACTIVE`);
        } catch (error) {
            console.error(`Error updating sub-licenses:`, error);
            errors.push("Sub-license update failed");
        }
    }

    return new NextResponse(JSON.stringify({
        success: true,
        event: event,
        message: "Webhook processed",
        errors: errors.length > 0 ? errors : undefined
    }), { status: 200 });
}