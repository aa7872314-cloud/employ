'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sun, Moon, LogOut, Menu, X, User } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { APP_NAME, LABELS } from '@/lib/constants'
import type { Profile } from '@/lib/types'

interface HeaderProps {
    profile: Profile | null
    onMenuToggle?: () => void
    menuOpen?: boolean
}

export function Header({ profile, onMenuToggle, menuOpen }: HeaderProps) {
    const { theme, toggleTheme } = useTheme()
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const supabase = createClient()

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await supabase.auth.signOut()
            router.push('/login')
            router.refresh()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <header className="sticky top-0 z-40 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-full items-center justify-between px-4 md:px-6">
                {/* Right side - Logo & Menu */}
                <div className="flex items-center gap-3">
                    {onMenuToggle && (
                        <button
                            onClick={onMenuToggle}
                            className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden"
                            aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    )}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-sm">ح</span>
                        </div>
                        <span className="font-semibold text-lg hidden sm:block">{APP_NAME}</span>
                    </Link>
                </div>

                {/* Left side - User info & actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg',
                            'hover:bg-muted transition-colors text-sm'
                        )}
                        aria-label={theme === 'light' ? 'تفعيل الوضع الليلي' : 'تفعيل الوضع النهاري'}
                    >
                        {theme === 'light' ? (
                            <>
                                <Moon className="w-4 h-4" />
                                <span className="hidden sm:inline">{LABELS.DARK_MODE}</span>
                            </>
                        ) : (
                            <>
                                <Sun className="w-4 h-4" />
                                <span className="hidden sm:inline">{LABELS.LIGHT_MODE}</span>
                            </>
                        )}
                    </button>

                    {/* User info */}
                    {profile && (
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex flex-col items-end text-sm">
                                <span className="font-medium">{profile.full_name}</span>
                                <span className="text-muted-foreground text-xs">
                                    {profile.role === 'admin' ? LABELS.ADMIN : LABELS.EMPLOYEE}
                                </span>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                    )}

                    {/* Logout */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        isLoading={isLoggingOut}
                        className="gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">{LABELS.LOGOUT}</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}
