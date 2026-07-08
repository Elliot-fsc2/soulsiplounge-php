<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class BankAccount extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'bank_name',
        'account_name',
        'account_number',
        'qr_code_url',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function getQrCodeUrlAttribute(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        return str_starts_with($value, 'http') ? $value : Storage::url($value);
    }
}
