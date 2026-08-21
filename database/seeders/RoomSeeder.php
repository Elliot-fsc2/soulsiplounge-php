<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        Room::truncate();

        Room::factory()->create([
            'name' => 'The Haven Room',
            'description' => 'Our premier lounge space with ambient lighting, premium sound system, and elegant decor perfect for intimate celebrations.',
            'image' => null,
            'min_group' => 3,
            'max_group' => 12,
            'pricing' => [
                ['duration' => '1.5', 'per_person_rates' => ['3' => 1050, '4' => 840, '5' => 714, '6' => 630, '7' => 570, '8' => 525, '9' => 490, '10' => 462, '11' => 440, '12' => 420]],
                ['duration' => '2', 'per_person_rates' => ['3' => 1200, '4' => 960, '5' => 816, '6' => 720, '7' => 651, '8' => 600, '9' => 560, '10' => 528, '11' => 503, '12' => 480]],
                ['duration' => '3', 'per_person_rates' => ['3' => 1500, '4' => 1200, '5' => 1020, '6' => 900, '7' => 814, '8' => 750, '9' => 700, '10' => 660, '11' => 629, '12' => 600]],
            ],
            'sort_order' => 0,
        ]);

        Room::factory()->create([
            'name' => 'Starry Night Duo Room',
            'description' => 'A cozy space perfect for two. Comes with free drink & snacks, and free WiFi.',
            'image' => null,
            'min_group' => 2,
            'max_group' => 2,
            'pricing' => [
                ['duration' => '2', 'per_person_rates' => ['2' => 649]],
            ],
            'sort_order' => 1,
        ]);

        Room::factory()->create([
            'name' => 'Solo Room',
            'description' => 'A private haven for one. Comes with free drink & snacks.',
            'image' => null,
            'min_group' => 1,
            'max_group' => 1,
            'pricing' => [
                ['duration' => '2', 'per_person_rates' => ['1' => 649]],
            ],
            'sort_order' => 2,
        ]);
    }
}
