import { PlanTier, PlanDuration, PlanVendor, UserSubscription } from '@prisma/client'
import prismadb from "@/lib/prismadb"
import { getMaxUsersByTier, getPlanFromAppSumoTier, getTierFromProductId } from '@/lib/plans/plans-config'

interface PlanManagementParams {
  userId: string
  vendor: PlanVendor
  productId?: string    // For LemonSqueezy
  appsumoTier?: number  // For AppSumo
  endDate?: Date        // For monthly plans
}

const ENTERPRISE_PRODUCT_IDS = process.env.LEMON_ENTERPRISE_PRODUCT_IDS?.split(',').map(Number) || [363041, 363064];
const AGENCY_PRODUCT_IDS = process.env.LEMON_AGENCY_PRODUCT_IDS?.split(',').map(Number) || [363063, 321751];
const TEAM_PRODUCT_IDS = process.env.LEMON_TEAM_PRODUCT_IDS?.split(',').map(Number) || [363062, 363040];
const INDIVIDUAL_PRODUCT_IDS = process.env.LEMON_INDIVIDUAL_PRODUCT_IDS?.split(',').map(Number) || [328561, 285937];

export async function handlePlanUpdate({
  userId,
  vendor,
  productId,
  appsumoTier,
  endDate
}: PlanManagementParams) {
  try {
    // Get the plan details based on vendor
    let planTier: PlanTier | undefined
    let duration: PlanDuration = PlanDuration.LIFETIME // Default to lifetime

    if (vendor === PlanVendor.APPSUMO) {
      if (!appsumoTier) throw new Error('AppSumo tier is required')
      const plan = getPlanFromAppSumoTier(appsumoTier)
      if (!plan) throw new Error(`Invalid AppSumo tier: ${appsumoTier}`)
      planTier = plan.tier
      // AppSumo is always lifetime
      duration = PlanDuration.LIFETIME
    } else if (vendor === PlanVendor.LEMON) {
      if (!productId) throw new Error('Product ID is required for LemonSqueezy')
      planTier = getTierFromProductId(productId)
      if (!planTier) throw new Error(`Invalid product ID: ${productId}`)
      // If endDate is provided, it's a monthly plan
      duration = endDate ? PlanDuration.MONTHLY : PlanDuration.LIFETIME
    }

    if (!planTier) throw new Error('Could not determine plan tier')

    const planName = `${planTier.toString()} ${duration === PlanDuration.MONTHLY ? 'Monthly' : 'Lifetime'}`

    // Get or create the Plan record
    const plan = await prismadb.plan.upsert({
      where: {
        vendor_productId: {
          vendor,
          productId: productId || `tier${appsumoTier}`
        }
      },
      create: {
        tier: planTier,
        duration,
        vendor,
        productId: productId || `tier${appsumoTier}`,
        name: planName,
        maxUsers: getMaxUsersByTier(planTier),
        isActive: true
      },
      update: {} // No updates needed if it exists
    })

    // Deactivate any existing subscriptions for this user
    // await prismadb.userSubscription.updateMany({
    //   where: {
    //     userId,
    //     status: 'ACTIVE'
    //   },
    //   data: {
    //     status: 'CANCELLED',
    //     endDate: new Date()
    //   }
    // })

    // Create new subscription
    const subscription = await prismadb.userSubscription.create({
      data: {
        userId,
        planId: plan.id,
        endDate,
        status: 'ACTIVE'
      }
    })

    return subscription

  } catch (error) {
    console.error('Error in handlePlanUpdate:', error)
    throw error
  }
}

export async function deactivateUserSubscription(userId: string) {
  try {
    await prismadb.userSubscription.updateMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      data: {
        status: 'CANCELLED',
        endDate: new Date()
      }
    })
  } catch (error) {
    console.error('Error in deactivateUserSubscription:', error)
    throw error
  }
}

export function getLemonPlanDetails(productId: number) {
    if (ENTERPRISE_PRODUCT_IDS.includes(productId)) {
      return { tier: PlanTier.T4, maxUsers: 20 };
    } else if (AGENCY_PRODUCT_IDS.includes(productId)) {
      return { tier: PlanTier.T3, maxUsers: 10 };
    } else if (TEAM_PRODUCT_IDS.includes(productId)) {
      return { tier: PlanTier.T2, maxUsers: 5 };
    } else if (INDIVIDUAL_PRODUCT_IDS.includes(productId)) {
      return { tier: PlanTier.T1, maxUsers: 1 };
    }
    return null;
  }

export function getRedemptionPlanDetails(licenseKey: string) {
    // Assuming license keys follow a pattern or are stored with tier information
    if (licenseKey.includes('enterprise')) {
      return { tier: PlanTier.T4, maxUsers: 20 };
    } else if (licenseKey.includes('agency')) {
      return { tier: PlanTier.T3, maxUsers: 10 };
    } else if (licenseKey.includes('team')) {
      return { tier: PlanTier.T2, maxUsers: 5 };
    } else {
      // Default to individual tier
      return { tier: PlanTier.T1, maxUsers: 1 };
    }
  }
  
  export async function checkAndUpdateExpiredSubscriptions() {
    try {
      const now = new Date()
      
      // Find and update expired monthly subscriptions
      await prismadb.userSubscription.updateMany({
        where: {
          status: 'ACTIVE',
          endDate: {
            not: null,
            lt: now
          }
        },
        data: {
          status: 'CANCELLED'
        }
      })
    } catch (error) {
      console.error('Error checking expired subscriptions:', error)
      throw error
    }
  }