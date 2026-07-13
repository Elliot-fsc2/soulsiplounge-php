<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_recipes', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('product_id');
            $table->ulid('inventory_item_id');
            $table->decimal('quantity_per_unit', 10, 4);
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('inventory_item_id')->references('id')->on('inventory_items')->cascadeOnDelete();
            $table->unique(['product_id', 'inventory_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_recipes');
    }
};
