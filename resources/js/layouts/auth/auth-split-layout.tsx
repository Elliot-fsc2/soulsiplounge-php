import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { businessName } = usePage<{ businessName: string }>().props;

    return (
        <div className="relative grid min-h-dvh flex-col items-center justify-center px-4 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full min-h-dvh flex-col justify-between overflow-hidden lg:flex">
                <div className="absolute inset-0">
                    <img
                        src="/images/room1.jpg"
                        alt=""
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-stone-950/30" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.15),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(120,53,15,0.2),transparent_40%)]" />
                </div>

                <div className="relative z-10 flex flex-col justify-between p-10 min-h-dvh">
                    <Link href={home()} className="flex items-center gap-3">
                        <AppLogoIcon className="size-10" />
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-400/80 font-sans">
                                An elevated social lounge for every occasion
                            </div>
                            <div className="text-xl font-serif font-semibold text-stone-100">
                                {businessName || 'Soul Sips Lounge'}
                            </div>
                        </div>
                    </Link>

                    <div className="max-w-sm">
                        <p className="text-lg leading-relaxed text-stone-300 italic font-serif">
                            "Sip. Gather. Celebrate. Your private haven awaits."
                        </p>
                    </div>

                    <div className="text-xs text-stone-500">
                        © {new Date().getFullYear()} {businessName || 'Soul Sips Lounge'}
                    </div>
                </div>
            </div>

            <div className="flex w-full items-center justify-center py-12 lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
                    <Link
                        href={home()}
                        className="flex items-center justify-center gap-2 lg:hidden"
                    >
                        <AppLogoIcon className="size-8" />
                        <div className="text-base font-serif font-semibold text-stone-100">
                            {businessName || 'Soul Sips Lounge'}
                        </div>
                    </Link>

                    <div className="flex flex-col items-start gap-2 sm:items-center sm:text-center">
                        <h1 className="text-2xl font-serif font-bold text-stone-100">{title}</h1>
                        <p className="text-sm text-stone-400">{description}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
