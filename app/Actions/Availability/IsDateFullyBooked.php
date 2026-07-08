<?php

namespace App\Actions\Availability;

class IsDateFullyBooked
{
    public function __construct(
        private GenerateAvailableSlots $generateAvailableSlots,
    ) {}

    public function execute(string $date, string $roomName): bool
    {
        $durations = ['1.5', '2', '3'];

        foreach ($durations as $duration) {
            $slots = $this->generateAvailableSlots->execute($date, $roomName, $duration);

            if (count($slots) > 0) {
                return false;
            }
        }

        return true;
    }
}
