<?php

namespace App\Actions\Payment;

use App\Models\Payment;

class CancelPayment
{
    public function execute(Payment $payment): void
    {
        $payment->update([
            'status' => 'Cancelled',
            'confirmed_at' => now(),
        ]);
    }
}
