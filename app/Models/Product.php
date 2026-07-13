<?php

namespace App\Models;

use App\Enums\ProductCategory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'category',
        'price',
        'active',
        'sort_order',
    ];

    public function recipes()
    {
        return $this->hasMany(InventoryRecipe::class);
    }

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'active' => 'boolean',
            'sort_order' => 'integer',
            'category' => ProductCategory::class,
        ];
    }
}
