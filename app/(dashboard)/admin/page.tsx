import { getProfile } from '@/app/actions/auth'
import { getEmployees } from '@/app/actions/employees'
import { getAllEmployeesSummary } from '@/app/actions/reports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { ROUTES, LABELS } from '@/lib/constants'
import { formatDateForInput } from '@/lib/utils'
import { Users, FileText, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
    const profile = await getProfile()

    if (!profile || profile.role !== 'admin') {
        redirect(ROUTES.LOGIN)
    }

    const employees = await getEmployees()

    // Get this month's summary
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const summaries = await getAllEmployeesSummary(
        formatDateForInput(startOfMonth),
        formatDateForInput(endOfMonth)
    )

    const activeEmployees = employees.filter(e => e.is_active && e.role === 'employee').length
    const totalPrintingPages = summaries.reduce((sum, s) => sum + s.total_printing_pages, 0)
    const totalTypesettingPages = summaries.reduce((sum, s) => sum + s.total_typesetting_pages, 0)
    const totalEditingPages = summaries.reduce((sum, s) => sum + s.total_editing_pages, 0)
    const totalWorkdays = summaries.reduce((sum, s) => sum + s.total_workdays, 0)

    const stats = [
        {
            title: 'الموظفون النشطون',
            value: activeEmployees,
            icon: Users,
            href: ROUTES.ADMIN_EMPLOYEES,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'صفحات الطباعة (الشهر)',
            value: totalPrintingPages,
            icon: FileText,
            href: ROUTES.ADMIN_REPORTS,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
        },
        {
            title: 'صفحات التنضيد (الشهر)',
            value: totalTypesettingPages,
            icon: FileText,
            href: ROUTES.ADMIN_REPORTS,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'صفحات التحرير (الشهر)',
            value: totalEditingPages,
            icon: FileText,
            href: ROUTES.ADMIN_REPORTS,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'أيام العمل (الشهر)',
            value: totalWorkdays,
            icon: Calendar,
            href: ROUTES.ADMIN_ANALYTICS,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
        {
            title: 'إجمالي الصفحات',
            value: totalPrintingPages + totalTypesettingPages + totalEditingPages,
            icon: TrendingUp,
            href: ROUTES.ADMIN_ANALYTICS,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">مرحباً، {profile.full_name} 👋</h1>
                <p className="text-muted-foreground">لوحة تحكم المدير</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <Link key={i} href={stat.href}>
                            <Card className="hover:shadow-hover transition-shadow cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                                            <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                            <Icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            {/* Top Performers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        أفضل الموظفين (هذا الشهر)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {summaries.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">لا توجد بيانات</p>
                    ) : (
                        <div className="space-y-4">
                            {summaries.slice(0, 5).map((summary, index) => {
                                const total = summary.total_printing_pages + summary.total_typesetting_pages + summary.total_editing_pages
                                const maxTotal = summaries[0] ?
                                    summaries[0].total_printing_pages + summaries[0].total_typesetting_pages + summaries[0].total_editing_pages : 1
                                const percentage = (total / maxTotal) * 100

                                return (
                                    <div key={summary.employee_id} className="flex items-center gap-4">
                                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={ROUTES.ADMIN_EMPLOYEES_NEW}>
                    <Card className="hover:shadow-hover transition-shadow cursor-pointer p-6 text-center">
                        <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="font-medium">إضافة موظف جديد</p>
                    </Card>
                </Link>
                <Link href={ROUTES.ADMIN_REPORTS}>
                    <Card className="hover:shadow-hover transition-shadow cursor-pointer p-6 text-center">
                        <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="font-medium">عرض التقارير</p>
                    </Card>
                </Link>
                <Link href={ROUTES.ADMIN_EXPORTS}>
                    <Card className="hover:shadow-hover transition-shadow cursor-pointer p-6 text-center">
                        <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="font-medium">تصدير التقارير</p>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
