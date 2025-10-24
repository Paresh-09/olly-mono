import { PrismaClient } from "@repo/db";
import { v4 as uuidv4 } from 'uuid';
const prisma = new PrismaClient();

async function createAdminLicenseWithSublicense() {
  try {
    // Get the admin user (assuming there's only one admin in the system)
    const adminUser = await prisma.user.findFirst({
      where: {
        isAdmin: true,
      },
    });

    if (!adminUser) {
      console.error("Admin user not found");
      return;
    }

    console.log(`Found admin user: ${adminUser.name} (${adminUser.email})`);

    // Generate license keys
    const mainLicenseKey = `MAIN-${uuidv4().slice(0, 8).toUpperCase()}`;
    const subLicenseKey = `SUB-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Create the main license key
    const newMainLicense = await prisma.licenseKey.create({
      data: {
        key: mainLicenseKey,
        isActive: true,
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        vendor: "DIRECT",
        tier: 1,
        isMainKey: true,
        // Connect it to the admin user
        users: {
          create: {
            userId: adminUser.id,
          },
        },
        // Create license settings
        settings: {
          create: {
            userName: adminUser.name || "Admin User",
            model: "gpt-4",
            replyTone: "Professional",
            replyLength: "Medium",
          },
        },
        // Add custom knowledge (optional)
        customKnowledge: {
          create: {
            brandName: "Admin's Brand",
            industry: "Technology",
            targetAudience: "Professionals",
            isPersonalBrand: true,
          }
        }
      },
    });

    console.log(`Created main license key: ${mainLicenseKey}`);

    // Now create a sublicense associated with the main license
    const newSubLicense = await prisma.subLicense.create({
      data: {
        key: subLicenseKey,
        status: "ACTIVE",
        originalLicenseKey: mainLicenseKey,
        mainLicenseKeyId: newMainLicense.id, // This connects to the main license key
        vendor: "DIRECT",
        assignedUserId: adminUser.id, // Optionally assign to the admin user
        assignedEmail: adminUser.email,
        // Create settings for the sublicense
        settings: {
          create: {
            userName: `${adminUser.name || "Admin"} (Sub)`,
            model: "gpt-4",
            replyTone: "Casual",
            replyLength: "Short",
          }
        }
      },
    });

    console.log(`Created sublicense: ${subLicenseKey}`);

    // Create a goal for the sublicense (optional)
    const goal = await prisma.subLicenseGoal.create({
      data: {
        subLicenseId: newSubLicense.id,
        userId: adminUser.id,
        platform: "LinkedIn",
        goal: "Increase engagement rate by 30%",
        daysToAchieve: 30,
      },
    });

    console.log(`Created goal for the sublicense`);

    // Create an organization if needed and connect the main license to it
    const existingOrg = await prisma.organization.findFirst({
      where: {
        users: {
          some: {
            userId: adminUser.id,
            role: "OWNER",
          }
        }
      }
    });

    if (existingOrg) {
      // Update existing organization with the new main license
      await prisma.organization.update({
        where: {
          id: existingOrg.id,
        },
        data: {
          mainLicenseKeyId: newMainLicense.id,
        },
      });

      console.log(`Updated existing organization with the new main license`);
    } else {
      // Create a new organization with this license
      const plan = await prisma.organizationPlan.findFirst({
        where: {
          name: "T1",
        },
      });

      if (plan) {
        const newOrg = await prisma.organization.create({
          data: {
            name: `${adminUser.name || "Admin"}'s Organization`,
            isPremium: true,
            planId: plan.id,
            mainLicenseKeyId: newMainLicense.id,
            users: {
              create: {
                userId: adminUser.id,
                role: "OWNER",
              },
            },
          },
        });

        console.log(`Created new organization with the main license`);
      }
    }

    return {
      mainLicense: newMainLicense,
      subLicense: newSubLicense,
      goal: goal,
    };
  } catch (error) {
    console.error("Error creating licenses:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminLicenseWithSublicense()
  .then((result) => {
    console.log("Successfully created licenses:");
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error("Failed to create licenses:", error);
  });
