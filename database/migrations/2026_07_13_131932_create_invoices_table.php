<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('invoice_number')->unique();
            $table->foreignUlid('order_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('staff_name')->nullable();
            $table->string('room_name')->nullable();
            $table->integer('guest_count')->nullable();
            $table->integer('subtotal');
            $table->integer('total');
            $table->string('payment_method')->nullable();
            $table->string('payment_status')->default('unpaid');
            $table->text('notes')->nullable();
            $table->timestamp('printed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('invoice_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('invoice_id')->constrained()->cascadeOnDelete();
            $table->string('product_name');
            $table->integer('product_price');
            $table->integer('quantity');
            $table->integer('subtotal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
    }
};
