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

    public function execute(User $user, array $items, ?string $bookingId = null, ?string $roomId = null, ?int $guestCount = null, ?string $roomDuration = null, ?string $notes = null, array $rooms = []): Order
    {
        return DB::transaction(function () use ($user, $items, $bookingId, $roomId, $guestCount, $roomDuration, $notes, $rooms) {
            $orderNumber = $this->generateOrderNumber();
            $subtotal = 0;
            $orderItems = [];

            if ($roomId && $guestCount && $roomDuration) {
                $rooms[] = [
                    'room_id' => $roomId,
                    'guest_count' => $guestCount,
                    'room_duration' => $roomDuration,
                ];
            }

            foreach ($rooms as $roomData) {
                $rId = $roomData['room_id'] ?? null;
                $gCount = $roomData['guest_count'] ?? null;
                $rDur = $roomData['room_duration'] ?? null;

                if ($rId && $gCount && $rDur) {
                    $room = \App\Models\Room::find($rId);
                    if ($room) {
                        $pricing = is_array($room->pricing) ? $room->pricing : json_decode($room->pricing, true);
                        $tier = collect($pricing)->firstWhere('duration', $rDur);
                        
                        $pricePerPerson = 0;
                        if ($tier) {
                            if (isset($tier['per_person_rates'])) {
                                if (isset($tier['per_person_rates'][$gCount])) {
                                    $pricePerPerson = (int) $tier['per_person_rates'][$gCount];
                                } else {
                                    $sizes = array_map('intval', array_keys($tier['per_person_rates']));
                                    rsort($sizes);
                                    $pricePerPerson = (int) ($tier['per_person_rates'][$sizes[0]] ?? 0);
                                }
                            } else if (isset($tier['price_per_person'])) {
                                $pricePerPerson = (int) $tier['price_per_person'];
                            }
                        }
                        if ($pricePerPerson > 0) {
                            $itemSubtotal = $pricePerPerson * $gCount;
                            $subtotal += $itemSubtotal;
                            
                            $orderItems[] = [
                                'product_id' => null,
                                'product_name' => $room->name . ' (' . $rDur . ' hrs, ' . $gCount . ' pax)',
                                'product_price' => $itemSubtotal,
                                'quantity' => 1,
                                'subtotal' => $itemSubtotal,
                                'item_type' => OrderItemType::RoomCharge->value,
                            ];
                        }
                    }
                }
            }

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

            $primaryRoomId = !empty($rooms) ? $rooms[0]['room_id'] : null;
            $primaryGuestCount = !empty($rooms) ? $rooms[0]['guest_count'] : null;

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
                'booking_id' => $bookingId,
                'room_id' => $primaryRoomId,
                'guest_count' => $primaryGuestCount,
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'payment_status' => 'pending',
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
