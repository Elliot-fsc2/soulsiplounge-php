<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_name' => fake()->word(),
            'product_price' => fake()->numberBetween(50, 500),
            'quantity' => fake()->numberBetween(1, 5),
            'subtotal' => fn (array $attrs) => $attrs['product_price'] * $attrs['quantity'],
            'item_type' => 'product',
        ];
    }
}
