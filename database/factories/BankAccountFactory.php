<?php

namespace Database\Factories;

use App\Models\BankAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BankAccount>
 */
class BankAccountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'bank_name' => fake()->randomElement(['BPI', 'BDO', 'Metrobank', 'Unionbank', 'GCash']),
            'account_name' => 'Soul Sips Lounge',
            'account_number' => fake()->numerify('####-####-##'),
            'qr_code_url' => null,
            'is_active' => true,
        ];
    }
}
