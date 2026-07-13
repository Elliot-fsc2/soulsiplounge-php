<?php

namespace App\Models;

use App\Enums\InventoryTransactionType;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'inventory_item_id',
        'type',
        'quantity',
        'reference_type',
        'reference_id',
        'notes',
    ];

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'type' => InventoryTransactionType::class,
        ];
    }
}
