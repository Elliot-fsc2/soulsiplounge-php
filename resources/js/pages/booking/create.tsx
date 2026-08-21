import { Head, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { formatCurrency, formatTime, getTimeRangeDisplay } from '@/lib/format';
import { computePerPersonRate } from '@/lib/pricing';
import { applyVoucher } from '@/lib/voucher';
import { generateAvailableSlots, isSlotAvailable, timeToMinutes } from '@/lib/availability';
import { CLOSING_MINUTES, MAINTENANCE_INTERVAL } from '@/lib/constants';
import { todayStr, minutesToTime } from '@/lib/time';
import type { Room, Booking, Duration, Voucher } from '@/types/domain';
import { CafeField, CafeInput, CafeTextarea, ActionButton, SummaryRow } from '@/components/soul-sips-ui';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
    rooms: Room[];
    selectedRoomId: string;
    bookings?: Booking[];
    vouchers?: Voucher[];
}

export default function BookingCreate({ rooms, selectedRoomId, bookings = [], vouchers = [] }: Props) {
    const { errors, flash } = usePage<{ errors: Record<string, string>; flash: { success?: string } }>().props;

    const [roomId, setRoomId] = useState(selectedRoomId);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [date, setDate] = useState(todayStr());
    const [duration, setDuration] = useState<string>('');
    const [guestCount, setGuestCount] = useState(3);
    const [time, setTime] = useState('');
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [voucherMessage, setVoucherMessage] = useState('');
    const [voucherValid, setVoucherValid] = useState(false);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (rooms.length === 1 && !roomId) setRoomId(rooms[0].id);
    }, []);

    const selectedRoom = rooms.find((r) => r.id === roomId) || rooms[0];
    const resolvedRoomName = selectedRoom?.name || '';
    
    const roomDurations = useMemo(() => {
        return selectedRoom?.pricing?.map(p => p.duration) || [];
    }, [selectedRoom]);

    useEffect(() => {
        if (roomDurations.length > 0 && !roomDurations.includes(duration)) {
            setDuration(roomDurations[0]);
        }
    }, [roomDurations, duration]);

    const perPerson = useMemo(() => {
        if (!selectedRoom || !duration) return 0;
        return computePerPersonRate(selectedRoom, duration, guestCount);
    }, [selectedRoom, duration, guestCount]);

    const total = perPerson * guestCount;
    const finalPrice = total - appliedDiscount;

    const availableSlots = useMemo(() => {
        return date && resolvedRoomName ? generateAvailableSlots(date, resolvedRoomName, duration, bookings) : [];
    }, [date, resolvedRoomName, duration, bookings]);

    const slotCheck = useMemo(() => {
        return isSlotAvailable(date, resolvedRoomName, time, duration, bookings);
    }, [date, resolvedRoomName, time, duration, bookings]);

    const isInPast = useMemo(() => {
        return date && time ? new Date(`${date}T${time}`) < new Date() : false;
    }, [date, time]);

    const fullyBooked = useMemo(() => {
        return date && resolvedRoomName ? (availableSlots.length === 0 && !(date === todayStr() && new Date().getHours() >= 22)) : false;
    }, [date, resolvedRoomName, availableSlots]);

    const timeRange = useMemo(() => {
        return time && date ? getTimeRangeDisplay(time, duration) : '';
    }, [time, date, duration]);

    const durationMin = parseFloat(duration) * 60;
    const maxStartMinutes = CLOSING_MINUTES - durationMin - MAINTENANCE_INTERVAL;
    const maxStartTime = minutesToTime(maxStartMinutes);

    function handleApplyVoucher() {
        const voucher = vouchers.find((v) => v.code.toUpperCase() === voucherCode.trim().toUpperCase());
        if (!voucher) {
            setVoucherMessage('Voucher code not found.');
            setAppliedDiscount(0);
            setVoucherValid(false);
            return;
        }
        const result = applyVoucher(voucher, total);
        setVoucherMessage(result.message);
        setVoucherValid(result.valid);
        if (result.valid) {
            setAppliedDiscount(result.discount);
        } else {
            setAppliedDiscount(0);
        }
    }

    function handleClearVoucher() {
        setVoucherCode('');
        setAppliedDiscount(0);
        setVoucherMessage('');
        setVoucherValid(false);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (fullyBooked) return;
        if (!slotCheck || slotCheck === false) return;
        if (isInPast) return;
        setSubmitting(true);

        router.post('/booking', {
            name, email, phone,
            room_id: roomId,
            guest_count: guestCount,
            duration,
            date, time,
            voucher_code: voucherCode.trim().toUpperCase(),
            notes,
        });
    }

    return (
        <>
            <Head title="Book a Room" />

            <section className="mx-auto min-h-[calc(100vh-81px)] w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="max-w-2xl space-y-3 border-b border-stone-800 pb-8">
                    <div className="flex items-center gap-2 text-amber-400">
                        <span>☕</span>
                        <span className="text-xs uppercase tracking-[0.35em] font-sans">Private Room Reservations</span>
                    </div>
                    <h2 className="text-4xl font-serif font-semibold tracking-tight text-stone-100">
                        Call dibs on your weekly dream hangout space
                    </h2>
                    <p className="text-stone-400 leading-relaxed">
                        A beautifully designed private room for gatherings of 3 to 12 guests. Choose your preferred duration. Rates are per person.
                    </p>
                </div>

                {flash?.success && (
                    <div className="mt-6 mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-emerald-400">
                        {flash.success}
                    </div>
                )}

                <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                        onSubmit={handleSubmit}
                        className="space-y-5 rounded-2xl border border-stone-800 bg-stone-900 p-4 sm:p-6 shadow-2xl shadow-stone-950/60"
                    >
                        <CafeField label="Full Name">
                            <CafeInput value={name} onChange={setName} placeholder="Your name" required />
                        </CafeField>
                        {errors.name && <p className="text-xs text-rose-400 -mt-4">{errors.name}</p>}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <CafeField label="Email Address">
                                <CafeInput value={email} onChange={setEmail} type="email" placeholder="you@example.com" required />
                            </CafeField>
                            <CafeField label="Phone Number">
                                <CafeInput value={phone} onChange={setPhone} type="tel" placeholder="+63 9XX XXX XXXX" required />
                            </CafeField>
                        </div>
                        {errors.email && <p className="text-xs text-rose-400">{errors.email}</p>}
                        {errors.phone && <p className="text-xs text-rose-400">{errors.phone}</p>}

                        <CafeField label="Event Date">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button type="button"
                                        className="mt-1 flex w-full items-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-left text-sm text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                    >
                                        <CalendarIcon className="size-4 shrink-0 text-stone-500" />
                                        {date ? (
                                            <span className="flex-1">{format(new Date(`${date}T12:00:00`), 'PPP')}</span>
                                        ) : (
                                            <span className="flex-1 text-stone-600">Pick a date</span>
                                        )}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto border-stone-700 bg-stone-900 p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date ? new Date(`${date}T12:00:00`) : undefined}
                                        onSelect={(d) => {
                                            if (d) {
                                                setDate(format(d, 'yyyy-MM-dd'));
                                                setTime('');
                                            }
                                        }}
                                        disabled={(d) => d < new Date(todayStr() + 'T00:00:00')}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </CafeField>
                        {errors.date && <p className="text-xs text-rose-400 -mt-4">{errors.date}</p>}

                        {fullyBooked && (
                            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                                ⚠️ This date is fully booked. Please choose another date.
                            </div>
                        )}

                        <div className="space-y-3 border-t border-stone-800 pt-5">
                            <span className="block text-sm text-stone-300 font-medium">Session Duration</span>
                            <div className="grid grid-cols-3 gap-2">
                                {roomDurations.length > 0 ? roomDurations.map((d) => (
                                    <button key={d} type="button" onClick={() => { setDuration(d); setTime(''); }}
                                        className={`rounded-xl border py-3 text-xs font-semibold transition ${duration === d ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-amber-500/30 hover:text-stone-200'}`}
                                    >
                                        {d === '1.5' ? '1.5hr' : `${d}hr`}
                                    </button>
                                )) : (
                                    <div className="col-span-3 text-stone-500 text-sm italic">No durations configured for this room.</div>
                                )}
                            </div>

                            {date && availableSlots.length > 0 && (
                                <div className="space-y-1.5">
                                    <span className="text-[11px] text-stone-500 font-medium">
                                        {availableSlots.length} available times
                                    </span>
                                    <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto pr-1">
                                        {availableSlots.map((t) => (
                                            <button key={t} type="button" onClick={() => setTime(t)}
                                                className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${time === t ? 'border-amber-400 bg-amber-400/15 text-amber-300' : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-amber-500/40 hover:text-stone-200'}`}
                                            >
                                                {formatTime(t)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {timeRange && (
                                <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 px-4 py-2.5 flex items-center justify-between">
                                    <span className="text-xs text-stone-400">Your session</span>
                                    <span className="text-sm font-semibold text-amber-300">{timeRange}</span>
                                </div>
                            )}

                            {time && date && slotCheck === false && (
                                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                                    ⚠️ This time conflicts with another booking. Try {availableSlots.length > 0 ? formatTime(availableSlots[0]) : 'another time'}.
                                </div>
                            )}

                            {errors.time && (
                                <p className="text-xs text-rose-400">{errors.time}</p>
                            )}

                            {time && date && timeToMinutes(time) > maxStartMinutes && (
                                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                                    ⚠️ Latest start time for {duration === '1.5' ? '1.5' : duration} hrs is {formatTime(maxStartTime)}.
                                </div>
                            )}

                            {isInPast && (
                                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                                    ⚠️ This time is in the past. Please select a future time.
                                </div>
                            )}

                            {date && resolvedRoomName && availableSlots.length === 0 && !fullyBooked && date === todayStr() && (
                                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                                    ⏰ No more available slots for today. Please choose another date.
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm text-stone-300 font-medium">Number of Guests</span>
                                <span className="text-xs text-stone-500">
                                    Min {selectedRoom?.min_group || 3} · Max {selectedRoom?.max_group || 12}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <button type="button" onClick={() => setGuestCount(Math.max(selectedRoom?.min_group ?? 3, guestCount - 1))}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-700 bg-stone-800 text-stone-300 transition hover:border-amber-400/50 hover:text-amber-300 text-lg font-bold"
                                >−</button>
                                <input type="range" min={selectedRoom?.min_group ?? 3} max={selectedRoom?.max_group ?? 12}
                                    value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="flex-1 min-w-0" />
                                <button type="button" onClick={() => setGuestCount(Math.min(selectedRoom?.max_group ?? 12, guestCount + 1))}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-700 bg-stone-800 text-stone-300 transition hover:border-amber-400/50 hover:text-amber-300 text-lg font-bold"
                                >+</button>
                                <div className="w-14 sm:w-16 shrink-0 rounded-xl bg-stone-800 border border-stone-700 px-2 sm:px-3 py-2 text-center text-sm font-bold text-amber-300">
                                    {guestCount}
                                </div>
                            </div>
                        </div>
                        {errors.guest_count && <p className="text-xs text-rose-400">{errors.guest_count}</p>}

                        <div className="space-y-2.5 border-t border-stone-800 pt-5">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm text-stone-300 font-medium">🎟️ Discount Voucher</span>
                                {vouchers.filter((v) => v.active).length > 0 && (
                                    <span className="text-[10px] text-amber-400 font-sans">{vouchers.filter((v) => v.active).length} active offers</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 min-w-0">
                                    <CafeInput value={voucherCode} onChange={(v) => setVoucherCode(v.toUpperCase())} placeholder="Enter code (e.g. WELCOME10)" />
                                </div>
                                <button type="button" onClick={handleApplyVoucher} disabled={!voucherCode.trim()}
                                    className="shrink-0 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-stone-950 hover:bg-amber-300 transition disabled:bg-stone-800 disabled:text-stone-600"
                                >Apply</button>
                                {appliedDiscount > 0 && (
                                    <button type="button" onClick={handleClearVoucher}
                                        className="shrink-0 rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-stone-400 hover:bg-stone-700 transition"
                                    >✕</button>
                                )}
                            </div>
                            {voucherMessage && (
                                <div className={`rounded-lg px-3 py-2 text-xs font-medium ${voucherValid ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'}`}>
                                    {voucherMessage}
                                </div>
                            )}
                        </div>

                        <CafeField label="Special Requests">
                            <CafeTextarea value={notes} onChange={setNotes} placeholder="Cake flavor, seating arrangement, dietary restrictions..." rows={3} />
                        </CafeField>

                        <ActionButton type="submit" className="w-full">Request Reservation</ActionButton>
                    </motion.form>

                    <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4 sm:p-6 shadow-2xl shadow-stone-950/60 space-y-5 self-start lg:sticky lg:top-24">
                        <div className="text-center pb-4 border-b border-stone-800">
                            <p className="text-xs uppercase tracking-[0.3em] text-amber-500/80 font-sans">Per Person Rate</p>
                            <div className="mt-1 text-5xl font-serif font-bold text-amber-400">{formatCurrency(perPerson)}</div>
                            <p className="mt-1 text-sm text-stone-400">{formatCurrency(perPerson)} × {guestCount} pax</p>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-800/80 px-4 py-1.5">
                                <span className="text-xs text-stone-400">Total</span>
                                <span className="text-base font-semibold text-stone-100">{formatCurrency(total)}</span>
                                {appliedDiscount > 0 && (
                                    <span className="text-xs text-emerald-400">
                                        −{formatCurrency(appliedDiscount)} → <strong className="text-emerald-300">{formatCurrency(finalPrice)}</strong>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2.5 text-sm">
                            <SummaryRow label="Room" value={selectedRoom?.name || '—'} />
                            <SummaryRow label="Duration" value={duration === '1.5' ? '1.5 Hours' : `${duration} Hours`} />
                            <SummaryRow label="Guests" value={`${guestCount} pax`} />
                            <SummaryRow label="Per person" value={formatCurrency(perPerson)} highlight />
                            {appliedDiscount > 0 && (
                                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 flex items-center justify-between">
                                    <span className="text-xs text-emerald-300">
                                        🎟️ Voucher <code className="font-mono font-bold">{voucherCode}</code>
                                    </span>
                                    <span className="text-sm font-bold text-emerald-300">−{formatCurrency(appliedDiscount)}</span>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-stone-700 bg-stone-950/60 p-3 text-[11px] text-stone-500 leading-relaxed">
                            ☕ Rates decrease with larger groups. Confirmed pricing is based on your final headcount on arrival.
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
