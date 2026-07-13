<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('order_id');
            $table->ulid('product_id')->nullable();
            $table->string('product_name');
            $table->integer('product_price');
            $table->integer('quantity');
            $table->integer('subtotal');
            $table->string('item_type')->default('product');
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
            $table->index('item_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
