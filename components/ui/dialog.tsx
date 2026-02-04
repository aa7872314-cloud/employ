'use client'

import { Fragment, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from './button'

interface DialogProps {
    open: boolean
    onClose: () => void
    children: ReactNode
}

export function Dialog({ open, onClose, children }: DialogProps) {
    if (!open) return null

    return (
        <Fragment>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />
            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className={cn(
                        'w-full max-w-md bg-card rounded-xl shadow-lg',
                        'animate-slide-up',
                        'max-h-[90vh] overflow-y-auto'
                    )}
                    onClick={e => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                >
                    {children}
                </div>
            </div>
        </Fragment>
    )
}

interface DialogHeaderProps {
    children: ReactNode
    onClose?: () => void
}

export function DialogHeader({ children, onClose }: DialogHeaderProps) {
    return (
        <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold">{children}</h2>
            {onClose && (
                <button
                    onClick={onClose}
                    className="p-1 rounded-md hover:bg-muted transition-colors"
                    aria-label="إغلاق"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    )
}

export function DialogContent({ children }: { children: ReactNode }) {
    return <div className="p-6">{children}</div>
}

export function DialogFooter({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center justify-end gap-3 p-6 pt-0">
            {children}
        </div>
    )
}

// Confirmation Dialog
interface ConfirmDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'destructive' | 'primary'
    isLoading?: boolean
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    variant = 'destructive',
    isLoading = false,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogHeader onClose={onClose}>{title}</DialogHeader>
            <DialogContent>
                <p className="text-muted-foreground">{message}</p>
            </DialogContent>
            <DialogFooter>
                <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                    {cancelText}
                </Button>
                <Button
                    variant={variant}
                    onClick={onConfirm}
                    isLoading={isLoading}
                >
                    {confirmText}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
