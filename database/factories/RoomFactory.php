<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'image' => null,
            'description' => fake()->paragraph(),
            'min_group' => 3,
            'max_group' => 12,
            'pricing' => [
                ['duration' => '1.5', 'with_cake' => false, 'per_person_rates' => ['3' => 1050, '4' => 840, '5' => 714, '6' => 630, '7' => 570, '8' => 525, '9' => 490, '10' => 462, '11' => 440, '12' => 420]],
                ['duration' => '1.5', 'with_cake' => true, 'per_person_rates' => ['3' => 1833, '4' => 1375, '5' => 1175, '6' => 1058, '7' => 980, '8' => 925, '9' => 880, '10' => 845, '11' => 820, '12' => 795]],
                ['duration' => '2', 'with_cake' => false, 'per_person_rates' => ['3' => 1200, '4' => 960, '5' => 816, '6' => 720, '7' => 651, '8' => 600, '9' => 560, '10' => 528, '11' => 503, '12' => 480]],
                ['duration' => '2', 'with_cake' => true, 'per_person_rates' => ['3' => 1833, '4' => 1375, '5' => 1175, '6' => 1058, '7' => 980, '8' => 925, '9' => 880, '10' => 845, '11' => 820, '12' => 795]],
                ['duration' => '3', 'with_cake' => false, 'per_person_rates' => ['3' => 1500, '4' => 1200, '5' => 1020, '6' => 900, '7' => 814, '8' => 750, '9' => 700, '10' => 660, '11' => 629, '12' => 600]],
                ['duration' => '3', 'with_cake' => true, 'per_person_rates' => ['3' => 2133, '4' => 1600, '5' => 1360, '6' => 1200, '7' => 1086, '8' => 1000, '9' => 933, '10' => 880, '11' => 839, '12' => 800]],
            ],
            'sort_order' => 0,
        ];
    }
}
