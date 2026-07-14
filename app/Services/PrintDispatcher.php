<?php

namespace App\Services;

use App\Models\Invoice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PrintDispatcher
{
    public function __construct(
        private PrinterService $printer,
    ) {}

    public function send(Invoice $invoice): bool
    {
        $url = config('printer.print_server_url');

        if ($url) {
            return $this->sendToServer($invoice);
        }

        return $this->printer->printReceipt(
            $invoice->order->loadMissing('items', 'user', 'room')
        );
    }

    private function sendToServer(Invoice $invoice): bool
    {
        $invoice->loadMissing('items');

        try {
            $response = Http::timeout(5)->withHeaders(
                array_filter(['X-Print-Secret' => config('printer.print_server_secret')])
            )->post(config('printer.print_server_url').'/print', [
                'invoice_number' => $invoice->invoice_number,
                'staff_name' => $invoice->staff_name,
                'room_name' => $invoice->room_name,
                'guest_count' => $invoice->guest_count,
                'subtotal' => $invoice->subtotal,
                'total' => $invoice->total,
                'amount_tendered' => $invoice->amount_tendered,
                'change' => $invoice->change,
                'payment_method' => $invoice->payment_method,
                'items' => $invoice->items->toArray(),
            ]);

            if ($response->successful()) {
                $invoice->update(['printed_at' => now()]);

                return true;
            }

            Log::warning('Print server error, falling back to local: '.$response->body());
        } catch (\Throwable $e) {
            Log::warning('Print server unreachable, falling back to local: '.$e->getMessage());
        }

        return $this->printer->printReceipt(
            $invoice->order->loadMissing('items', 'user', 'room')
        );
    }
}
