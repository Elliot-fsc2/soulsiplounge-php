<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'unit',
        'current_stock',
        'min_stock',
        'weekly_delivery_day',
        'weekly_delivery_qty',
        'shelf_life_days',
    ];

    public function recipes()
    {
        return $this->hasMany(InventoryRecipe::class);
    }

    public function transactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    protected function casts(): array
    {
        return [
            'current_stock' => 'decimal:2',
            'min_stock' => 'decimal:2',
            'weekly_delivery_qty' => 'decimal:2',
            'shelf_life_days' => 'integer',
        ];
    }
}
