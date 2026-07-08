<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('room_name');
            $table->integer('guest_count');
            $table->string('duration');
            $table->boolean('with_cake');
            $table->date('date');
            $table->string('time');
            $table->integer('per_person_price');
            $table->integer('total_price');
            $table->string('voucher_code')->nullable();
            $table->integer('discount_amount');
            $table->integer('final_price');
            $table->string('status')->default('Pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['date', 'room_name']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
