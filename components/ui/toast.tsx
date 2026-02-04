'use client'

import { ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastProps {
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
    onClose: () => void
}

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
}

const styles = {
    success: 'bg-success/10 border-success text-success',
    error: 'bg-destructive/10 border-destructive text-destructive',
    warning: 'bg-warning/10 border-warning text-warning',
    info: 'bg-primary/10 border-primary text-primary',
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
    const Icon = icons[type]

    return (
        <div
            className={cn(
                'flex items-center gap-3 p-4 rounded-lg border-2 shadow-lg',
                'animate-slide-up',
                styles[type]
            )}
            role="alert"
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium text-foreground">{message}</p>
            <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-muted transition-colors"
                aria-label="إغلاق"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

export function ToastContainer({ children }: { children: ReactNode }) {
    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 flex flex-col gap-2">
            {children}
        </div>
    )
}
