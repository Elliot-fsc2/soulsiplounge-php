import { Link, usePage } from '@inertiajs/react';
import { login } from '@/routes';
import { home } from '@/routes';
import { create as bookingCreate } from '@/routes/booking';
import { create as contactCreate } from '@/routes/contact';
import { useCurrentUrl } from '@/hooks/use-current-url';

export default function SoulSipsLayout({ children }: { children: React.ReactNode }) {
    const { auth, businessName } = usePage<{
        auth: { user: { name: string; role?: string | null } | null };
        businessName: string;
    }>().props;
    const { isCurrentUrl } = useCurrentUrl();
    const canAccessAdmin = auth?.user?.role === 'admin' || auth?.user?.role === 'staff';

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100">
            <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/95">
                <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <Link href={home()} className="text-left max-w-[180px] sm:max-w-xs truncate">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-amber-500/80 font-sans">
                            An elevated social lounge for every occasion
                        </div>
                        <div className="text-base sm:text-xl font-serif font-semibold text-stone-100 truncate">
                            {businessName || 'Soul Sips Lounge'}
                        </div>
                    </Link>
                    <nav className="flex items-center gap-3 sm:gap-5">
                        <Link href={home()}
                            className={isCurrentUrl(home())
                                ? "border-b-2 pb-0.5 px-1 py-2 text-sm font-medium tracking-wide transition border-amber-400 text-amber-400"
                                : "border-b-2 pb-0.5 px-1 py-2 text-sm font-medium tracking-wide transition border-transparent text-stone-400 hover:text-stone-200"
                            }
                        >
                            Home
                        </Link>
                        <Link href={bookingCreate()}
                            className={isCurrentUrl(bookingCreate())
                                ? "border-b-2 pb-0.5 px-1 py-2 text-sm font-medium tracking-wide transition border-amber-400 text-amber-400"
                                : "border-b-2 pb-0.5 px-1 py-2 text-sm font-medium tracking-wide transition border-transparent text-stone-400 hover:text-stone-200"
                            }
                        >
                            Reserve
                        </Link>
                        <Link href={contactCreate()}
                            className={isCurrentUrl(contactCreate())
                                ? "border-b-2 pb-0.5 px-1 py-2 text-sm font-medium tracking-wide transition border-amber-400 text-amber-400"
                                : "border-b-2 pb-0.5 px-1 py-2 text-sm font-medium tracking-wide transition border-transparent text-stone-400 hover:text-stone-200"
                            }
                        >
                            Contact
                        </Link>
                        {canAccessAdmin ? (
                            <Link href="/admin"
                                className="rounded-full bg-amber-400 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-stone-950 transition hover:bg-amber-300 shadow-md shadow-amber-500/20"
                            >
                                Admin
                            </Link>
                        ) : auth?.user ? (
                            <Link href={home()}
                                className="rounded-full border border-stone-700 bg-stone-800 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-stone-300 transition hover:bg-stone-700 shadow-md"
                            >
                                Home
                            </Link>
                        ) : (
                            <Link href={login()}
                                className="rounded-full bg-amber-400 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-stone-950 transition hover:bg-amber-300 shadow-md shadow-amber-500/20"
                            >
                                Admin
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {children}
        </div>
    );
}
