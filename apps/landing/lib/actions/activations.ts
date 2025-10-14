// lib/actions/activations.ts
'use server'

import prismadb from "../prismadb";

export async function getUserActivationsAndLicenses(userId: string, selectedLicense: string = 'all') {
  try {
    const userLicenses = await prismadb.userLicenseKey.findMany({
      where: { 
        userId: userId,
        licenseKey: {
          isActive: true,
        }
      },
      select: {
        licenseKey: {
          select: {
            id: true,
            key: true,
            subLicenses: {
              where: {
                status: 'ACTIVE',
                assignedUserId: userId,
              },
              select: {
                id: true,
                key: true,
              }
            },
          }
        }
      }
    });

    const licenseIds = userLicenses.map(ul => ul.licenseKey.id);

    const activations = await prismadb.activation.findMany({
      where: {
        licenseKeyId: {
          in: licenseIds
        },
        ...(selectedLicense !== 'all' ? { licenseKeyId: selectedLicense } : {})
      },
      select: {
        id: true,
        activatedAt: true,
        licenseKeyId: true,
        userId: true,
        deviceType: true,
        deviceModel: true,
        osVersion: true,
        browser: true,
        browserVersion: true,
        ipAddress: true,
      }
    });

    const licenses = userLicenses.flatMap(ul => [
      {
        id: ul.licenseKey.id,
        key: ul.licenseKey.key,
        type: 'license'
      },
      ...ul.licenseKey.subLicenses.map(sl => ({
        id: sl.id,
        key: sl.key,
        type: 'sublicense',
        parentLicenseId: ul.licenseKey.id
      }))
    ]);

    const formattedActivations = activations.map(a => ({
      id: a.id,
      licenseKeyId: a.licenseKeyId,
      activatedAt: a.activatedAt.toISOString(),
      userId: a.userId,
      deviceType: a.deviceType,
      deviceModel: a.deviceModel,
      osVersion: a.osVersion,
      browser: a.browser,
      browserVersion: a.browserVersion,
      ipAddress: a.ipAddress,
    }));

    return { 
      success: JSON.stringify({
        activations: formattedActivations,
        licenses,
      })
    };
  } catch (error) {
    console.error('Failed to fetch user activations and licenses:', error);
    return { error: 'Failed to fetch user activations and licenses' };
  }
}

export async function deactivateDevice(userId: string, activationId: string) {
  try {
    const updatedActivation = await prismadb.activation.updateMany({
      where: {
        id: activationId,
        userId: userId
      },
      data: {
        currentlyActivated: false
      }
    });

    if (updatedActivation.count === 0) {
      return { error: 'Activation not found' };
    }

    return { success: 'Device deactivated successfully' };
  } catch (error) {
    console.error('Failed to deactivate device:', error);
    return { error: 'Failed to deactivate device' };
  }
}