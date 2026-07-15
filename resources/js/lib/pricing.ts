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

  return tier.per_person_rates[guestCount] ?? 0;
}
