import { useState } from 'react';
import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { CartItem } from './CartPanel';
import { store } from '@/routes/staff/orders';

interface Props {
  items: CartItem[];
  roomId: string | null;
  guestCount: number;
  bookingId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ items, roomId, guestCount, bookingId, onClose, onSuccess }: Props) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [processing, setProcessing] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tendered = parseFloat(amountTendered) || 0;
  const change = tendered - total;
  const isValid = paymentMethod === 'cash' ? tendered >= total : true;

  function handleSubmit() {
    if (!isValid) return;

    setProcessing(true);

    router.post(store.url(), {
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      payment_method: paymentMethod,
      amount_tendered: paymentMethod === 'cash' ? Math.round(tendered) : null,
      room_id: roomId,
      guest_count: guestCount > 0 ? guestCount : null,
      booking_id: bookingId,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        onSuccess();
        onClose();
      },
      onFinish: () => setProcessing(false),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-stone-700 bg-stone-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
          <div>
            <div className="text-[10px] font-sans uppercase tracking-widest text-amber-400">Checkout</div>
            <h4 className="text-sm font-serif font-semibold text-stone-100">Complete Order</h4>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-stone-800 p-1.5 text-stone-400 transition hover:bg-stone-700 hover:text-stone-100">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between text-sm">
                <span className="text-stone-300">
                  {item.name} <span className="text-stone-500">x{item.quantity}</span>
                </span>
                <span className="text-stone-100">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-800 pt-3 flex items-center justify-between">
            <span className="text-base font-serif font-bold text-stone-100">Total</span>
            <span className="text-xl font-serif font-bold text-amber-400">{formatCurrency(total)}</span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-400">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {['cash', 'gcash', 'card', 'bank_transfer'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-xl border px-3 py-2.5 text-center text-sm font-medium capitalize transition ${
                    paymentMethod === method
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-stone-700 bg-stone-900 text-stone-400 hover:border-stone-600'
                  }`}
                >
                  {method === 'bank_transfer' ? 'Bank Transfer' : method}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-400">Amount Tendered (₱)</label>
              <input
                type="number"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              {amountTendered && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-stone-400">Change</span>
                  <span className={`font-bold ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(Math.abs(change))}
                    {change < 0 ? ' (short)' : ''}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-stone-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-stone-700 bg-stone-800 px-5 py-3 text-sm font-bold tracking-wide text-stone-300 transition hover:bg-stone-700 hover:text-stone-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={processing || !isValid}
            className="flex-1 rounded-full bg-amber-400 px-5 py-3 text-sm font-bold tracking-wide text-stone-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
