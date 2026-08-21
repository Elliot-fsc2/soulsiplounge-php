import type { Room } from '@/types/domain';

export function computePerPersonRate(
  room: Room,
  duration: string,
  guestCount: number,
): number {
  const tier = room.pricing.find(
    (p) => p.duration === duration,
  );

  if (!tier) return 0;

  if (tier.per_person_rates) {
    // Use the exact guest count if available, otherwise find the closest available (or max)
    if (tier.per_person_rates[guestCount] !== undefined) {
      return tier.per_person_rates[guestCount];
    }

    // Fallback to highest available if exact not found
    const sizes = Object.keys(tier.per_person_rates).map(Number).sort((a, b) => b - a);
    return tier.per_person_rates[sizes[0]] ?? 0;
  }
  
  // Legacy fallback
  return (tier as any).price_per_person ?? 0;
}
