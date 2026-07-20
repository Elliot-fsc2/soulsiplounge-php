<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category->value,
            'price' => $this->price,
            'price_display' => $this->price,
            'active' => $this->active,
            'sort_order' => $this->sort_order,
        ];
    }
}
