'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonTable } from '@/components/ui/skeleton'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/providers/toast-provider'
import { getAllReports, adminUpdateReport } from '@/app/actions/reports'
import { getEmployees } from '@/app/actions/employees'
import { formatDate, formatDateForInput, parseNumber, cn } from '@/lib/utils'
import { LABELS } from '@/lib/constants'
import type { DailyReportWithEmployee, Profile } from '@/lib/types'
import { FileText, Filter, Edit, Palmtree, Save } from 'lucide-react'

export default function AdminReportsPage() {
    const { showToast } = useToast()
    const [reports, setReports] = useState<DailyReportWithEmployee[]>([])
    const [employees, setEmployees] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState('')

    // Edit modal state
    const [editModal, setEditModal] = useState<{
        open: boolean
        report: DailyReportWithEmployee | null
    }>({ open: false, report: null })
    const [editData, setEditData] = useState({
        book_title: '',
        printing_pages: 0,
        typesetting_pages: 0,
        editing_pages: 0,
        notes: '',
        is_leave: false,
    })
    const [isSaving, setIsSaving] = useState(false)

    // Set default date range
    useEffect(() => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 30)

        setEndDate(formatDateForInput(end))
        setStartDate(formatDateForInput(start))
    }, [])

    // Fetch employees
    useEffect(() => {
        async function fetchEmployees() {
            const data = await getEmployees()
            setEmployees(data.filter(e => e.role === 'employee'))
        }
        fetchEmployees()
    }, [])

    // Fetch reports
    useEffect(() => {
        async function fetchReports() {
            if (!startDate || !endDate) return

            setIsLoading(true)
            try {
                const data = await getAllReports(selectedEmployee || undefined, startDate, endDate)
                setReports(data)
            } catch (error) {
                console.error('Fetch error:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchReports()
    }, [startDate, endDate, selectedEmployee])

    const openEditModal = (report: DailyReportWithEmployee) => {
        setEditData({
            book_title: report.book_title || '',
            printing_pages: report.printing_pages,
            typesetting_pages: report.typesetting_pages,
            editing_pages: report.editing_pages,
            notes: report.notes || '',
            is_leave: report.is_leave,
        })
        setEditModal({ open: true, report })
    }

    const handleSaveEdit = async () => {
        if (!editModal.report) return

        setIsSaving(true)
        try {
            const result = await adminUpdateReport(editModal.report.id, editData)

            if (result.success) {
                showToast(LABELS.SUCCESS_SAVED, 'success')
                setEditModal({ open: false, report: null })
                // Refresh reports
                const data = await getAllReports(selectedEmployee || undefined, startDate, endDate)
                setReports(data)
            } else {
                showToast(result.error || LABELS.ERROR_OCCURRED, 'error')
            }
        } catch (error) {
            console.error('Save error:', error)
            showToast(LABELS.ERROR_OCCURRED, 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const employeeOptions = [
        { value: '', label: 'جميع الموظفين' },
        ...employees.map(e => ({ value: e.id, label: e.full_name }))
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    {LABELS.REPORTS}
                </h1>
                <p className="text-muted-foreground">عرض وتعديل تقارير الموظفين</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{LABELS.EMPLOYEES}</label>
                            <Select
                                value={selectedEmployee}
                                onChange={setSelectedEmployee}
                                options={employeeOptions}
                            />
                        </div>
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
                </CardContent>
            </Card>

            {/* Reports Table */}
            <Card>
                <CardHeader>
                    <CardTitle>التقارير ({reports.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <SkeletonTable rows={10} />
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
                                            الموظف
                                        </th>
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
                                            <td className="py-3 px-4 font-medium">
                                                {report.profiles.full_name}
                                            </td>
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditModal(report)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <Dialog
                open={editModal.open}
                onClose={() => setEditModal({ open: false, report: null })}
            >
                <DialogHeader onClose={() => setEditModal({ open: false, report: null })}>
                    تعديل التقرير
                </DialogHeader>
                <DialogContent>
                    {editModal.report && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {editModal.report.profiles.full_name} - {formatDate(editModal.report.report_date)}
                            </p>

                            {/* Leave Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <span className="text-sm font-medium">{LABELS.IS_LEAVE}</span>
                                <Switch
                                    checked={editData.is_leave}
                                    onChange={checked => setEditData(prev => ({ ...prev, is_leave: checked }))}
                                />
                            </div>

                            {/* Book Title */}
                            <div className="space-y-2">
                                <Label>{LABELS.BOOK_TITLE}</Label>
                                <Input
                                    value={editData.book_title}
                                    onChange={e => setEditData(prev => ({ ...prev, book_title: e.target.value }))}
                                    disabled={editData.is_leave}
                                />
                            </div>

                            {/* Pages */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label>{LABELS.PRINTING_PAGES}</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={editData.printing_pages}
                                        onChange={e => setEditData(prev => ({
                                            ...prev,
                                            printing_pages: parseNumber(e.target.value)
                                        }))}
                                        disabled={editData.is_leave}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{LABELS.TYPESETTING_PAGES}</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={editData.typesetting_pages}
                                        onChange={e => setEditData(prev => ({
                                            ...prev,
                                            typesetting_pages: parseNumber(e.target.value)
                                        }))}
                                        disabled={editData.is_leave}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{LABELS.EDITING_PAGES}</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={editData.editing_pages}
                                        onChange={e => setEditData(prev => ({
                                            ...prev,
                                            editing_pages: parseNumber(e.target.value)
                                        }))}
                                        disabled={editData.is_leave}
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label>{LABELS.NOTES}</Label>
                                <Textarea
                                    value={editData.notes}
                                    onChange={e => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setEditModal({ open: false, report: null })}
                        disabled={isSaving}
                    >
                        {LABELS.CANCEL}
                    </Button>
                    <Button onClick={handleSaveEdit} isLoading={isSaving}>
                        <Save className="w-4 h-4" />
                        {LABELS.SAVE}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
