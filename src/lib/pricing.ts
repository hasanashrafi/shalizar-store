import { PriceTier } from "@/types";

/**
 * Pure function to calculate price per kg based on total weight and price tiers.
 * Tiers are sorted by minKg ascending.
 * If totalKg is less than the minimum tier, the first tier's price is returned.
 * If maxKg is null, it acts as infinity (upper bound).
 */
export function calculateTierPrice(
  totalKg: number,
  tiers: PriceTier[],
): number {
  if (!tiers || tiers.length === 0) {
    throw new Error("Price tiers cannot be empty");
  }

  // Sort tiers by minKg ascending to ensure correct matching order
  const sortedTiers = [...tiers].sort((a, b) => a.minKg - b.minKg);

  // If weight is less than the lowest tier minKg, return the lowest tier price
  if (totalKg < sortedTiers[0].minKg) {
    return sortedTiers[0].pricePerKg;
  }

  // Find the matching tier
  const matchedTier = sortedTiers.find((tier) => {
    const minMatch = totalKg >= tier.minKg;
    const maxMatch = tier.maxKg === null || totalKg <= tier.maxKg;
    return minMatch && maxMatch;
  });

  if (matchedTier) {
    return matchedTier.pricePerKg;
  }

  // Fallback to the highest tier if totalKg exceeds all maxKg bounds
  return sortedTiers[sortedTiers.length - 1].pricePerKg;
}
