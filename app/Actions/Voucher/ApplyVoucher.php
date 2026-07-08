<?php

namespace App\Actions\Voucher;

use App\Models\Voucher;

class ApplyVoucher
{
    public function execute(string $code, Voucher $voucher, int $totalAmount): array
    {
        if (! $voucher->active) {
            return ['discount' => 0, 'finalPrice' => $totalAmount, 'valid' => false, 'message' => 'Voucher is inactive.'];
        }

        if ($voucher->expires_at && $voucher->expires_at->isPast()) {
            return ['discount' => 0, 'finalPrice' => $totalAmount, 'valid' => false, 'message' => 'Voucher has expired.'];
        }

        if ($voucher->max_uses > 0 && $voucher->used_count >= $voucher->max_uses) {
            return ['discount' => 0, 'finalPrice' => $totalAmount, 'valid' => false, 'message' => 'Voucher usage limit reached.'];
        }

        if ($totalAmount < $voucher->min_purchase) {
            return ['discount' => 0, 'finalPrice' => $totalAmount, 'valid' => false, 'message' => 'Minimum purchase not met.'];
        }

        if ($voucher->type->value === 'percentage') {
            $discount = (int) round($totalAmount * $voucher->value / 100);
        } else {
            $discount = min($voucher->value, $totalAmount);
        }

        $finalPrice = $totalAmount - $discount;

        return ['discount' => $discount, 'finalPrice' => $finalPrice, 'valid' => true, 'message' => 'Voucher applied successfully!'];
    }
}
