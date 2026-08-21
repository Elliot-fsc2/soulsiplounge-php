<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'order_id' => $this->order_id,
            'staff_name' => $this->staff_name,
            'room_name' => $this->room_name,
            'guest_count' => $this->guest_count,
            'subtotal' => $this->subtotal,
            'subtotal_display' => $this->subtotal / 100,
            'total' => $this->total,
            'total_display' => $this->total / 100,
            'amount_tendered' => $this->amount_tendered,
            'amount_tendered_display' => $this->amount_tendered !== null ? $this->amount_tendered / 100 : null,
            'change' => $this->change,
            'change_display' => $this->change !== null ? $this->change / 100 : null,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'notes' => $this->notes,
            'items' => InvoiceItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
