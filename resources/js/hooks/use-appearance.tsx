export type ResolvedAppearance = 'dark';

export function initializeTheme(): void {
    if (typeof document === 'undefined') {
        return;
    }

    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
}

export function useAppearance(): {
    readonly appearance: 'dark';
    readonly resolvedAppearance: 'dark';
} {
    return { appearance: 'dark', resolvedAppearance: 'dark' } as const;
}
