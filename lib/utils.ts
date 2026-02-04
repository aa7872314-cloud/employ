import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Format date in Arabic
export function formatDate(date: string | Date, formatStr: string = 'dd MMMM yyyy'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: ar })
}

// Format date for input fields (YYYY-MM-DD)
export function formatDateForInput(date: Date): string {
    return format(date, 'yyyy-MM-dd')
}

// Get today's date in Baghdad timezone
export function getTodayInBaghdad(): string {
    const now = new Date()
    const baghdadOffset = 3 * 60 // UTC+3
    const localOffset = now.getTimezoneOffset()
    const baghdadTime = new Date(now.getTime() + (baghdadOffset + localOffset) * 60 * 1000)
    return formatDateForInput(baghdadTime)
}

// Parse number safely
export function parseNumber(value: string | number): number {
    const num = typeof value === 'string' ? parseInt(value, 10) : value
    return isNaN(num) ? 0 : Math.max(0, num)
}

// Generate week number (ISO)
export function getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Get month/year string
export function getMonthYear(date: Date): string {
    return format(date, 'MMMM yyyy', { locale: ar })
}

// Delay function for loading states
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}
