<?php

namespace App\Actions\Pricing;

use App\Models\Room;

class ComputePerPersonRate
{
    public function execute(Room $room, string $duration, int $guestCount): int
    {
        $tiers = $room->pricing;

        foreach ($tiers as $tier) {
            if ($tier['duration'] === $duration) {
                $rates = $tier['per_person_rates'];

                return (int) ($rates[(string) $guestCount] ?? 0);
            }
        }

        return 0;
    }
}
