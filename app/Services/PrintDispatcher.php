<?php

namespace App\Services;

use App\Models\Invoice;

class PrintDispatcher
{
    public function __construct(
        private PrinterService $printer,
    ) {}

    public function send(Invoice $invoice): bool
    {
        return $this->printer->printReceipt(
            $invoice->order->loadMissing('items', 'user', 'room')
        );
    }
}