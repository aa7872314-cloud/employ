'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { useToast } from '@/components/providers/toast-provider'
import { generateWeeklyReport, exportToExcel, exportToPDF } from '@/app/actions/exports'
import { formatDateForInput } from '@/lib/utils'
import { LABELS } from '@/lib/constants'
import type { EmployeeSummary } from '@/lib/types'
import { Download, FileSpreadsheet, FileText, CalendarRange, Loader2 } from 'lucide-react'

export default function AdminExportsPage() {
    const { showToast } = useToast()
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [isExportingExcel, setIsExportingExcel] = useState(false)
    const [isExportingPDF, setIsExportingPDF] = useState(false)
    const [summaries, setSummaries] = useState<EmployeeSummary[]>([])

    // Set default date range (this week)
    useEffect(() => {
        const now = new Date()
        const dayOfWeek = now.getDay()
        const start = new Date(now)
        start.setDate(now.getDate() - dayOfWeek)
        const end = new Date(start)
        end.setDate(start.getDate() + 6)

        setStartDate(formatDateForInput(start))
        setEndDate(formatDateForInput(end))
    }, [])

    const loadData = async () => {
        if (!startDate || !endDate) return

        setIsLoadingData(true)
        try {
            const result = await generateWeeklyReport(startDate, endDate)
            setSummaries(result.summaries)
            showToast('تم تحميل البيانات', 'success')
        } catch (error) {
            console.error('Load error:', error)
            showToast(LABELS.ERROR_OCCURRED, 'error')
        } finally {
            setIsLoadingData(false)
        }
    }

    const handleExportExcel = async () => {
        if (summaries.length === 0) {
            showToast('يرجى تحميل البيانات أولاً', 'warning')
            return
        }

        setIsExportingExcel(true)
        try {
            const result = await exportToExcel(
                summaries,
                'تقرير الأداء',
                { start: startDate, end: endDate }
            )

            if (result.success && result.data) {
                // Download the file
                const blob = new Blob(
                    [Uint8Array.from(atob(result.data), c => c.charCodeAt(0))],
                    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
                )
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `تقرير_${startDate}_${endDate}.xlsx`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)

                showToast('تم تصدير Excel بنجاح', 'success')
            } else {
                showToast(result.error || LABELS.ERROR_OCCURRED, 'error')
            }
        } catch (error) {
            console.error('Excel export error:', error)
            showToast(LABELS.ERROR_OCCURRED, 'error')
        } finally {
            setIsExportingExcel(false)
        }
    }

    const handleExportPDF = async () => {
        if (summaries.length === 0) {
            showToast('يرجى تحميل البيانات أولاً', 'warning')
            return
        }

        setIsExportingPDF(true)
        try {
            const result = await exportToPDF(
                summaries,
                'Performance Report',
                { start: startDate, end: endDate }
            )

            if (result.success && result.data) {
                // Download the file
                const blob = new Blob(
                    [Uint8Array.from(atob(result.data), c => c.charCodeAt(0))],
                    { type: 'application/pdf' }
                )
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `report_${startDate}_${endDate}.pdf`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)

                showToast('تم تصدير PDF بنجاح', 'success')
            } else {
                showToast(result.error || LABELS.ERROR_OCCURRED, 'error')
            }
        } catch (error) {
            console.error('PDF export error:', error)
            showToast(LABELS.ERROR_OCCURRED, 'error')
        } finally {
            setIsExportingPDF(false)
        }
    }

    // Quick date presets
    const setThisWeek = () => {
        const now = new Date()
        const dayOfWeek = now.getDay()
        const start = new Date(now)
        start.setDate(now.getDate() - dayOfWeek)
        const end = new Date(start)
        end.setDate(start.getDate() + 6)

        setStartDate(formatDateForInput(start))
        setEndDate(formatDateForInput(end))
    }

    const setThisMonth = () => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        setStartDate(formatDateForInput(start))
        setEndDate(formatDateForInput(end))
    }

    const setLastMonth = () => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const end = new Date(now.getFullYear(), now.getMonth(), 0)

        setStartDate(formatDateForInput(start))
        setEndDate(formatDateForInput(end))
    }

    // Calculate totals
    const totals = summaries.reduce(
        (acc, s) => ({
            printing: acc.printing + s.total_printing_pages,
            typesetting: acc.typesetting + s.total_typesetting_pages,
            editing: acc.editing + s.total_editing_pages,
            workdays: acc.workdays + s.total_workdays,
            leaves: acc.leaves + s.total_leave_days,
        }),
        { printing: 0, typesetting: 0, editing: 0, workdays: 0, leaves: 0 }
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Download className="w-6 h-6 text-primary" />
                    {LABELS.EXPORTS}
                </h1>
                <p className="text-muted-foreground">تصدير تقارير الأداء</p>
            </div>

            {/* Date Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarRange className="w-5 h-5" />
                        تحديد الفترة
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={setThisWeek}>
                            {LABELS.THIS_WEEK}
                        </Button>
                        <Button variant="outline" size="sm" onClick={setThisMonth}>
                            {LABELS.THIS_MONTH}
                        </Button>
                        <Button variant="outline" size="sm" onClick={setLastMonth}>
                            {LABELS.LAST_MONTH}
                        </Button>
                    </div>

                    {/* Date Pickers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{LABELS.START_DATE}</label>
                            <DatePicker
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{LABELS.END_DATE}</label>
                            <DatePicker
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Load Data Button */}
                    <Button
                        onClick={loadData}
                        className="w-full md:w-auto"
                        isLoading={isLoadingData}
                    >
                        تحميل البيانات
                    </Button>
                </CardContent>
            </Card>

            {/* Preview */}
            {summaries.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>معاينة البيانات ({summaries.length} موظف)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">{LABELS.PRINTING_PAGES}</p>
                                <p className="text-xl font-bold text-primary">{totals.printing}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">{LABELS.TYPESETTING_PAGES}</p>
                                <p className="text-xl font-bold text-primary">{totals.typesetting}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">{LABELS.EDITING_PAGES}</p>
                                <p className="text-xl font-bold text-primary">{totals.editing}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">{LABELS.WORKDAYS}</p>
                                <p className="text-xl font-bold">{totals.workdays}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">{LABELS.LEAVE_DAYS}</p>
                                <p className="text-xl font-bold">{totals.leaves}</p>
                            </div>
                        </div>

                        {/* Table Preview */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">الموظف</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">طباعة</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">تنضيد</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">تحرير</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">الإجمالي</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">عمل</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">إجازة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summaries.map(summary => (
                                        <tr key={summary.employee_id} className="border-b border-border/50">
                                            <td className="py-3 px-4 font-medium">{summary.full_name}</td>
                                            <td className="py-3 px-4 text-center">{summary.total_printing_pages}</td>
                                            <td className="py-3 px-4 text-center">{summary.total_typesetting_pages}</td>
                                            <td className="py-3 px-4 text-center">{summary.total_editing_pages}</td>
                                            <td className="py-3 px-4 text-center font-bold text-primary">
                                                {summary.total_printing_pages + summary.total_typesetting_pages + summary.total_editing_pages}
                                            </td>
                                            <td className="py-3 px-4 text-center">{summary.total_workdays}</td>
                                            <td className="py-3 px-4 text-center">{summary.total_leave_days}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Export Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle>تصدير التقرير</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-24 flex-col gap-2"
                            onClick={handleExportExcel}
                            disabled={summaries.length === 0 || isExportingExcel}
                        >
                            {isExportingExcel ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                            ) : (
                                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                            )}
                            <span>{LABELS.EXPORT_EXCEL}</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="h-24 flex-col gap-2"
                            onClick={handleExportPDF}
                            disabled={summaries.length === 0 || isExportingPDF}
                        >
                            {isExportingPDF ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                            ) : (
                                <FileText className="w-8 h-8 text-red-600" />
                            )}
                            <span>{LABELS.EXPORT_PDF}</span>
                        </Button>
                    </div>

                    {summaries.length === 0 && (
                        <p className="text-center text-muted-foreground mt-4">
                            يرجى تحميل البيانات أولاً قبل التصدير
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
