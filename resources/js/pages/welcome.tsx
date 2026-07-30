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
                    <img src="/images/room1.jpg" loading="lazy"
                        alt="Cozy café interior" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/20 sm:bg-gradient-to-r sm:from-stone-950 sm:via-stone-950/75 sm:to-stone-950/20" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(120,53,15,0.18),transparent_35%)]" />
                </div>
                <div className="relative mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-7xl items-end px-4 pb-16 pt-14 sm:px-6 sm:pb-14 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl text-center sm:text-left">
                        <div className="mb-4 flex items-center justify-center gap-2 sm:justify-start">
                            <span className="text-amber-400 text-lg">☕</span>
                            <span className="text-xs uppercase tracking-[0.35em] text-amber-400/90 font-sans">
                                An elevated social lounge for every occasion
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-7xl lg:text-8xl font-serif font-semibold tracking-tight text-stone-100 break-words">
                            {businessName || 'Soul Sips Lounge'}
                        </h1>
                        <p className="mt-4 max-w-xl text-base leading-7 text-stone-300 sm:mt-5 sm:text-lg sm:leading-8">
                            Sip. Gather. Celebrate. Your private haven awaits.
                        </p>
                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 backdrop-blur-sm">
                            <span className="text-amber-300 text-lg">🍸</span>
                            <span className="text-sm font-semibold tracking-wider text-amber-300 uppercase font-sans">
                                Free drinks included with your stay
                            </span>
                        </div>
                        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                            <ActionButton className="w-full sm:w-auto" onClick={() => router.visit(bookingCreate())}>
                                Reserve a Room
                            </ActionButton>
                            <ActionButton variant="ghost" className="w-full sm:w-auto" onClick={() => router.visit(contactCreate())}>
                                Get in Touch
                            </ActionButton>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
