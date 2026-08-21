import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

import type { AssignedRoom } from '@/Pages/staff/pos';


export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  items: CartItem[];
  assignedRooms: AssignedRoom[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onRemoveRoom: (id: string) => void;
  onOpenRoomSelector: () => void;
  onOpenCheckout: () => void;
}

export default function CartPanel({ items, assignedRooms, onUpdateQty, onRemove, onRemoveRoom, onOpenRoomSelector, onOpenCheckout }: Props) {
  const roomsTotal = assignedRooms.reduce((sum, r) => sum + r.price, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + roomsTotal;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-stone-800 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-semibold text-stone-100">Current Order</h3>
          <span className="text-sm text-stone-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>

        <button
          type="button"
          onClick={onOpenRoomSelector}
          className="mt-3 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-center text-sm text-stone-400 transition hover:border-amber-500/40 hover:text-stone-200"
        >
          + Assign Room
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {items.length === 0 && assignedRooms.length === 0 && (
          <p className="py-8 text-center text-sm text-stone-500">Tap a product or assign a room to start.</p>
        )}
        {assignedRooms.map((r) => (
          <div key={r.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-amber-400">{r.roomName}</div>
                <div className="text-xs text-stone-400">{r.duration} hrs &middot; {r.guestCount} pax</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-amber-400">{formatCurrency(r.price)}</span>
                <button
                  type="button"
                  onClick={() => onRemoveRoom(r.id)}
                  className="shrink-0 rounded-lg p-1 text-stone-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.map((item) => (
          <div key={item.product_id} className="rounded-xl border border-stone-800 bg-stone-900 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-stone-200">{item.name}</div>
                <div className="text-xs text-stone-400">{formatCurrency(item.price)} each</div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.product_id)}
                className="shrink-0 rounded-lg p-1 text-stone-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => onUpdateQty(item.product_id, -1)}
                disabled={item.quantity <= 1}
                className="flex size-7 items-center justify-center rounded-lg border border-stone-700 bg-stone-800 text-stone-300 transition hover:bg-stone-700 disabled:opacity-30"
              >
                <Minus className="size-3" />
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-bold text-stone-100">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQty(item.product_id, 1)}
                className="flex size-7 items-center justify-center rounded-lg border border-stone-700 bg-stone-800 text-stone-300 transition hover:bg-stone-700"
              >
                <Plus className="size-3" />
              </button>
              <div className="ml-auto text-sm font-semibold text-amber-400">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-stone-800 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-400">Subtotal</span>
          <span className="text-lg font-serif font-bold text-stone-100">{formatCurrency(subtotal)}</span>
        </div>
        <button
          type="button"
          onClick={onOpenCheckout}
          disabled={items.length === 0 && assignedRooms.length === 0}
          className="w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-bold tracking-wide text-stone-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Pay & Print
        </button>
      </div>
    </div>
  );
}
