<?php

namespace App\Actions\Booking;

use App\Models\Booking;

class UpdateBooking
{
    public function __construct(
        private CreateBooking $createBooking,
    ) {}

    public function execute(string $id, array $data): Booking
    {
        return $this->createBooking->execute($data, $id);
    }
}
