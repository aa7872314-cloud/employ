'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants'
import type { DailyReportFormData, DailyReport, DailyReportWithEmployee, EmployeeSummary, AuditLogInsert, Json } from '@/lib/types'

// Create or update daily report (upsert)
export async function upsertDailyReport(
    data: DailyReportFormData
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'غير مصرح' }

    // If leave, set page fields to 0
    const reportData = {
        employee_id: user.id,
        report_date: data.report_date,
        book_title: data.is_leave ? null : data.book_title || null,
        printing_pages: data.is_leave ? 0 : Math.max(0, data.printing_pages || 0),
        typesetting_pages: data.is_leave ? 0 : Math.max(0, data.typesetting_pages || 0),
        editing_pages: data.is_leave ? 0 : Math.max(0, data.editing_pages || 0),
        notes: data.notes || null,
        is_leave: data.is_leave,
    }

    const { error } = await supabase
        .from('daily_reports')
        .upsert(reportData, {
            onConflict: 'employee_id,report_date',
        })

    if (error) {
        console.error('Upsert error:', error)
        return { success: false, error: 'فشل في حفظ التقرير' }
    }

    revalidatePath(ROUTES.EMPLOYEE_DASHBOARD)
    revalidatePath(ROUTES.EMPLOYEE_HISTORY)
    return { success: true }
}

// Admin update report with audit logging
export async function adminUpdateReport(
    reportId: string,
    data: Partial<DailyReportFormData>
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'غير مصرح' }

    // Verify admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: string } | null }

    if (profile?.role !== 'admin') {
        return { success: false, error: 'غير مصرح' }
    }

    // Get current report data for audit
    const { data: beforeData } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('id', reportId)
        .single() as { data: DailyReport | null }

    if (!beforeData) {
        return { success: false, error: 'التقرير غير موجود' }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}
    if (data.book_title !== undefined) updateData.book_title = data.book_title || null
    if (data.printing_pages !== undefined) updateData.printing_pages = Math.max(0, data.printing_pages)
    if (data.typesetting_pages !== undefined) updateData.typesetting_pages = Math.max(0, data.typesetting_pages)
    if (data.editing_pages !== undefined) updateData.editing_pages = Math.max(0, data.editing_pages)
    if (data.notes !== undefined) updateData.notes = data.notes || null
    if (data.is_leave !== undefined) updateData.is_leave = data.is_leave

    // Update report
    const { data: afterData, error } = await supabase
        .from('daily_reports')
        .update(updateData)
        .eq('id', reportId)
        .select()
        .single() as { data: DailyReport | null, error: unknown }

    if (error) {
        console.error('Update error:', error)
        return { success: false, error: 'فشل في تحديث التقرير' }
    }

    // Create audit log
    const auditLog: AuditLogInsert = {
        actor_id: user.id,
        target_employee_id: beforeData.employee_id,
        report_id: reportId,
        action: 'ADMIN_EDIT',
        before_data: beforeData as unknown as Json,
        after_data: afterData as unknown as Json,
    }

    await supabase
        .from('audit_logs')
        .insert(auditLog)

    revalidatePath(ROUTES.ADMIN_REPORTS)
    return { success: true }
}

// Get employee's own reports
export async function getMyReports(
    startDate?: string,
    endDate?: string
): Promise<DailyReport[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    let query = supabase
        .from('daily_reports')
        .select('*')
        .eq('employee_id', user.id)
        .order('report_date', { ascending: false })

    if (startDate) {
        query = query.gte('report_date', startDate)
    }
    if (endDate) {
        query = query.lte('report_date', endDate)
    }

    const { data } = await query as { data: DailyReport[] | null }
    return data || []
}

// Get today's report for current user
export async function getTodayReport(date: string): Promise<DailyReport | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('employee_id', user.id)
        .eq('report_date', date)
        .single() as { data: DailyReport | null }

    return data
}

// Get all reports (Admin only)
export async function getAllReports(
    employeeId?: string,
    startDate?: string,
    endDate?: string
): Promise<DailyReportWithEmployee[]> {
    const supabase = await createClient()

    let query = supabase
        .from('daily_reports')
        .select('*, profiles(*)')
        .order('report_date', { ascending: false })

    if (employeeId) {
        query = query.eq('employee_id', employeeId)
    }
    if (startDate) {
        query = query.gte('report_date', startDate)
    }
    if (endDate) {
        query = query.lte('report_date', endDate)
    }

    const { data } = await query as { data: DailyReportWithEmployee[] | null }
    return data || []
}

// Get employee summary for date range
export async function getEmployeeSummary(
    employeeId: string,
    startDate: string,
    endDate: string
): Promise<EmployeeSummary | null> {
    const supabase = await createClient()

    // Get employee profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', employeeId)
        .single() as { data: { full_name: string } | null }

    if (!profile) return null

    // Get reports in range
    const { data: reports } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('report_date', startDate)
        .lte('report_date', endDate) as { data: DailyReport[] | null }

    const reportsList = reports || []

    const summary: EmployeeSummary = {
        employee_id: employeeId,
        full_name: profile.full_name,
        total_printing_pages: reportsList.reduce((sum, r) => sum + (r.printing_pages || 0), 0),
        total_typesetting_pages: reportsList.reduce((sum, r) => sum + (r.typesetting_pages || 0), 0),
        total_editing_pages: reportsList.reduce((sum, r) => sum + (r.editing_pages || 0), 0),
        total_workdays: reportsList.filter(r => !r.is_leave).length,
        total_leave_days: reportsList.filter(r => r.is_leave).length,
    }

    return summary
}

// Get all employees summaries for date range
export async function getAllEmployeesSummary(
    startDate: string,
    endDate: string
): Promise<EmployeeSummary[]> {
    const supabase = await createClient()

    // Get all active employees
    const { data: employees } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('is_active', true)
        .eq('role', 'employee') as { data: { id: string; full_name: string }[] | null }

    if (!employees) return []

    // Get all reports in range
    const { data: reports } = await supabase
        .from('daily_reports')
        .select('*')
        .gte('report_date', startDate)
        .lte('report_date', endDate) as { data: DailyReport[] | null }

    const reportsList = reports || []

    const summaries: EmployeeSummary[] = employees.map(employee => {
        const employeeReports = reportsList.filter(r => r.employee_id === employee.id)

        return {
            employee_id: employee.id,
            full_name: employee.full_name,
            total_printing_pages: employeeReports.reduce((sum, r) => sum + (r.printing_pages || 0), 0),
            total_typesetting_pages: employeeReports.reduce((sum, r) => sum + (r.typesetting_pages || 0), 0),
            total_editing_pages: employeeReports.reduce((sum, r) => sum + (r.editing_pages || 0), 0),
            total_workdays: employeeReports.filter(r => !r.is_leave).length,
            total_leave_days: employeeReports.filter(r => r.is_leave).length,
        }
    })

    return summaries.sort((a, b) =>
        (b.total_printing_pages + b.total_typesetting_pages + b.total_editing_pages) -
        (a.total_printing_pages + a.total_typesetting_pages + a.total_editing_pages)
    )
}
