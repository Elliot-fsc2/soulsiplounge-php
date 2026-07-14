import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            printData?: {
                invoice: {
                    invoice_number: string;
                    created_at: string;
                    staff_name: string;
                    room_name: string | null;
                    guest_count: number | null;
                    subtotal: number;
                    total: number;
                    amount_tendered: number | null;
                    change: number | null;
                    payment_method: string | null;
                    items: Array<{
                        product_name: string;
                        product_price: number;
                        quantity: number;
                        subtotal: number;
                    }>;
                };
                print_kitchen_chit: boolean;
            } | null;
            [key: string]: unknown;
        };
    }
}
