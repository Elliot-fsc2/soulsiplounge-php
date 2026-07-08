<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\BankAccount;
use App\Models\Booking;
use App\Models\Contact;
use App\Models\Room;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@soulsips.com',
            'role' => UserRole::Admin,
        ]);

        User::factory()->create([
            'name' => 'Staff',
            'email' => 'staff@soulsips.com',
            'role' => UserRole::Staff,
        ]);

        Room::factory()->create([
            'name' => 'The Haven Room',
            'description' => 'Our premier lounge space with ambient lighting, premium sound system, and elegant decor perfect for intimate celebrations.',
            'image' => null,
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
        ]);

        Booking::factory()->create([
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
            'phone' => '09171234567',
            'room_name' => 'The Haven Room',
            'guest_count' => 6,
            'duration' => '2',
            'with_cake' => true,
            'date' => now()->addDays(7)->format('Y-m-d'),
            'time' => '18:00',
            'per_person_price' => 1058,
            'total_price' => 6348,
            'voucher_code' => 'WELCOME10',
            'discount_amount' => 635,
            'final_price' => 5713,
            'status' => 'Confirmed',
            'notes' => 'Celebrating birthday',
        ]);

        Booking::factory()->create([
            'name' => 'Jordan Lee',
            'email' => 'jordan@example.com',
            'phone' => '09179876543',
            'room_name' => 'The Haven Room',
            'guest_count' => 4,
            'duration' => '1.5',
            'with_cake' => false,
            'date' => now()->addDays(14)->format('Y-m-d'),
            'time' => '14:00',
            'per_person_price' => 840,
            'total_price' => 3360,
            'voucher_code' => null,
            'discount_amount' => 0,
            'final_price' => 3360,
            'status' => 'Pending',
            'notes' => null,
        ]);

        Contact::factory()->create([
            'name' => 'Avery Brooks',
            'email' => 'avery@example.com',
            'phone' => '09175551234',
            'subject' => 'Group of 15 inquiry',
            'message' => 'Hi! We are a group of 15 looking to celebrate a friend\'s promotion. Do you have a room that can accommodate more than 12 guests? If not, do you have any recommendations for nearby venues?',
            'status' => 'New',
        ]);

        Contact::factory()->create([
            'name' => 'Sofia Nguyen',
            'email' => 'sofia@example.com',
            'phone' => null,
            'subject' => 'Cake customization',
            'message' => 'Hello! I saw that you offer a cake add-on for bookings. Can you customize the cake flavor or design? I\'d love to have a ube-flavored cake for my birthday celebration.',
            'status' => 'Read',
        ]);

        Voucher::factory()->create([
            'code' => 'WELCOME10',
            'type' => 'percentage',
            'value' => 10,
            'min_purchase' => 0,
            'max_uses' => 100,
            'used_count' => 1,
            'expires_at' => null,
            'active' => true,
            'description' => '10% off your first booking',
        ]);

        Voucher::factory()->create([
            'code' => 'BIRTHDAY20',
            'type' => 'percentage',
            'value' => 20,
            'min_purchase' => 2000,
            'max_uses' => 50,
            'used_count' => 0,
            'expires_at' => null,
            'active' => true,
            'description' => '20% off for birthday celebrations',
        ]);

        Voucher::factory()->create([
            'code' => 'SOUL500',
            'type' => 'fixed',
            'value' => 500,
            'min_purchase' => 3000,
            'max_uses' => 0,
            'used_count' => 0,
            'expires_at' => null,
            'active' => true,
            'description' => '₱500 off your booking',
        ]);

        BankAccount::factory()->create([
            'bank_name' => 'Chinabank',
            'account_name' => 'HERNANDEZ, JULIANNA IGLESIAS',
            'account_number' => '1321 0200 0629',
            'qr_code_url' => null,
            'is_active' => true,
        ]);
    }
}
