<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->integer('amount_tendered')->nullable()->after('total');
            $table->integer('change')->nullable()->after('amount_tendered');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->integer('amount_tendered')->nullable()->after('total');
            $table->integer('change')->nullable()->after('amount_tendered');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['amount_tendered', 'change']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['amount_tendered', 'change']);
        });
    }
};
