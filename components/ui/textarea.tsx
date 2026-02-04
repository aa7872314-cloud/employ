import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <textarea
                    ref={ref}
                    className={cn(
                        'flex min-h-[100px] w-full rounded-lg border bg-card px-4 py-3 text-base',
                        'transition-colors duration-200 resize-none',
                        'placeholder:text-muted-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        error
                            ? 'border-destructive focus-visible:ring-destructive'
                            : 'border-input hover:border-muted-foreground/50',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-destructive">{error}</p>
                )}
            </div>
        )
    }
)

Textarea.displayName = 'Textarea'

export { Textarea }
