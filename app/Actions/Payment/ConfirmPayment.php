<?php

namespace App\Actions\Payment;

use App\Models\Payment;

class ConfirmPayment
{
    public function execute(Payment $payment): void
    {
        $payment->update([
            'status' => 'Confirmed',
            'confirmed_at' => now(),
        ]);

        $payment->booking->update([
            'status' => 'Confirmed',
        ]);
    }
}
