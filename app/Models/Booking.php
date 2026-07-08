<?php

namespace App\Models;

use App\Enums\BookingStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'room_name',
        'guest_count',
        'duration',
        'with_cake',
        'date',
        'time',
        'per_person_price',
        'total_price',
        'voucher_code',
        'discount_amount',
        'final_price',
        'status',
        'notes',
    ];

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    protected function casts(): array
    {
        return [
            'with_cake' => 'boolean',
            'date' => 'date:Y-m-d',
            'guest_count' => 'integer',
            'per_person_price' => 'integer',
            'total_price' => 'integer',
            'discount_amount' => 'integer',
            'final_price' => 'integer',
            'status' => BookingStatus::class,
        ];
    }
}
