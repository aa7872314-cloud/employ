'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Select } from '@/components/ui/select'
import { SkeletonCard } from '@/components/ui/skeleton'
import { getAllEmployeesSummary, getEmployeeSummary } from '@/app/actions/reports'
import { getEmployees } from '@/app/actions/employees'
import { formatDateForInput } from '@/lib/utils'
import { LABELS } from '@/lib/constants'
import type { EmployeeSummary, Profile } from '@/lib/types'
import { BarChart3, Filter, TrendingUp, Users } from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts'

export default function AdminAnalyticsPage() {
    const [summaries, setSummaries] = useState<EmployeeSummary[]>([])
    const [employees, setEmployees] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState('')

    // Set default date range (this month)
    useEffect(() => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        setStartDate(formatDateForInput(start))
        setEndDate(formatDateForInput(end))
    }, [])

    // Fetch employees
    useEffect(() => {
        async function fetchEmployees() {
            const data = await getEmployees()
            setEmployees(data.filter(e => e.role === 'employee' && e.is_active))
        }
        fetchEmployees()
    }, [])

    // Fetch summaries
    useEffect(() => {
        async function fetchSummaries() {
            if (!startDate || !endDate) return

            setIsLoading(true)
            try {
                const data = await getAllEmployeesSummary(startDate, endDate)
                setSummaries(data)
            } catch (error) {
                console.error('Fetch error:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSummaries()
    }, [startDate, endDate])

    // Prepare chart data
    const barChartData = summaries.map(s => ({
        name: s.full_name.split(' ')[0], // First name only for readability
        طباعة: s.total_printing_pages,
        تنضيد: s.total_typesetting_pages,
        تحرير: s.total_editing_pages,
    }))

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

    const employeeOptions = [
        { value: '', label: 'جميع الموظفين' },
        ...employees.map(e => ({ value: e.id, label: e.full_name }))
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    {LABELS.ANALYTICS}
                </h1>
                <p className="text-muted-foreground">تحليلات أداء الموظفين</p>
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

            {/* Summary Cards */}
            {!isLoading && (
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

            {/* Charts */}
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Employee Comparison Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                مقارنة الموظفين
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {barChartData.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={barChartData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={80} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="طباعة" fill="#9F1918" />
                                        <Bar dataKey="تنضيد" fill="#7F1312" />
                                        <Bar dataKey="تحرير" fill="#5F0F0E" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Performance Ranking */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                ترتيب الأداء
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {summaries.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
                            ) : (
                                <div className="space-y-4">
                                    {summaries.slice(0, 10).map((summary, index) => {
                                        const total = summary.total_printing_pages + summary.total_typesetting_pages + summary.total_editing_pages
                                        const maxTotal = summaries[0] ?
                                            summaries[0].total_printing_pages + summaries[0].total_typesetting_pages + summaries[0].total_editing_pages : 1
                                        const percentage = (total / maxTotal) * 100

                                        return (
                                            <div key={summary.employee_id} className="flex items-center gap-4">
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-500 text-white' :
                                                        index === 1 ? 'bg-gray-400 text-white' :
                                                            index === 2 ? 'bg-orange-600 text-white' :
                                                                'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium">{summary.full_name}</span>
                                                        <span className="text-sm text-muted-foreground">{total} صفحة</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Detailed Table */}
            <Card>
                <CardHeader>
                    <CardTitle>ملخص تفصيلي</CardTitle>
                </CardHeader>
                <CardContent>
                    {summaries.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">الموظف</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">طباعة</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">تنضيد</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">تحرير</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">الإجمالي</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">أيام العمل</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">الإجازات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summaries.map(summary => (
                                        <tr key={summary.employee_id} className="border-b border-border/50 hover:bg-muted/30">
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
