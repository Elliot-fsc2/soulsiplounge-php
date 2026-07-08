<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Room extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'image',
        'description',
        'min_group',
        'max_group',
        'pricing',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'pricing' => 'array',
            'min_group' => 'integer',
            'max_group' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function getImageAttribute(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        return str_starts_with($value, 'http') ? $value : Storage::url($value);
    }
}
