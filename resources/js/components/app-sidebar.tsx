import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    CalendarCheck,
    CreditCard,
    DoorOpen,
    FolderGit2,
    LayoutGrid,
    Mail,
    Settings,
    Ticket,
    ShoppingCart,
    Package,
    Coffee,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import admin from '@/routes/admin';
import staff from '@/routes/staff';
import { pos } from '@/routes/staff';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth?.user?.role;
    const isStaff = role === 'staff';
    const canAccessAdmin = role === 'admin' || isStaff;

    const platformNav: NavItem[] = [
        { title: 'Dashboard', href: isStaff ? staff.dashboard.url() : admin.dashboard.url(), icon: LayoutGrid },
    ];

    const adminNav: NavItem[] = [
        { title: 'POS', href: pos.url(), icon: ShoppingCart },
        { title: 'Payments', href: admin.payments.url(), icon: CreditCard },
        ...(!isStaff ? [
            { title: 'Bookings', href: admin.bookings.url(), icon: CalendarCheck },
            { title: 'Contacts', href: admin.contacts.url(), icon: Mail },
            { title: 'Rooms', href: admin.rooms.url(), icon: DoorOpen },
            { title: 'Vouchers', href: admin.vouchers.url(), icon: Ticket },
            { title: 'Inventory', href: admin.inventory.url(), icon: Package },
            { title: 'Products', href: admin.products.url(), icon: Coffee },
            { title: 'Analytics', href: admin.analytics.url(), icon: BarChart3 },
            { title: 'Settings', href: admin.settings.url(), icon: Settings },
        ] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset"
            className="border-stone-800 bg-stone-950/95 text-stone-100">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={isStaff ? staff.dashboard.url() : admin.dashboard.url()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={platformNav} label="Platform" />
                {canAccessAdmin && <NavMain items={adminNav} label="Admin" />}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
