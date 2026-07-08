<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'amount' => fake()->numberBetween(1000, 20000),
            'receipt_url' => null,
            'status' => fake()->randomElement(['Pending', 'Confirmed', 'Cancelled', 'Refunded', 'Failed']),
            'notes' => fake()->optional()->sentence(),
            'paid_at' => fake()->optional()->dateTimeThisMonth(),
            'confirmed_at' => null,
        ];
    }
}
