<?php

namespace Database\Factories;

use App\Models\Voucher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Voucher>
 */
class VoucherFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->bothify('SOUL####')),
            'type' => fake()->randomElement(['percentage', 'fixed']),
            'value' => fake()->numberBetween(10, 50),
            'min_purchase' => fake()->numberBetween(500, 5000),
            'max_uses' => fake()->numberBetween(0, 100),
            'used_count' => 0,
            'expires_at' => fake()->boolean(70) ? fake()->dateTimeBetween('now', '+1 year')->format('Y-m-d') : null,
            'active' => true,
            'description' => fake()->optional()->sentence(),
        ];
    }
}
