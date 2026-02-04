'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Calendar } from 'lucide-react'

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    error?: string
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="relative w-full">
                <input
                    type="date"
                    ref={ref}
                    className={cn(
                        'flex h-10 w-full rounded-lg border bg-card px-4 py-2 pr-10 text-base',
                        'transition-colors duration-200',
                        '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        error
                            ? 'border-destructive focus-visible:ring-destructive'
                            : 'border-input hover:border-muted-foreground/50',
                        className
                    )}
                    {...props}
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                {error && (
                    <p className="mt-1.5 text-sm text-destructive">{error}</p>
                )}
            </div>
        )
    }
)

DatePicker.displayName = 'DatePicker'

export { DatePicker }
