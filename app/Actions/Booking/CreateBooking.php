<?php

namespace App\Actions\Booking;

use App\Actions\Availability\CheckSlotAvailability;
use App\Actions\Pricing\ComputePerPersonRate;
use App\Actions\Voucher\ApplyVoucher;
use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Room;
use App\Models\Voucher;

class CreateBooking
{
    public function __construct(
        private ComputePerPersonRate $computePerPersonRate,
        private ApplyVoucher $applyVoucher,
        private CheckSlotAvailability $checkSlotAvailability,
    ) {}

    public function execute(array $data, ?string $editingId = null): Booking
    {
        $room = Room::findOrFail($data['room_id']);

        $perPersonPrice = $this->computePerPersonRate->execute(
            $room,
            $data['duration'],
            $data['with_cake'] ?? false,
            $data['guest_count'],
        );

        $totalPrice = $perPersonPrice * $data['guest_count'];
        $discountAmount = 0;
        $finalPrice = $totalPrice;
        $voucherCode = null;

        if (! empty($data['voucher_code'])) {
            $voucher = Voucher::where('code', strtoupper($data['voucher_code']))->first();

            if ($voucher) {
                $result = $this->applyVoucher->execute($data['voucher_code'], $voucher, $totalPrice);

                if ($result['valid']) {
                    $discountAmount = $result['discount'];
                    $finalPrice = $result['finalPrice'];
                    $voucherCode = $voucher->code;
                    $voucher->increment('used_count');
                }
            }
        }

        $slotCheck = $this->checkSlotAvailability->execute(
            $data['date'],
            $room->name,
            $data['time'],
            $data['duration'],
            $editingId,
        );

        if (! $slotCheck['available']) {
            throw new \RuntimeException('The selected time slot is no longer available.');
        }

        $bookingData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'room_name' => $room->name,
            'guest_count' => $data['guest_count'],
            'duration' => $data['duration'],
            'with_cake' => $data['with_cake'] ?? false,
            'date' => $data['date'],
            'time' => $data['time'],
            'per_person_price' => $perPersonPrice,
            'total_price' => $totalPrice,
            'voucher_code' => $voucherCode,
            'discount_amount' => $discountAmount,
            'final_price' => $finalPrice,
            'status' => BookingStatus::Pending,
            'notes' => $data['notes'] ?? null,
        ];

        if ($editingId) {
            $booking = Booking::findOrFail($editingId);
            $booking->update($bookingData);

            return $booking->fresh();
        }

        return Booking::create($bookingData);
    }
}
