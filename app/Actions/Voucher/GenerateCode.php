<?php

namespace App\Actions\Voucher;

class GenerateCode
{
    public function execute(string $prefix = 'SOUL'): string
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';

        for ($i = 0; $i < 5; $i++) {
            $code .= $characters[random_int(0, strlen($characters) - 1)];
        }

        return strtoupper($prefix).$code;
    }
}
