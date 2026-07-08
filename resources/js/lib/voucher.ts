import type { Voucher } from '@/types/domain';

export function applyVoucher(
  voucher: Voucher,
  totalAmount: number,
): { discount: number; finalPrice: number; valid: boolean; message: string } {
  if (!voucher.active) {
    return { discount: 0, finalPrice: totalAmount, valid: false, message: 'Voucher is inactive.' };
  }

  if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
    return { discount: 0, finalPrice: totalAmount, valid: false, message: 'Voucher has expired.' };
  }

  if (voucher.max_uses > 0 && voucher.used_count >= voucher.max_uses) {
    return { discount: 0, finalPrice: totalAmount, valid: false, message: 'Voucher usage limit reached.' };
  }

  if (totalAmount < voucher.min_purchase) {
    return { discount: 0, finalPrice: totalAmount, valid: false, message: 'Minimum purchase not met.' };
  }

  let discount: number;

  if (voucher.type === 'percentage') {
    discount = Math.round(totalAmount * voucher.value / 100);
  } else {
    discount = Math.min(voucher.value, totalAmount);
  }

  return {
    discount,
    finalPrice: totalAmount - discount,
    valid: true,
    message: 'Voucher applied successfully!',
  };
}
