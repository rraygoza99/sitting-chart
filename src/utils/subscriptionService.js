/**
 * Subscription plan tiers and limits.
 */
export const PLAN_LIMITS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    maxWeddings: 3,
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    maxWeddings: 8,
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    maxWeddings: Infinity,
  },
};

const DEFAULT_PLAN = 'pro'; // Default active plan for users

/**
 * Get current user's subscription plan id.
 * Supports localStorage override 'userSubscriptionPlan' or fallback default.
 * @returns {string}
 */
export function getCurrentPlanId() {
  try {
    return localStorage.getItem('userSubscriptionPlan') || DEFAULT_PLAN;
  } catch (_) {
    return DEFAULT_PLAN;
  }
}

/**
 * Get the plan config for a given or current user.
 * @param {string} [planId]
 * @returns {{ id: string, name: string, maxWeddings: number }}
 */
export function getPlanConfig(planId) {
  const currentId = planId || getCurrentPlanId();
  return PLAN_LIMITS[currentId] || PLAN_LIMITS.pro;
}

/**
 * Check if the user can create another wedding based on their current count and plan limit.
 * @param {number} currentWeddingCount
 * @param {string} [planId]
 * @returns {{ allowed: boolean, limit: number, current: number, planName: string }}
 */
export function canCreateWedding(currentWeddingCount, planId) {
  const plan = getPlanConfig(planId);
  return {
    allowed: currentWeddingCount < plan.maxWeddings,
    limit: plan.maxWeddings,
    current: currentWeddingCount,
    planName: plan.name,
  };
}
