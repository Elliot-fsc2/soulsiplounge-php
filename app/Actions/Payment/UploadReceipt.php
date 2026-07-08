<?php

namespace App\Actions\Payment;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\UploadedFile;

class UploadReceipt
{
    public function execute(Booking $booking, UploadedFile $file): Payment
    {
        $path = $file->store('receipts', 'public');

        return Payment::create([
            'booking_id' => $booking->id,
            'amount' => $booking->final_price,
            'receipt_url' => $path,
            'status' => 'Pending',
            'paid_at' => now(),
        ]);
    }
}
