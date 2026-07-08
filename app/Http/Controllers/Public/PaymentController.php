<?php

namespace App\Http\Controllers\Public;

use App\Actions\Payment\UploadReceipt;
use App\Http\Requests\UploadReceiptRequest;
use App\Models\BankAccount;
use App\Models\Booking;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController
{
    public function __construct(
        private UploadReceipt $uploadReceipt,
    ) {}

    public function show(Booking $booking): Response
    {
        $bankAccounts = BankAccount::where('is_active', true)->get();

        return Inertia::render('payment/show', [
            'booking' => $booking,
            'bankAccounts' => $bankAccounts,
        ]);
    }

    public function uploadReceipt(Booking $booking, UploadReceiptRequest $request)
    {
        $payment = $this->uploadReceipt->execute($booking, $request->file('receipt'));

        return redirect()->back()->with('success', 'Receipt uploaded successfully!');
    }
}
