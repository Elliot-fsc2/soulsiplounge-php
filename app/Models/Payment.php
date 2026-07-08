<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Payment extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'booking_id',
        'amount',
        'receipt_url',
        'status',
        'notes',
        'paid_at',
        'confirmed_at',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'status' => PaymentStatus::class,
            'paid_at' => 'datetime',
            'confirmed_at' => 'datetime',
        ];
    }

    protected function receiptUrl(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value ? Storage::url($value) : null,
        );
    }
}
