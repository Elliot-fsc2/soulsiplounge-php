<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_number' => 'ORD-'.fake()->unique()->randomNumber(6),
            'user_id' => User::factory(),
            'booking_id' => Booking::factory(),
            'guest_count' => fake()->numberBetween(1, 10),
            'subtotal' => fake()->numberBetween(500, 5000),
            'total' => fn (array $attrs) => $attrs['subtotal'],
            'amount_tendered' => null,
            'change' => null,
            'status' => 'completed',
            'payment_method' => fake()->randomElement(['cash', 'card', 'gcash']),
            'payment_status' => 'paid',
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
