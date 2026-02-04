import { DailyReportForm } from '@/components/employee/daily-report-form'

export default function EmployeeDashboardPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">مرحباً 👋</h1>
                <p className="text-muted-foreground">أدخل تقريرك اليومي</p>
            </div>

            <DailyReportForm />
        </div>
    )
}
