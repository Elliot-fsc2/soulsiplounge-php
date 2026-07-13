<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'invoice_id',
        'product_name',
        'product_price',
        'quantity',
        'subtotal',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    protected function casts(): array
    {
        return [
            'product_price' => 'integer',
            'quantity' => 'integer',
            'subtotal' => 'integer',
        ];
    }
}
