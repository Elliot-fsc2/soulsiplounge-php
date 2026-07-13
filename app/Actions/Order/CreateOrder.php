<?php

namespace App\Actions\Order;

use App\Actions\Inventory\DeductStock;
use App\Enums\OrderItemType;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateOrder
{
    public function __construct(
        private DeductStock $deductStock,
    ) {}

    public function execute(User $user, array $items, ?string $bookingId = null, ?string $roomId = null, ?int $guestCount = null, ?string $notes = null): Order
    {
        return DB::transaction(function () use ($user, $items, $bookingId, $roomId, $guestCount, $notes) {
            $orderNumber = $this->generateOrderNumber();
            $subtotal = 0;
            $orderItems = [];

            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = $item['quantity'];
                $itemSubtotal = $product->price * $quantity;
                $subtotal += $itemSubtotal;

                $itemType = $product->category->value === 'room'
                    ? OrderItemType::RoomCharge
                    : OrderItemType::Product;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_price' => $product->price,
                    'quantity' => $quantity,
                    'subtotal' => $itemSubtotal,
                    'item_type' => $itemType->value,
                ];

                if ($itemType === OrderItemType::Product) {
                    $this->deductStock->execute($product, $quantity, $orderNumber);
                }
            }

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
                'booking_id' => $bookingId,
                'room_id' => $roomId,
                'guest_count' => $guestCount,
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'status' => OrderStatus::Active,
                'notes' => $notes,
            ]);

            foreach ($orderItems as $orderItem) {
                $orderItem['order_id'] = $order->id;
                OrderItem::create($orderItem);
            }

            return $order->load('items');
        });
    }

    private function generateOrderNumber(): string
    {
        $prefix = 'POS-'.now()->format('Ymd').'-';
        $lastOrder = Order::where('order_number', 'like', $prefix.'%')
            ->orderBy('order_number', 'desc')
            ->first();

        if ($lastOrder) {
            $lastNumber = (int) substr($lastOrder->order_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix.str_pad((string) $newNumber, 4, '0', STR_PAD_LEFT);
    }
}
