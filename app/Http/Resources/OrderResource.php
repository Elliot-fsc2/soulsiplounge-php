<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'user_id' => $this->user_id,
            'staff_name' => $this->whenLoaded('user', fn () => $this->user->name),
            'booking_id' => $this->booking_id,
            'room_id' => $this->room_id,
            'room_name' => $this->whenLoaded('room', fn () => $this->room->name),
            'guest_count' => $this->guest_count,
            'subtotal' => $this->subtotal,
            'subtotal_display' => $this->subtotal / 100,
            'total' => $this->total,
            'total_display' => $this->total / 100,
            'amount_tendered' => $this->amount_tendered,
            'amount_tendered_display' => $this->amount_tendered !== null ? $this->amount_tendered / 100 : null,
            'change' => $this->change,
            'change_display' => $this->change !== null ? $this->change / 100 : null,
            'status' => $this->status->value,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'notes' => $this->notes,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
