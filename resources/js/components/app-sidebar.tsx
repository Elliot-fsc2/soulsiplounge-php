import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarCheck,
    CreditCard,
    DoorOpen,
    FolderGit2,
    LayoutGrid,
    Mail,
    Settings,
    ShoppingCart,
    Ticket,
    Package,
    Coffee,
    TrendingUp,
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
        ...(canAccessAdmin ? [{ title: 'POS', href: staff.pos.url(), icon: ShoppingCart }] : []),
        ...(!isStaff ? [{ title: 'Sales Report', href: admin.salesReport.url(), icon: TrendingUp }] : []),
    ];

    const adminNav: NavItem[] = [
        { title: 'Payments', href: admin.payments.url(), icon: CreditCard },
        ...(!isStaff ? [
            { title: 'Bookings', href: admin.bookings.url(), icon: CalendarCheck },
            { title: 'Contacts', href: admin.contacts.url(), icon: Mail },
            { title: 'Rooms', href: admin.rooms.url(), icon: DoorOpen },
            { title: 'Vouchers', href: admin.vouchers.url(), icon: Ticket },
            { title: 'Inventory', href: admin.inventory.url(), icon: Package },
            { title: 'Products', href: admin.products.url(), icon: Coffee },
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
