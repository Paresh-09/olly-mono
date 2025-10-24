import { PlanTier, PlanDuration, PlanVendor } from '@prisma/client'

export interface PlanConfig {
  tier: PlanTier
  duration: PlanDuration
  vendor: PlanVendor
  productId: string
  name: string
  maxUsers: number
}

interface LifetimePlanMapping {
  tier: PlanTier
  appsumoTier: number
  lemonId: string
  maxUsers: number
  name: string
}

interface MonthlyPlanMapping {
  tier: PlanTier
  lemonId: string
  maxUsers: number
  name: string
}

const LIFETIME_PLANS: LifetimePlanMapping[] = [
  {
    tier: PlanTier.T1,
    appsumoTier: 1,
    lemonId: "328561",
    maxUsers: 1,
    name: "Individual"
  },
  {
    tier: PlanTier.T2,
    appsumoTier: 2,
    lemonId: "363040",
    maxUsers: 5,
    name: "Team"
  },
  {
    tier: PlanTier.T3,
    appsumoTier: 3,
    lemonId: "321751",
    maxUsers: 10,
    name: "Agency"
  },
  {
    tier: PlanTier.T4,
    appsumoTier: 0,
    lemonId: "363041",
    maxUsers: 20,
    name: "Enterprise"
  }
]

const MONTHLY_PLANS: MonthlyPlanMapping[] = [
  {
    tier: PlanTier.T1,
    lemonId: "285937",
    maxUsers: 1,
    name: "Individual"
  },
  {
    tier: PlanTier.T2,
    lemonId: "363062",
    maxUsers: 5,
    name: "Team"
  },
  {
    tier: PlanTier.T3,
    lemonId: "363063",
    maxUsers: 10,
    name: "Agency"
  },
  {
    tier: PlanTier.T4,
    lemonId: "363064",
    maxUsers: 20,
    name: "Enterprise"
  }
]

export const PLANS: PlanConfig[] = [
  ...LIFETIME_PLANS.map(plan => ({
    tier: plan.tier,
    duration: PlanDuration.LIFETIME,
    vendor: PlanVendor.LEMON,
    productId: plan.lemonId,
    name: `${plan.name} Lifetime`,
    maxUsers: plan.maxUsers,
  })),
  ...MONTHLY_PLANS.map(plan => ({
    tier: plan.tier,
    duration: PlanDuration.MONTHLY,
    vendor: PlanVendor.LEMON,
    productId: plan.lemonId,
    name: `${plan.name} Monthly`,
    maxUsers: plan.maxUsers,
  })),
  ...LIFETIME_PLANS
    .filter(plan => plan.appsumoTier > 0) // Filter out enterprise tier (tier 0)
    .map(plan => ({
      tier: plan.tier,
      duration: PlanDuration.LIFETIME,
      vendor: PlanVendor.APPSUMO,
      productId: `tier${plan.appsumoTier}`,
      name: `${plan.name} Lifetime`,
      maxUsers: plan.maxUsers,
    }))
]

export const getPlanFromAppSumoTier = (tier: number): PlanConfig | undefined => {
  const plan = LIFETIME_PLANS.find(p => p.appsumoTier === tier)
  if (!plan) return undefined

  return {
    tier: plan.tier,
    duration: PlanDuration.LIFETIME,
    vendor: PlanVendor.APPSUMO,
    productId: `tier${tier}`,
    name: plan.name,
    maxUsers: plan.maxUsers
  }
}

export const getLemonEquivalentLifetimePlan = (appsumoTier: number): string | undefined => {
  return LIFETIME_PLANS.find(p => p.appsumoTier === appsumoTier)?.lemonId
}

export const getMaxUsersByTier = (tier: PlanTier): number => {
  return LIFETIME_PLANS.find(p => p.tier === tier)?.maxUsers ?? 1
}

export const getPlanFromProductId = (productId: string): PlanConfig | undefined => {
  return PLANS.find(p => p.productId === productId)
}

export const isAppSumoProductId = (productId: string): boolean => {
  return productId.startsWith('tier')
}

export const getTierFromProductId = (productId: string): PlanTier | undefined => {
  // First check if it's an AppSumo tier
  if (productId.startsWith('tier')) {
    const tierNumber = parseInt(productId.replace('tier', ''))
    return LIFETIME_PLANS.find(p => p.appsumoTier === tierNumber)?.tier
  }
  // Then check Lemon plans
  return LIFETIME_PLANS.find(p => p.lemonId === productId)?.tier || 
         MONTHLY_PLANS.find(p => p.lemonId === productId)?.tier
}

export const getAppsumoTierFromLemonId = (productId: string): number | undefined => {
  return LIFETIME_PLANS.find(p => p.lemonId === productId)?.appsumoTier
}