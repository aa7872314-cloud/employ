'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/ui/date-picker'
import { useToast } from '@/components/providers/toast-provider'
import { upsertDailyReport, getTodayReport } from '@/app/actions/reports'
import { getTodayInBaghdad, parseNumber } from '@/lib/utils'
import { LABELS } from '@/lib/constants'
import type { DailyReportFormData, DailyReport } from '@/lib/types'
import { Save, Calendar, BookOpen, Printer, Type, Edit3, MessageSquare, Palmtree } from 'lucide-react'

export function DailyReportForm() {
    const { showToast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [existingReport, setExistingReport] = useState<DailyReport | null>(null)

    const [formData, setFormData] = useState<DailyReportFormData>({
        report_date: getTodayInBaghdad(),
        book_title: '',
        printing_pages: 0,
        typesetting_pages: 0,
        editing_pages: 0,
        notes: '',
        is_leave: false,
    })

    // Fetch existing report for selected date
    useEffect(() => {
        async function fetchReport() {
            setIsFetching(true)
            try {
                const report = await getTodayReport(formData.report_date)
                if (report) {
                    setExistingReport(report)
                    setFormData({
                        report_date: report.report_date,
                        book_title: report.book_title || '',
                        printing_pages: report.printing_pages,
                        typesetting_pages: report.typesetting_pages,
                        editing_pages: report.editing_pages,
                        notes: report.notes || '',
                        is_leave: report.is_leave,
                    })
                } else {
                    setExistingReport(null)
                    // Reset form but keep the date
                    setFormData(prev => ({
                        ...prev,
                        book_title: '',
                        printing_pages: 0,
                        typesetting_pages: 0,
                        editing_pages: 0,
                        notes: '',
                        is_leave: false,
                    }))
                }
            } catch (error) {
                console.error('Fetch error:', error)
            } finally {
                setIsFetching(false)
            }
        }

        fetchReport()
    }, [formData.report_date])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await upsertDailyReport(formData)

            if (result.success) {
                showToast(LABELS.SUCCESS_SAVED, 'success')
                // Refresh to show updated data
                const report = await getTodayReport(formData.report_date)
                if (report) {
                    setExistingReport(report)
                }
            } else {
                showToast(result.error || LABELS.ERROR_OCCURRED, 'error')
            }
        } catch (error) {
            console.error('Submit error:', error)
            showToast(LABELS.ERROR_OCCURRED, 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (field: keyof DailyReportFormData, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const totalPages = formData.printing_pages + formData.typesetting_pages + formData.editing_pages

    return (
        <Card className="animate-slide-up">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {LABELS.DAILY_REPORT}
                    {existingReport && (
                        <span className="text-sm font-normal text-muted-foreground mr-2">
                            (تم الحفظ مسبقاً)
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Date Picker */}
                    <div className="space-y-2">
                        <Label htmlFor="report_date" required>
                            {LABELS.REPORT_DATE}
                        </Label>
                        <DatePicker
                            id="report_date"
                            value={formData.report_date}
                            onChange={e => handleChange('report_date', e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Leave Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-3">
                            <Palmtree className="w-5 h-5 text-primary" />
                            <div>
                                <p className="font-medium">{LABELS.IS_LEAVE}</p>
                                <p className="text-sm text-muted-foreground">
                                    تفعيل هذا الخيار سيعطل حقول الصفحات
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={formData.is_leave}
                            onChange={checked => handleChange('is_leave', checked)}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Book Title */}
                    <div className="space-y-2">
                        <Label htmlFor="book_title">
                            <BookOpen className="w-4 h-4 inline ml-1" />
                            {LABELS.BOOK_TITLE}
                        </Label>
                        <Input
                            id="book_title"
                            value={formData.book_title}
                            onChange={e => handleChange('book_title', e.target.value)}
                            placeholder="أدخل عنوان الكتاب"
                            disabled={isLoading || formData.is_leave}
                        />
                    </div>

                    {/* Page Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Printing Pages */}
                        <div className="space-y-2">
                            <Label htmlFor="printing_pages">
                                <Printer className="w-4 h-4 inline ml-1" />
                                {LABELS.PRINTING_PAGES}
                            </Label>
                            <Input
                                id="printing_pages"
                                type="number"
                                min="0"
                                value={formData.printing_pages}
                                onChange={e => handleChange('printing_pages', parseNumber(e.target.value))}
                                disabled={isLoading || formData.is_leave}
                            />
                        </div>

                        {/* Typesetting Pages */}
                        <div className="space-y-2">
                            <Label htmlFor="typesetting_pages">
                                <Type className="w-4 h-4 inline ml-1" />
                                {LABELS.TYPESETTING_PAGES}
                            </Label>
                            <Input
                                id="typesetting_pages"
                                type="number"
                                min="0"
                                value={formData.typesetting_pages}
                                onChange={e => handleChange('typesetting_pages', parseNumber(e.target.value))}
                                disabled={isLoading || formData.is_leave}
                            />
                        </div>

                        {/* Editing Pages */}
                        <div className="space-y-2">
                            <Label htmlFor="editing_pages">
                                <Edit3 className="w-4 h-4 inline ml-1" />
                                {LABELS.EDITING_PAGES}
                            </Label>
                            <Input
                                id="editing_pages"
                                type="number"
                                min="0"
                                value={formData.editing_pages}
                                onChange={e => handleChange('editing_pages', parseNumber(e.target.value))}
                                disabled={isLoading || formData.is_leave}
                            />
                        </div>
                    </div>

                    {/* Total */}
                    {!formData.is_leave && (
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{LABELS.TOTAL_PAGES}</span>
                                <span className="text-2xl font-bold text-primary">{totalPages}</span>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">
                            <MessageSquare className="w-4 h-4 inline ml-1" />
                            {LABELS.NOTES}
                        </Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={e => handleChange('notes', e.target.value)}
                            placeholder="أي ملاحظات إضافية..."
                            disabled={isLoading}
                            rows={3}
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading}
                        disabled={isFetching}
                    >
                        <Save className="w-4 h-4" />
                        {existingReport ? 'تحديث التقرير' : LABELS.SAVE}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
