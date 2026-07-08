import type { Room } from '@/types/domain';

export function computePerPersonRate(
  room: Room,
  duration: string,
  withCake: boolean,
  guestCount: number,
): number {
  const tier = room.pricing.find(
    (p) => p.duration === duration && p.with_cake === withCake,
  );

  if (!tier) return 0;

  return tier.per_person_rates[guestCount] ?? 0;
}
