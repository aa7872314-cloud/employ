'use client'

import { useState, ReactNode } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import type { Profile } from '@/lib/types'

interface DashboardLayoutProps {
    children: ReactNode
    profile: Profile | null
}

export function DashboardLayout({ children, profile }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background">
            <Header
                profile={profile}
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                menuOpen={sidebarOpen}
            />
            <Sidebar
                profile={profile}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <main className="md:mr-64 min-h-[calc(100vh-4rem)]">
                <div className="p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
