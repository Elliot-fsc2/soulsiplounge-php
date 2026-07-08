import { Head, Link, usePage, router } from '@inertiajs/react';
import { create as bookingCreate } from '@/routes/booking';
import { create as contactCreate } from '@/routes/contact';
import { motion } from 'framer-motion';
import { ActionButton } from '@/components/soul-sips-ui';

export default function Welcome() {
    const { businessName } = usePage<{ businessName: string }>().props;

    return (
        <>
            <Head title="Soul Sips Lounge" />

            <section className="relative min-h-[calc(100vh-81px)] overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/room1.jpg"
                        alt="Cozy café interior" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/75 to-stone-950/20" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(120,53,15,0.18),transparent_35%)]" />
                </div>
                <div className="relative mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-7xl items-end px-4 py-14 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-amber-400 text-lg">☕</span>
                            <span className="text-xs uppercase tracking-[0.35em] text-amber-400/90 font-sans">
                                An elevated social lounge for every occasion
                            </span>
                        </div>
                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-semibold tracking-tight text-stone-100 break-words">
                            {businessName || 'Soul Sips Lounge'}
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-8 text-stone-300 sm:text-xl">
                            Sip. Gather. Celebrate. Your private haven awaits.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <ActionButton onClick={() => router.visit(bookingCreate())}>
                                Reserve a Room
                            </ActionButton>
                            <ActionButton variant="ghost" onClick={() => router.visit(contactCreate())}>
                                Get in Touch
                            </ActionButton>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
