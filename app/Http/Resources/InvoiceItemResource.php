<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_name' => $this->product_name,
            'product_price' => $this->product_price,
            'product_price_display' => $this->product_price / 100,
            'quantity' => $this->quantity,
            'subtotal' => $this->subtotal,
            'subtotal_display' => $this->subtotal / 100,
        ];
    }
}
