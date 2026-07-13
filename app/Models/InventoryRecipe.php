<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryRecipe extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'product_id',
        'inventory_item_id',
        'quantity_per_unit',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    protected function casts(): array
    {
        return [
            'quantity_per_unit' => 'decimal:4',
        ];
    }
}
