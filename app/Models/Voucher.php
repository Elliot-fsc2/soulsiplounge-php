<?php

namespace App\Models;

use App\Enums\VoucherType;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_purchase',
        'max_uses',
        'used_count',
        'expires_at',
        'active',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'type' => VoucherType::class,
            'active' => 'boolean',
            'expires_at' => 'date',
            'value' => 'integer',
            'min_purchase' => 'integer',
            'max_uses' => 'integer',
            'used_count' => 'integer',
        ];
    }
}
