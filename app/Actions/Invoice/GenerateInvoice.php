<?php

namespace App\Actions\Invoice;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Order;

class GenerateInvoice
{
    public function execute(Order $order): Invoice
    {
        $order->loadMissing('items', 'user', 'room');

        $invoice = Invoice::create([
            'invoice_number' => $order->order_number,
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'staff_name' => $order->user?->name,
            'room_name' => $order->room?->name,
            'guest_count' => $order->guest_count,
            'subtotal' => $order->subtotal,
            'total' => $order->total,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'notes' => $order->notes,
        ]);

        foreach ($order->items as $item) {
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'product_name' => $item->product_name,
                'product_price' => $item->product_price,
                'quantity' => $item->quantity,
                'subtotal' => $item->subtotal,
            ]);
        }

        return $invoice->load('items');
    }
}
