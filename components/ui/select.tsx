'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
    value: string | number | boolean
    label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
    options: SelectOption[]
    value?: string | number
    onChange?: (value: string) => void
    placeholder?: string
    error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, options, value, onChange, placeholder, error, ...props }, ref) => {
        return (
            <div className="relative w-full">
                <select
                    ref={ref}
                    value={value ?? ''}
                    onChange={e => onChange?.(e.target.value)}
                    className={cn(
                        'flex h-10 w-full appearance-none rounded-lg border bg-card px-4 py-2 pr-10 text-base',
                        'transition-colors duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        error
                            ? 'border-destructive focus-visible:ring-destructive'
                            : 'border-input hover:border-muted-foreground/50',
                        !value && 'text-muted-foreground',
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map(option => (
                        <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                {error && (
                    <p className="mt-1.5 text-sm text-destructive">{error}</p>
                )}
            </div>
        )
    }
)

Select.displayName = 'Select'

export { Select }
