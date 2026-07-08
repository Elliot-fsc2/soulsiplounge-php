import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <AppLogoIcon className="size-8 shrink-0" />
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-amber-100">
                    Soul Sips
                </span>
                <span className="truncate text-[10px] uppercase tracking-[0.2em] text-amber-500/70 font-sans">
                    Lounge
                </span>
            </div>
        </>
    );
}
