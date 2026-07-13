<?php

namespace App\Models;

use App\Enums\OrderItemType;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_price',
        'quantity',
        'subtotal',
        'item_type',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    protected function casts(): array
    {
        return [
            'product_price' => 'integer',
            'quantity' => 'integer',
            'subtotal' => 'integer',
            'item_type' => OrderItemType::class,
        ];
    }
}
