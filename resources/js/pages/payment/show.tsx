import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Booking, BankAccount } from '@/types/domain';
import { ActionButton, SummaryRow } from '@/components/soul-sips-ui';

interface Props {
    booking: Booking;
    bankAccounts: BankAccount[];
}

export default function PaymentShow({ booking, bankAccounts }: Props) {
    const { errors, flash } = usePage<{ errors: Record<string, string>; flash: { success?: string } }>().props;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [zoomedQr, setZoomedQr] = useState<string | null>(null);
    const [paymentSubmitted, setPaymentSubmitted] = useState(false);

    const activeAccounts = useMemo(() => bankAccounts.filter((a) => a.is_active), [bankAccounts]);

    if (!booking) {
        return (
            <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <div className="text-4xl">🔍</div>
                    <h2 className="text-2xl font-serif font-semibold text-stone-100">Booking not found</h2>
                    <p className="text-stone-400">No reservation linked to this payment request.</p>
                    <Link href="/"><ActionButton>Back to Home</ActionButton></Link>
                </div>
            </section>
        );
    }

    const handleSubmit = async () => {
        if (!selectedFile) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('receipt', selectedFile);

        router.post(`/payment/${booking.id}/receipt`, formData, {
            onFinish: () => setUploading(false),
            onSuccess: () => setPaymentSubmitted(true),
        });
    };

    if (paymentSubmitted) {
        return (
            <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                    className="w-full max-w-lg text-center space-y-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-10 shadow-2xl"
                >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-5xl">✅</div>
                    <h2 className="text-3xl font-serif font-semibold text-emerald-100">Payment Submitted!</h2>
                    <p className="text-stone-400 leading-relaxed">
                        Your payment for <strong className="text-stone-200">{booking.room_name}</strong> on {formatDate(booking.date)} has been received. The admin will confirm your reservation shortly.
                    </p>
                    <div className="rounded-xl border border-stone-700 bg-stone-950/60 p-4 text-left space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-stone-500">Booking</span><span className="text-stone-200">{booking.id}</span></div>
                        <div className="flex justify-between"><span className="text-stone-500">Amount</span><span className="text-emerald-300 font-bold">{formatCurrency(booking.final_price)}</span></div>
                        <div className="flex justify-between"><span className="text-stone-500">Status</span><span className="text-amber-300">Pending Confirmation</span></div>
                    </div>
                    <Link href="/"><ActionButton>Back to Home</ActionButton></Link>
                </motion.div>
            </section>
        );
    }

    return (
        <>
            <Head title="Payment" />

            <section className="mx-auto min-h-[calc(100vh-81px)] w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="max-w-2xl space-y-3 border-b border-stone-800 pb-8">
                    <div className="flex items-center gap-2 text-amber-400">
                        <span>💳</span>
                        <span className="text-xs uppercase tracking-[0.35em] font-sans">Payment</span>
                    </div>
                    <h2 className="text-4xl font-serif font-semibold tracking-tight text-stone-100">Complete Your Payment</h2>
                    <p className="text-stone-400 leading-relaxed">
                        Transfer the total amount to any of the bank accounts below and upload your payment receipt.
                    </p>
                </div>

                {flash?.success && (
                    <div className="mt-6 mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-emerald-400">
                        {flash.success}
                    </div>
                )}

                <div className="mt-8 mx-auto max-w-2xl space-y-8">
                    <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4 sm:p-6 shadow-2xl shadow-stone-950/60 space-y-5 text-center">
                        <div className="pb-4 border-b border-stone-800">
                            <p className="text-xs uppercase tracking-[0.3em] text-amber-500/80 font-sans">Amount Due</p>
                            <div className="mt-2 text-5xl font-serif font-bold text-amber-400">{formatCurrency(booking.final_price)}</div>
                            {booking.discount_amount > 0 && (
                                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
                                    <span className="text-xs text-emerald-300">🎟️ Voucher {booking.voucher_code} −{formatCurrency(booking.discount_amount)}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2.5 text-sm text-left">
                            <SummaryRow label="Room" value={booking.room_name} />
                            <SummaryRow label="Duration" value={booking.duration === '1.5' ? '1.5 Hours' : `${booking.duration} Hours`} />
                            <SummaryRow label="Guests" value={`${booking.guest_count} pax`} />
                            <SummaryRow label="Per person" value={formatCurrency(booking.per_person_price)} highlight />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-stone-300 text-center">Select a Bank Account to Pay</h3>
                        {activeAccounts.length === 0 && (
                            <div className="rounded-xl border border-stone-800 bg-stone-900 p-4 text-sm text-stone-500 text-center">No bank accounts available yet. Please contact the admin.</div>
                        )}
                        {activeAccounts.map((acc) => (
                            <div key={acc.id} className="rounded-2xl border border-stone-800 bg-stone-900 p-6 space-y-4 text-center">
                                <h4 className="text-lg font-semibold text-stone-200">{acc.bank_name}</h4>
                                {acc.qr_code_url && (
                                    <button type="button" onClick={() => setZoomedQr(acc.qr_code_url)} className="mx-auto block">
                                        <img src={acc.qr_code_url} alt="QR Code"
                                            className="mx-auto max-w-xs w-full rounded-xl border border-stone-700 object-contain bg-white cursor-pointer hover:opacity-90 transition" />
                                    </button>
                                )}
                                <div className="space-y-1.5 text-sm">
                                    <div><span className="text-stone-500">Account Name:</span><span className="ml-2 text-stone-200 font-mono">{acc.account_name}</span></div>
                                    <div><span className="text-stone-500">Account Number:</span><span className="ml-2 text-stone-200 font-mono tracking-wider">{acc.account_number}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-stone-300 text-center">Upload Payment Receipt</h3>
                        <div className="text-center">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-700 bg-stone-800 px-5 py-3 text-sm text-stone-300 transition hover:bg-stone-700">
                                {selectedFile ? 'Change file' : 'Choose receipt image'}
                                <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} className="hidden" />
                            </label>
                            {selectedFile && <span className="ml-3 text-xs text-stone-500">{selectedFile.name}</span>}
                        </div>
                        {selectedFile && (
                            <div className="overflow-hidden rounded-xl border border-stone-700">
                                <img src={URL.createObjectURL(selectedFile)} alt="Receipt preview" className="max-h-48 w-full object-contain bg-stone-950" />
                            </div>
                        )}
                        <ActionButton onClick={handleSubmit} disabled={!selectedFile || uploading} className="w-full">
                            {uploading ? 'Uploading...' : `Pay ${formatCurrency(booking.final_price)}`}
                        </ActionButton>
                        <p className="text-center text-[11px] text-stone-500">
                            ☕ Please upload a clear screenshot or photo of your payment receipt. The admin will confirm your booking once the payment is verified.
                        </p>
                    </div>
                </div>

                {zoomedQr && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setZoomedQr(null)}>
                        <button type="button" onClick={() => setZoomedQr(null)} className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl">&times;</button>
                        <img src={zoomedQr} alt="QR Code full size"
                            className="max-h-[90vh] max-w-[90vw] rounded-2xl border border-stone-700 bg-white object-contain"
                            onClick={(e) => e.stopPropagation()} />
                    </div>
                )}
            </section>
        </>
    );
}
