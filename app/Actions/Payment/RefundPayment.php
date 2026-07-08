<?php

namespace App\Actions\Payment;

use App\Models\Payment;

class RefundPayment
{
    public function execute(Payment $payment): void
    {
        $payment->update([
            'status' => 'Refunded',
        ]);
    }
}
