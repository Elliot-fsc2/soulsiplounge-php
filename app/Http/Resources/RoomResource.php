<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'image' => $this->image,
            'description' => $this->description,
            'min_group' => $this->min_group,
            'max_group' => $this->max_group,
            'pricing' => $this->pricing,
            'sort_order' => $this->sort_order,
        ];
    }
}
