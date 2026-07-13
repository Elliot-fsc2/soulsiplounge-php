<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'invoice_number',
        'order_id',
        'user_id',
        'staff_name',
        'room_name',
        'guest_count',
        'subtotal',
        'total',
        'payment_method',
        'payment_status',
        'notes',
        'printed_at',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'subtotal' => 'integer',
            'total' => 'integer',
            'guest_count' => 'integer',
            'printed_at' => 'datetime',
        ];
    }
}
