<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\PrinterService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class PrintReceipt implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Order $order,
    ) {}

    public function handle(PrinterService $printer): void
    {
        $printer->printReceipt($this->order);
    }
}
