<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Payment\CancelPayment;
use App\Actions\Payment\ConfirmPayment;
use App\Actions\Payment\RefundPayment;
use App\Models\Payment;

class PaymentController
{
    public function __construct(
        private ConfirmPayment $confirmPayment,
        private CancelPayment $cancelPayment,
        private RefundPayment $refundPayment,
    ) {}

    public function confirm(Payment $payment)
    {
        $this->confirmPayment->execute($payment);

        return redirect()->back()->with('success', 'Payment confirmed successfully!');
    }

    public function cancel(Payment $payment)
    {
        $this->cancelPayment->execute($payment);

        return redirect()->back()->with('success', 'Payment cancelled successfully!');
    }

    public function refund(Payment $payment)
    {
        $this->refundPayment->execute($payment);

        return redirect()->back()->with('success', 'Payment refunded successfully!');
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();

        return redirect()->back()->with('success', 'Payment deleted successfully!');
    }
}
