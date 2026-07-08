<?php

namespace App\Actions\Availability;

use App\Models\Booking;

class CheckSlotAvailability
{
    public function execute(string $date, string $roomName, string $startTime, string $duration, ?string $excludeBookingId = null): array
    {
        $startMinutes = $this->timeToMinutes($startTime);
        $endMinutes = $startMinutes + (int) (((float) $duration) * 60) + 5;

        $query = Booking::where('date', $date)
            ->where('room_name', $roomName)
            ->where('status', '!=', 'Cancelled');

        if ($excludeBookingId) {
            $query->where('id', '!=', $excludeBookingId);
        }

        $bookings = $query->get();

        foreach ($bookings as $booking) {
            $bookingStart = $this->timeToMinutes($booking->time);
            $bookingEnd = $bookingStart + (int) (((float) $booking->duration) * 60) + 5;

            if ($startMinutes < $bookingEnd && $endMinutes > $bookingStart) {
                return ['available' => false, 'conflicting' => $booking];
            }
        }

        return ['available' => true, 'conflicting' => null];
    }

    private function timeToMinutes(string $time): int
    {
        [$hours, $minutes] = explode(':', $time);

        return ((int) $hours * 60) + (int) $minutes;
    }
}
