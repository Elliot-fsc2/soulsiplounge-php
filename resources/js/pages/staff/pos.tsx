import { Head, usePage } from '@inertiajs/react';
import { useState, useCallback, useEffect } from 'react';
import { Coffee, Cookie, DoorOpen, Printer, ShoppingCart, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { usePrinter } from '@/hooks/usePrinter';
import { buildReceipt, buildKitchenChit } from '@/lib/escpos';
import type { PrintData } from '@/lib/escpos';
import ProductGrid from '@/components/pos/ProductGrid';
import CartPanel, { type CartItem } from '@/components/pos/CartPanel';
import CheckoutModal from '@/components/pos/CheckoutModal';
import RoomSelector from '@/components/pos/RoomSelector';
import { formatCurrency } from '@/lib/format';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface Room {
  id: string;
  name: string;
  pricing: unknown[];
}

interface Props {
  products: Product[];
  rooms: Room[];
}

const categoryTabs = [
  { key: 'all', label: 'All', icon: ShoppingCart },
  { key: 'beverage', label: 'Beverages', icon: Coffee },
  { key: 'snack', label: 'Snacks', icon: Cookie },
  { key: 'room', label: 'Rooms', icon: DoorOpen },
];

export default function StaffPos({ products, rooms }: Props) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const [bookingId] = useState<string | null>(null);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  const { connect, print, status: printerStatus, isSupported } = usePrinter();

  useEffect(() => {
    if (!isSupported) {
      toast.error('Printer not available — Web Serial API not supported in this browser');
    }
  }, [isSupported]);

  const { props: pageProps } = usePage();
  const printData = (pageProps.printData ?? undefined) as PrintData | undefined;

  useEffect(() => {
    const data = printData;
    if (!data) return;

    (async () => {
      try {
        setPrintStatus('Printing receipt...');
        const receiptBytes = buildReceipt(data.invoice);
        await print(receiptBytes);

        if (data.print_kitchen_chit) {
          setPrintStatus('Printing kitchen chit...');
          const chitBytes = buildKitchenChit({
            order_number: data.invoice.invoice_number,
            created_at: data.invoice.created_at,
            room_name: data.invoice.room_name,
            items: data.invoice.items.map((item) => ({
              product_name: item.product_name,
              quantity: item.quantity,
            })),
          });
          await print(chitBytes);
        }

        setPrintStatus('Print successful!');
        setTimeout(() => setPrintStatus(null), 3000);
      } catch (err) {
        setPrintStatus(err instanceof Error ? err.message : 'Print failed');
        setTimeout(() => setPrintStatus(null), 5000);
      }
    })();
  }, [printData, print]);

  const roomName = roomId ? rooms.find((r) => r.id === roomId)?.name ?? null : null;

  const handleAddProduct = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  }, []);

  const handleUpdateQty = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  }, []);

  const handleRemove = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  }, []);

  const handleRoomSelect = useCallback((newRoomId: string | null, newGuestCount: number) => {
    setRoomId(newRoomId);
    setGuestCount(newGuestCount);

    if (newRoomId) {
      const roomProduct = products.find(
        (p) => p.category === 'room' && p.name.toLowerCase().includes(rooms.find((r) => r.id === newRoomId)?.name.toLowerCase().split(' ')[0] ?? ''),
      );

      if (roomProduct) {
        setCart((prev) => {
          const existing = prev.find((item) => item.product_id === roomProduct.id);
          if (existing) {
            return prev.map((item) =>
              item.product_id === roomProduct.id ? { ...item, quantity: newGuestCount } : item,
            );
          }
          return [...prev, { product_id: roomProduct.id, name: roomProduct.name, price: roomProduct.price, quantity: newGuestCount }];
        });
      }
    }
  }, [products, rooms]);

  const handleCheckoutSuccess = useCallback(() => {
    setCart([]);
    setRoomId(null);
    setGuestCount(0);
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <Head title="POS - Soul Sips Lounge" />

      <div className="flex h-[calc(100vh-4rem)] flex-col sm:flex-row gap-0 sm:gap-0">
        <div className="flex flex-1 flex-col overflow-hidden border-r border-stone-800">
          <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900/80 px-4 py-3">
            <div className="flex items-center gap-1">
              {categoryTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveCategory(tab.key)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      activeCategory === tab.key
                        ? 'bg-amber-400 text-stone-950'
                        : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {printStatus && (
                <span className="text-xs text-amber-400 animate-pulse">{printStatus}</span>
              )}
              {isSupported ? (
                <button
                  type="button"
                  onClick={connect}
                  title={printerStatus === 'connected' ? 'Printer connected' : 'Connect printer'}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    printerStatus === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
                  }`}
                >
                  {printerStatus === 'connected' ? (
                    <><Wifi className="size-3" /> Printer</>
                  ) : (
                    <><Printer className="size-3" /> Connect</>
                  )}
                </button>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-stone-800 px-3 py-1.5 text-xs text-stone-500">
                  <WifiOff className="size-3" /> No Serial
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ProductGrid
              products={products}
              activeCategory={activeCategory}
              onAddProduct={handleAddProduct}
            />
          </div>
        </div>

        <div className="flex w-full flex-col sm:w-80 lg:w-96">
          <div className="flex-1 overflow-y-auto p-4">
            <CartPanel
              items={cart}
              roomLabel={roomName}
              guestCount={guestCount}
              onUpdateQty={handleUpdateQty}
              onRemove={handleRemove}
              onOpenRoomSelector={() => setShowRoomSelector(true)}
              onOpenCheckout={() => setShowCheckout(true)}
            />
          </div>

          {cart.length > 0 && (
            <div className="shrink-0 border-t border-stone-800 bg-stone-900/80 px-4 py-3 sm:hidden">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-stone-400">Total</span>
                <span className="text-lg font-serif font-bold text-amber-400">{formatCurrency(cartTotal)}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckout(true)}
                className="w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-bold tracking-wide text-stone-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-300"
              >
                Pay & Print
              </button>
            </div>
          )}
        </div>
      </div>

      {showRoomSelector && (
        <RoomSelector
          rooms={rooms}
          selectedRoomId={roomId}
          guestCount={guestCount}
          onSelect={handleRoomSelect}
          onClose={() => setShowRoomSelector(false)}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          items={cart}
          roomId={roomId}
          guestCount={guestCount}
          bookingId={bookingId}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </>
  );
}
