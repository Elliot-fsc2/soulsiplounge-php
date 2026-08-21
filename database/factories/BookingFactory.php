<?php

namespace Database\Factories;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'room_name' => 'The Haven Room',
            'guest_count' => fake()->numberBetween(3, 12),
            'duration' => fake()->randomElement(['1.5', '2', '3']),
            'date' => fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
            'time' => fake()->randomElement(['10:00', '11:00', '14:00', '16:00', '18:00', '20:00']),
            'per_person_price' => fake()->numberBetween(400, 2000),
            'total_price' => fake()->numberBetween(2000, 20000),
            'voucher_code' => null,
            'discount_amount' => 0,
            'final_price' => fake()->numberBetween(2000, 20000),
            'status' => fake()->randomElement(['Pending', 'Confirmed', 'Completed', 'Cancelled']),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
