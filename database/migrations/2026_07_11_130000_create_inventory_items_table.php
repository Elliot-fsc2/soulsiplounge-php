<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('unit');
            $table->decimal('current_stock', 10, 2)->default(0);
            $table->decimal('min_stock', 10, 2)->default(0);
            $table->string('weekly_delivery_day')->nullable();
            $table->decimal('weekly_delivery_qty', 10, 2)->nullable();
            $table->integer('shelf_life_days')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
