<?php

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => UserRole::Admin]);
});

test('guests are redirected to login', function () {
    $response = $this->get(route('admin.sales-report'));
    $response->assertRedirect(route('login'));
});

test('admin can view the sales report page', function () {
    $this->actingAs($this->admin);

    $response = $this->get(route('admin.sales-report'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/sales-report/index')
        ->has('stats')
        ->has('revenueByPeriod')
        ->has('topProducts')
        ->has('recentTransactions')
    );
});

test('sales report returns correct revenue totals', function () {
    Payment::factory()->count(3)->create([
        'amount' => 1000,
        'status' => 'Confirmed',
        'confirmed_at' => now(),
    ]);

    $order = Order::factory()->create([
        'total' => 2500,
        'payment_status' => 'paid',
        'updated_at' => now(),
    ]);

    OrderItem::factory()->count(2)->create([
        'order_id' => $order->id,
        'subtotal' => 1250,
    ]);

    $this->actingAs($this->admin);

    $response = $this->get(route('admin.sales-report', ['period' => 'monthly']));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('stats.totalRevenue', 5500)
        ->where('stats.totalOrders', 1)
        ->where('stats.confirmedBookings', 3)
    );
});

test('sales report respects date filters', function () {
    Payment::factory()->create([
        'amount' => 500,
        'status' => 'Confirmed',
        'confirmed_at' => Carbon::parse('2024-01-15'),
    ]);

    Payment::factory()->create([
        'amount' => 2000,
        'status' => 'Confirmed',
        'confirmed_at' => now(),
    ]);

    $this->actingAs($this->admin);

    $response = $this->get(route('admin.sales-report', [
        'period' => 'custom',
        'from' => '2024-01-01',
        'to' => '2024-01-31',
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('stats.totalRevenue', 500)
        ->where('stats.confirmedBookings', 1)
    );
});

test('period filter buttons are reflected in the page', function () {
    $this->actingAs($this->admin);

    $response = $this->get(route('admin.sales-report', ['period' => 'daily']));
    $response->assertOk();

    $response = $this->get(route('admin.sales-report', ['period' => 'weekly']));
    $response->assertOk();

    $response = $this->get(route('admin.sales-report', ['period' => 'yearly']));
    $response->assertOk();
});
