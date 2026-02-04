'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonTable } from '@/components/ui/skeleton'
import { getMyReports } from '@/app/actions/reports'
import { formatDate, formatDateForInput, cn } from '@/lib/utils'
import { LABELS } from '@/lib/constants'
import type { DailyReport } from '@/lib/types'
import { History, Calendar, Filter, Palmtree, FileText } from 'lucide-react'
import Link from 'next/link'

export default function EmployeeHistoryPage() {
    const [reports, setReports] = useState<DailyReport[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Set default date range (last 30 days)
    useEffect(() => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 30)

        setEndDate(formatDateForInput(end))
        setStartDate(formatDateForInput(start))
    }, [])

    // Fetch reports
    useEffect(() => {
        async function fetchReports() {
            if (!startDate || !endDate) return

            setIsLoading(true)
            try {
                const data = await getMyReports(startDate, endDate)
                setReports(data)
            } catch (error) {
                console.error('Fetch error:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchReports()
    }, [startDate, endDate])

    // Calculate totals
    const totals = reports.reduce(
        (acc, report) => ({
            printing: acc.printing + report.printing_pages,
            typesetting: acc.typesetting + report.typesetting_pages,
            editing: acc.editing + report.editing_pages,
            workdays: acc.workdays + (report.is_leave ? 0 : 1),
            leaves: acc.leaves + (report.is_leave ? 1 : 0),
        }),
        { printing: 0, typesetting: 0, editing: 0, workdays: 0, leaves: 0 }
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History className="w-6 h-6 text-primary" />
                        {LABELS.HISTORY}
                    </h1>
                    <p className="text-muted-foreground">عرض سجل التقارير السابقة</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        {LABELS.FILTER}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">{LABELS.START_DATE}</label>
                            <DatePicker
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">{LABELS.END_DATE}</label>
                            <DatePicker
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            {!isLoading && reports.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="p-4">
                        <p className="text-sm text-muted-foreground">{LABELS.PRINTING_PAGES}</p>
                        <p className="text-2xl font-bold text-primary">{totals.printing}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-muted-foreground">{LABELS.TYPESETTING_PAGES}</p>
                        <p className="text-2xl font-bold text-primary">{totals.typesetting}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-muted-foreground">{LABELS.EDITING_PAGES}</p>
                        <p className="text-2xl font-bold text-primary">{totals.editing}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-muted-foreground">{LABELS.WORKDAYS}</p>
                        <p className="text-2xl font-bold">{totals.workdays}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-muted-foreground">{LABELS.LEAVE_DAYS}</p>
                        <p className="text-2xl font-bold">{totals.leaves}</p>
                    </Card>
                </div>
            )}

            {/* Reports Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        التقارير
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <SkeletonTable rows={5} />
                    ) : reports.length === 0 ? (
                        <EmptyState
                            icon={<FileText className="w-8 h-8 text-muted-foreground" />}
                            title={LABELS.NO_DATA}
                            description="لا توجد تقارير في الفترة المحددة"
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                            التاريخ
                                        </th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                            الحالة
                                        </th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                            الكتاب
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                                            طباعة
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                                            تنضيد
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                                            تحرير
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                                            الإجمالي
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                                            إجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(report => (
                                        <tr
                                            key={report.id}
                                            className={cn(
                                                'border-b border-border/50 hover:bg-muted/30 transition-colors',
                                                report.is_leave && 'bg-warning/5'
                                            )}
                                        >
                                            <td className="py-3 px-4">
                                                {formatDate(report.report_date)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {report.is_leave ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-warning/10 text-warning text-sm">
                                                        <Palmtree className="w-3 h-3" />
                                                        إجازة
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-sm">
                                                        عمل
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {report.book_title || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {report.printing_pages}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {report.typesetting_pages}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {report.editing_pages}
                                            </td>
                                            <td className="py-3 px-4 text-center font-medium">
                                                {report.printing_pages + report.typesetting_pages + report.editing_pages}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Link href={`/employee?date=${report.report_date}`}>
                                                    <Button variant="ghost" size="sm">
                                                        {LABELS.EDIT}
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
