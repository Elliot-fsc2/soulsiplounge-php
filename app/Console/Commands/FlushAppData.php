<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FlushAppData extends Command
{
    protected $signature = 'app:flush-all
                            {--force : Skip the confirmation prompt}';

    protected $description = 'Truncate all data except users, inventory, products, and bank accounts';

    public function handle(): int
    {
        $tables = [
            'bookings',
            'contacts',
            'invoice_items',
            'invoices',
            'order_items',
            'orders',
            'payments',
            'vouchers',
        ];

        if (! $this->option('force')) {
            $tableList = implode(', ', $tables);
            $confirmed = $this->confirm(
                "This will TRUNCATE the following tables: {$tableList}. Are you sure?",
                false,
            );

            if (! $confirmed) {
                $this->info('Cancelled.');

                return Command::SUCCESS;
            }
        }

        $this->warn('Disabling foreign key checks...');
        Schema::disableForeignKeyConstraints();

        $counts = [];
        foreach ($tables as $table) {
            if (! Schema::hasTable($table)) {
                $this->warn("Table [{$table}] does not exist, skipping.");

                continue;
            }

            $counts[$table] = DB::table($table)->count();
            DB::table($table)->truncate();
            $this->line("Truncated [{$table}] — {$counts[$table]} rows removed.");
        }

        Schema::enableForeignKeyConstraints();

        $total = array_sum($counts);
        $this->info("Done! {$total} total rows truncated across ".count($counts).' tables.');

        return Command::SUCCESS;
    }
}
