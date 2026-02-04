'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    checked?: boolean
    onChange?: (checked: boolean) => void
    label?: string
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked = false, onChange, label, disabled, id, ...props }, ref) => {
        const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`

        return (
            <label
                htmlFor={switchId}
                className={cn(
                    'inline-flex items-center gap-3 cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-50',
                    className
                )}
            >
                <div className="relative">
                    <input
                        ref={ref}
                        id={switchId}
                        type="checkbox"
                        checked={checked}
                        onChange={e => onChange?.(e.target.checked)}
                        disabled={disabled}
                        className="sr-only peer"
                        {...props}
                    />
                    <div
                        className={cn(
                            'w-11 h-6 rounded-full transition-colors duration-200',
                            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2',
                            checked ? 'bg-primary' : 'bg-muted'
                        )}
                    />
                    <div
                        className={cn(
                            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                            checked ? 'left-0.5 translate-x-0' : 'right-0.5 translate-x-0'
                        )}
                    />
                </div>
                {label && (
                    <span className="text-sm font-medium">{label}</span>
                )}
            </label>
        )
    }
)

Switch.displayName = 'Switch'

export { Switch }
