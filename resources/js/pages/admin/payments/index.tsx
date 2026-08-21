import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { ShoppingCart, CalendarCheck } from 'lucide-react';
import { ActionButton, StatusPill, EmptyState, ListPanel } from '@/components/soul-sips-ui';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { confirm as confirmRoute, cancel, refund, destroy } from '@/routes/admin/payments';
import Pagination from '@/components/ui/pagination';
import ConfirmModal from '@/components/confirm-modal';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  item_type: string;
}

interface PosOrder {
  id: string;
  order_number: string;
  total: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  items: OrderItem[];
}

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: 'Pending' | 'Confirmed' | 'Refunded';
  receipt_url: string | null;
  paid_at: string | null;
  confirmed_at: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  room_name: string;
  date: string;
  time: string;
}

interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
  payments: PaginatedData<Payment>;
  bookings: Booking[];
  posOrders: PaginatedData<PosOrder>;
}

type Tab = 'bookings' | 'pos';

export default function AdminPaymentsIndex({ payments, bookings, posOrders }: Props) {
  const paymentList = payments.data;
  const posOrderList = posOrders.data;
  const { auth } = usePage<{ auth: { user: { role: string; name: string } } }>().props;
  const isAdmin = auth.user.role === 'admin';
  const [activeTab, setActiveTab] = useState<Tab>('bookings');

  const bookingMap = new Map(bookings.map((b) => [b.id, b]));

  const confirmedCount = paymentList.filter((p) => p.status === 'Confirmed').length;
  const pendingCount = paymentList.filter((p) => p.status === 'Pending').length;

  const posTotalRevenue = posOrderList.reduce((sum, o) => sum + o.total, 0);
  const posCount = posOrders.total;
  const posDisplayCount = posOrderList.length;

  const handleConfirm = (pmt: Payment) => {
    router.post(confirmRoute.url({ payment: pmt.id }), {}, { preserveScroll: true });
  };

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    action: 'cancel' | 'refund' | 'delete' | null;
    payment: Payment | null;
  }>({
    isOpen: false,
    action: null,
    payment: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const openConfirm = (action: 'cancel' | 'refund' | 'delete', payment: Payment) => {
    setConfirmState({ isOpen: true, action, payment });
  };

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, action: null, payment: null });
  };

  const executeAction = () => {
    const { action, payment } = confirmState;
    if (!action || !payment) return;

    setIsProcessing(true);
    const options = {
      preserveScroll: true,
      onFinish: () => {
        setIsProcessing(false);
        closeConfirm();
      },
    };

    if (action === 'cancel') {
      router.post(cancel.url({ payment: payment.id }), {}, options);
    } else if (action === 'refund') {
      router.post(refund.url({ payment: payment.id }), {}, options);
    } else if (action === 'delete') {
      router.delete(destroy.url({ payment: payment.id }), options);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof CalendarCheck; count: number }[] = [
    { key: 'bookings', label: 'Booking Payments', icon: CalendarCheck, count: payments.total },
    { key: 'pos', label: 'POS Orders', icon: ShoppingCart, count: posOrders.total },
  ];

  return (
    <>
      <Head title="Payments - Soul Sips Lounge" />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-stone-100">Payments</h2>
            <p className="mt-1 text-sm text-stone-400">
              {isAdmin ? 'Admin' : 'Staff Access'} &middot; {auth.user.name}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 rounded-xl border border-stone-800 bg-stone-900/50 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  isActive
                    ? 'bg-stone-950/20 text-stone-950'
                    : 'bg-stone-800 text-stone-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content: Booking Payments */}
        {activeTab === 'bookings' && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
                <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Total Booking Payments</div>
                <div className="mt-2 text-3xl font-serif font-bold text-stone-100">{payments.total}</div>
              </div>
              <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
                <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Confirmed</div>
                <div className="mt-2 text-3xl font-serif font-bold text-emerald-400">{confirmedCount}</div>
              </div>
              <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
                <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Pending</div>
                <div className="mt-2 text-3xl font-serif font-bold text-amber-300">{pendingCount}</div>
              </div>
            </div>

            <ListPanel title="Booking Payments" description="Down payments and receipts for room reservations.">
              <div className="divide-y divide-white/10">
                {paymentList.length === 0 && <EmptyState message="No booking payments recorded yet." />}
                {paymentList.map((pmt) => {
                  const booking = bookingMap.get(pmt.booking_id);

                  return (
                    <div key={pmt.id} className="py-4 space-y-3">
                      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.2fr_auto] lg:items-start">
                        <div>
                          <div className="text-sm font-medium text-stone-400">Booking</div>
                          <div className="font-medium text-white">{booking?.name ?? 'Unknown'}</div>
                          <div className="text-sm text-stone-400">{booking?.email}</div>
                          {booking?.phone && <div className="text-sm text-stone-400">{booking.phone}</div>}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-stone-400">Room &amp; Schedule</div>
                          <div className="text-white">{booking?.room_name}</div>
                          <div className="text-sm text-stone-400">
                            {booking?.date ? formatDate(booking.date) : ''} at {booking?.time ? formatTime(booking.time) : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-serif font-bold text-amber-400">{formatCurrency(pmt.amount)}</div>
                          <div className="mt-1"><StatusPill status={pmt.status} compact /></div>
                          {pmt.paid_at && <div className="mt-1 text-xs text-stone-500">Paid {formatDate(pmt.paid_at)}</div>}
                          {pmt.confirmed_at && <div className="text-xs text-stone-500">Confirmed {formatDate(pmt.confirmed_at)}</div>}
                        </div>
                      </div>

                      {pmt.receipt_url && (
                        <div>
                          <a href={pmt.receipt_url} target="_blank" rel="noopener noreferrer">
                            <img src={pmt.receipt_url} alt="Receipt" className="h-20 w-20 rounded-lg border border-stone-700 object-cover" />
                          </a>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {pmt.status === 'Pending' && (
                          <>
                            <ActionButton variant="ghost" onClick={() => handleConfirm(pmt)}>
                              Confirm
                            </ActionButton>
                            <ActionButton variant="ghost" onClick={() => openConfirm('cancel', pmt)}>
                              Cancel
                            </ActionButton>
                          </>
                        )}
                        {pmt.status === 'Confirmed' && (
                          <ActionButton variant="ghost" onClick={() => openConfirm('refund', pmt)}>
                            Refund
                          </ActionButton>
                        )}
                        {isAdmin && (
                          <ActionButton variant="ghost" onClick={() => openConfirm('delete', pmt)}
                            className="!border-rose-400/20 !bg-rose-500/10 !text-rose-300 hover:!bg-rose-500/20">
                            Delete
                          </ActionButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ListPanel>

            <Pagination meta={payments} pageParam="payments_page" />
          </>
        )}

        {/* Tab Content: POS Orders */}
        {activeTab === 'pos' && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
                <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Total POS Orders</div>
                <div className="mt-2 text-3xl font-serif font-bold text-stone-100">{posOrders.total}</div>
              </div>
              <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
                <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Total Revenue (Page)</div>
                <div className="mt-2 text-3xl font-serif font-bold text-amber-400">{formatCurrency(posTotalRevenue)}</div>
              </div>
              <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
                <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Avg per Order</div>
                <div className="mt-2 text-3xl font-serif font-bold text-sky-300">
                  {posDisplayCount > 0 ? formatCurrency(Math.round(posTotalRevenue / posDisplayCount)) : '—'}
                </div>
              </div>
            </div>

            <ListPanel title="POS Orders" description="Products bought at the Point of Sale.">
              <div className="divide-y divide-white/10">
                {posOrderList.length === 0 && <EmptyState message="No POS orders yet." />}
                {posOrderList.map((order) => (
                  <div key={order.id} className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-amber-400" />
                        <span className="font-medium text-white">#{order.order_number}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-serif font-bold text-amber-400">{formatCurrency(order.total)}</div>
                        {order.payment_method && (
                          <span className="text-xs uppercase text-stone-500">{order.payment_method}</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {order.items.map((item: OrderItem) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-stone-400 tabular-nums">{item.quantity}x</span>
                            <span className="truncate text-stone-200">{item.product_name}</span>
                          </div>
                          <span className="ml-2 shrink-0 font-medium text-amber-400">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ListPanel>

            <Pagination meta={posOrders} pageParam="pos_page" />
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={executeAction}
        isLoading={isProcessing}
        title={
          confirmState.action === 'cancel' ? 'Cancel Payment' :
          confirmState.action === 'refund' ? 'Refund Payment' :
          'Delete Payment'
        }
        description={
          confirmState.action === 'cancel'
            ? 'Are you sure you want to cancel this payment? This action cannot be undone.'
            : confirmState.action === 'refund'
            ? 'Are you sure you want to refund this payment? This action is irreversible and the funds will be returned to the customer.'
            : 'Are you sure you want to permanently delete this payment record? This action cannot be undone.'
        }
        confirmText={
          confirmState.action === 'cancel' ? 'Yes, Cancel Payment' :
          confirmState.action === 'refund' ? 'Yes, Refund Payment' :
          'Yes, Delete Payment'
        }
      />
    </>
  );
}
