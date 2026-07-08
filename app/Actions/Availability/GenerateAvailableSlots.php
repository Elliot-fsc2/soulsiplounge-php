<?php

namespace App\Actions\Availability;

use Carbon\Carbon;

class GenerateAvailableSlots
{
    public function __construct(
        private CheckSlotAvailability $checkSlotAvailability,
    ) {}

    public function execute(string $date, string $roomName, string $duration, ?string $excludeBookingId = null): array
    {
        $dateCarbon = Carbon::parse($date);

        if ($dateCarbon->isPast()) {
            return [];
        }

        $openMinutes = 10 * 60;
        $closeMinutes = 22 * 60;
        $durationMinutes = (int) (((float) $duration) * 60);
        $buffer = 5;
        $lastStart = $closeMinutes - $durationMinutes - $buffer;
        $available = [];

        for ($minutes = $openMinutes; $minutes <= $lastStart; $minutes += 5) {
            if ($dateCarbon->isToday()) {
                $nowMinutes = Carbon::now()->hour * 60 + Carbon::now()->minute;
                if ($minutes <= $nowMinutes) {
                    continue;
                }
            }

            $time = sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);

            $result = $this->checkSlotAvailability->execute($date, $roomName, $time, $duration, $excludeBookingId);

            if ($result['available']) {
                $available[] = $time;
            }
        }

        return $available;
    }
}
