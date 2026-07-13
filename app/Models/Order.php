<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'order_number',
        'user_id',
        'booking_id',
        'room_id',
        'guest_count',
        'subtotal',
        'total',
        'status',
        'payment_method',
        'payment_status',
        'notes',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    protected function casts(): array
    {
        return [
            'subtotal' => 'integer',
            'total' => 'integer',
            'guest_count' => 'integer',
            'status' => OrderStatus::class,
        ];
    }
}
