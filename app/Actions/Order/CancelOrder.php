<?php

namespace App\Actions\Order;

use App\Actions\Inventory\DeductStock;
use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class CancelOrder
{
    public function __construct(
        private DeductStock $deductStock,
    ) {}

    public function execute(string $orderId): Order
    {
        return DB::transaction(function () use ($orderId) {
            $order = Order::with('items')->findOrFail($orderId);

            if ($order->status === OrderStatus::Cancelled) {
                throw new \RuntimeException('Order is already cancelled.');
            }

            $order->update(['status' => OrderStatus::Cancelled]);

            return $order->load('items');
        });
    }
}
