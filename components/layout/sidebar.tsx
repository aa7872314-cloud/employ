'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    FileText,
    BarChart3,
    Download,
    History
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES, LABELS } from '@/lib/constants'
import type { Profile } from '@/lib/types'

interface SidebarProps {
    profile: Profile | null
    open?: boolean
    onClose?: () => void
}

interface NavItem {
    href: string
    label: string
    icon: React.ElementType
}

const employeeNav: NavItem[] = [
    { href: ROUTES.EMPLOYEE_DASHBOARD, label: LABELS.DAILY_REPORT, icon: FileText },
    { href: ROUTES.EMPLOYEE_HISTORY, label: LABELS.HISTORY, icon: History },
]

const adminNav: NavItem[] = [
    { href: ROUTES.ADMIN_DASHBOARD, label: LABELS.DASHBOARD, icon: LayoutDashboard },
    { href: ROUTES.ADMIN_EMPLOYEES, label: LABELS.EMPLOYEES, icon: Users },
    { href: ROUTES.ADMIN_REPORTS, label: LABELS.REPORTS, icon: FileText },
    { href: ROUTES.ADMIN_ANALYTICS, label: LABELS.ANALYTICS, icon: BarChart3 },
    { href: ROUTES.ADMIN_EXPORTS, label: LABELS.EXPORTS, icon: Download },
]

export function Sidebar({ profile, open = true, onClose }: SidebarProps) {
    const pathname = usePathname()
    const isAdmin = profile?.role === 'admin'
    const navItems = isAdmin ? adminNav : employeeNav

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-16 right-0 z-30 h-[calc(100vh-4rem)] w-64 bg-card border-l border-border',
                    'transition-transform duration-300 ease-in-out',
                    'md:translate-x-0',
                    open ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <nav className="flex flex-col gap-1 p-4">
                    {navItems.map(item => {
                        const Icon = item.icon
                        const isActive = pathname === item.href ||
                            (item.href !== ROUTES.ADMIN_DASHBOARD &&
                                item.href !== ROUTES.EMPLOYEE_DASHBOARD &&
                                pathname.startsWith(item.href))

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium',
                                    'transition-colors duration-200',
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-soft'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </aside>
        </>
    )
}
