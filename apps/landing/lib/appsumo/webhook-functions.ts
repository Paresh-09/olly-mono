import prismadb from "../prismadb";

export async function handleConvertedTeamLicenseChange(
    licenseKey: string,
    newLicenseKey: string,
    planId: string, 
    tierId: number,
    event: 'upgrade' | 'downgrade',
    userName: string,
    userEmail: string
) {
    try {
        // First check if the license key was previously converted to team
        const mainLicense = await prismadb.licenseKey.findFirst({
            where: { 
                key: licenseKey,
                converted_to_team: true
            },
            include: {
                subLicenses: {
                    include: {
                        assignedUser: true
                    }
                },
                organization: true
            }
        });

        // Then check if this is a converted team sub-license
        const subLicense = await prismadb.subLicense.findFirst({
            where: { 
                key: licenseKey,
                converted_to_team: true 
            },
            include: {
                mainLicenseKey: {
                    include: {
                        organization: true
                    }
                },
                assignedUser: true
            }
        });

        const now = new Date();

        // Case 1: This was a main license that was converted to team
        if (mainLicense) {
            // Reset the converted_to_team flag
            await prismadb.licenseKey.update({
                where: { id: mainLicense.id },
                data: {
                    converted_to_team: false,
                    organizationId: null
                }
            });

            // Find any sub-licenses that were converted to team
            const convertedSubLicenses = mainLicense.subLicenses.filter(sl => sl.converted_to_team);

            // Convert these back to independent licenses
            for (const sl of convertedSubLicenses) {
                const isActive = sl.status === "ACTIVE";
                
                // Check if license already exists
                const existingLicense = await prismadb.licenseKey.findUnique({
                    where: { key: sl.key }
                });

                let independentLicense;
                
                if (existingLicense) {
                    // Update existing license
                    independentLicense = await prismadb.licenseKey.update({
                        where: { key: sl.key },
                        data: {
                            isActive: isActive,
                            activatedAt: isActive ? sl.createdAt : null,
                            deActivatedAt: !isActive ? sl.deactivatedAt : null,
                            planId: sl.originalLicenseKey || undefined,
                            tier: 1,
                            isMainKey: true,
                            vendor: 'AppSumo',
                            converted_to_team: false
                        }
                    });
                } else {
                    // Create new license if it doesn't exist
                    independentLicense = await prismadb.licenseKey.create({
                        data: {
                            key: sl.key,
                            isActive: isActive,
                            activatedAt: isActive ? sl.createdAt : null,
                            deActivatedAt: !isActive ? sl.deactivatedAt : null,
                            planId: sl.originalLicenseKey || undefined,
                            tier: 1,
                            isMainKey: true,
                            vendor: 'AppSumo',
                            converted_to_team: false
                        }
                    });
                }

                // If the sub-license had an assigned user, create/update the user-license relationship
                if (sl.assignedUser) {
                    // Upsert the user-license relationship
                    await prismadb.userLicenseKey.upsert({
                        where: {
                            userId_licenseKeyId: {
                                userId: sl.assignedUser.id,
                                licenseKeyId: independentLicense.id
                            }
                        },
                        update: {},
                        create: {
                            userId: sl.assignedUser.id,
                            licenseKeyId: independentLicense.id
                        }
                    });

                    // Create installation record if it doesn't exist
                    const existingInstallation = await prismadb.installation.findFirst({
                        where: {
                            licenseKeyId: independentLicense.id,
                            userId: sl.assignedUser.id
                        }
                    });

                    if (!existingInstallation) {
                        await prismadb.installation.create({
                            data: {
                                status: isActive ? 'INSTALLED' : 'UNINSTALLED',
                                licenseKeyId: independentLicense.id,
                                userId: sl.assignedUser.id
                            }
                        });
                    }
                }

                // Delete the sub-license
                await prismadb.subLicense.delete({
                    where: { id: sl.id }
                });
            }

            // If there was an organization, update it
            if (mainLicense.organization) {
                await prismadb.organization.update({
                    where: { id: mainLicense.organization.id },
                    data: {
                        isPremium: false,
                        mainLicenseKeyId: null
                    }
                });
            }
        }

        // Case 2: This was a sub-license that was converted to team
        if (subLicense) {
            // Check if new license already exists
            const existingLicense = await prismadb.licenseKey.findUnique({
                where: { key: newLicenseKey }
            });

            let newLicense;
            if (existingLicense) {
                // Update existing license
                newLicense = await prismadb.licenseKey.update({
                    where: { key: newLicenseKey },
                    data: {
                        isActive: true,
                        activatedAt: now,
                        planId: planId,
                        tier: tierId,
                        isMainKey: true,
                        vendor: 'AppSumo',
                        converted_to_team: false
                    }
                });
            } else {
                // Create new license
                newLicense = await prismadb.licenseKey.create({
                    data: {
                        key: newLicenseKey,
                        isActive: true,
                        activatedAt: now,
                        planId: planId,
                        tier: tierId,
                        isMainKey: true,
                        vendor: 'AppSumo',
                        converted_to_team: false
                    }
                });
            }

            // Rest of the code remains the same...
            const user = await prismadb.user.upsert({
                where: { email: userEmail },
                update: {},
                create: {
                    email: userEmail,
                    name: userName,
                }
            });

            // Upsert UserLicenseKey relationship
            await prismadb.userLicenseKey.upsert({
                where: {
                    userId_licenseKeyId: {
                        userId: user.id,
                        licenseKeyId: newLicense.id
                    }
                },
                update: {},
                create: {
                    userId: user.id,
                    licenseKeyId: newLicense.id,
                }
            });

            // Create Installation record if it doesn't exist
            const existingInstallation = await prismadb.installation.findFirst({
                where: {
                    licenseKeyId: newLicense.id,
                    userId: user.id
                }
            });

            if (!existingInstallation) {
                await prismadb.installation.create({
                    data: {
                        status: 'INSTALLED',
                        licenseKeyId: newLicense.id,
                    }
                });
            }

            // Deactivate the old sub-license
            await prismadb.subLicense.update({
                where: { id: subLicense.id },
                data: {
                    status: 'INACTIVE',
                    deactivatedAt: now,
                    converted_to_team: false
                }
            });

            // Update the main license's team status if needed
            const remainingActiveSubLicenses = await prismadb.subLicense.count({
                where: {
                    mainLicenseKeyId: subLicense.mainLicenseKey.id,
                    status: 'ACTIVE'
                }
            });

            if (remainingActiveSubLicenses === 0) {
                await prismadb.licenseKey.update({
                    where: { id: subLicense.mainLicenseKey.id },
                    data: {
                        tier: 1,
                        converted_to_team: false
                    }
                });

                if (subLicense.mainLicenseKey.organization) {
                    await prismadb.organization.update({
                        where: { id: subLicense.mainLicenseKey.organization.id },
                        data: {
                            isPremium: false,
                            mainLicenseKeyId: null
                        }
                    });
                }
            }
        }

        return {
            success: true,
            message: `License ${event}d and team conversion status updated: ${newLicenseKey}`
        };

    } catch (error) {
        console.error(`Error handling converted team license change:`, error);
        throw error;
    }
}