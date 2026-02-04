'use server'

import * as XLSX from 'xlsx'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { createClient } from '@/lib/supabase/server'
import type { EmployeeSummary } from '@/lib/types'

// Export data to Excel
export async function exportToExcel(
    summaries: EmployeeSummary[],
    title: string,
    dateRange: { start: string; end: string }
): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
        // Create workbook
        const wb = XLSX.utils.book_new()

        // Header row
        const headers = [
            'الاسم',
            'صفحات الطباعة',
            'صفحات التنضيد',
            'صفحات التحرير',
            'إجمالي الصفحات',
            'أيام العمل',
            'أيام الإجازة',
        ]

        // Data rows
        const rows = summaries.map(s => [
            s.full_name,
            s.total_printing_pages,
            s.total_typesetting_pages,
            s.total_editing_pages,
            s.total_printing_pages + s.total_typesetting_pages + s.total_editing_pages,
            s.total_workdays,
            s.total_leave_days,
        ])

        // Totals row
        const totals = [
            'الإجمالي',
            summaries.reduce((sum, s) => sum + s.total_printing_pages, 0),
            summaries.reduce((sum, s) => sum + s.total_typesetting_pages, 0),
            summaries.reduce((sum, s) => sum + s.total_editing_pages, 0),
            summaries.reduce((sum, s) =>
                sum + s.total_printing_pages + s.total_typesetting_pages + s.total_editing_pages, 0),
            summaries.reduce((sum, s) => sum + s.total_workdays, 0),
            summaries.reduce((sum, s) => sum + s.total_leave_days, 0),
        ]

        // Create worksheet
        const wsData = [
            [title],
            [`من: ${dateRange.start} إلى: ${dateRange.end}`],
            [],
            headers,
            ...rows,
            [],
            totals,
        ]

        const ws = XLSX.utils.aoa_to_sheet(wsData)

        // Set column widths
        ws['!cols'] = [
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 12 },
            { wch: 12 },
        ]

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'التقرير')

        // Generate base64 string
        const buffer = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' })

        return { success: true, data: buffer }
    } catch (error) {
        console.error('Excel export error:', error)
        return { success: false, error: 'فشل في تصدير الملف' }
    }
}

// Export data to PDF
export async function exportToPDF(
    summaries: EmployeeSummary[],
    title: string,
    dateRange: { start: string; end: string }
): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
        // Create PDF document
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage([595, 842]) // A4
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

        const { height } = page.getSize()
        let yPosition = height - 50

        // Colors
        const primaryColor = rgb(159 / 255, 25 / 255, 24 / 255)
        const textColor = rgb(26 / 255, 26 / 255, 26 / 255)

        // Title (Note: Arabic text may not render correctly with standard fonts)
        page.drawText(title, {
            x: 50,
            y: yPosition,
            size: 20,
            font: boldFont,
            color: primaryColor,
        })
        yPosition -= 30

        // Date range
        page.drawText(`${dateRange.start} - ${dateRange.end}`, {
            x: 50,
            y: yPosition,
            size: 12,
            font,
            color: textColor,
        })
        yPosition -= 40

        // Table headers
        const colWidths = [150, 60, 60, 60, 60, 50, 50]
        const headers = ['Name', 'Print', 'Type', 'Edit', 'Total', 'Work', 'Leave']

        let xPosition = 50
        headers.forEach((header, i) => {
            page.drawText(header, {
                x: xPosition,
                y: yPosition,
                size: 10,
                font: boldFont,
                color: primaryColor,
            })
            xPosition += colWidths[i]
        })
        yPosition -= 20

        // Draw line
        page.drawLine({
            start: { x: 50, y: yPosition + 5 },
            end: { x: 545, y: yPosition + 5 },
            thickness: 1,
            color: primaryColor,
        })
        yPosition -= 5

        // Data rows
        summaries.forEach(s => {
            if (yPosition < 50) {
                // Add new page if needed
                return
            }

            xPosition = 50
            const total = s.total_printing_pages + s.total_typesetting_pages + s.total_editing_pages
            const rowData = [
                s.full_name.substring(0, 20),
                s.total_printing_pages.toString(),
                s.total_typesetting_pages.toString(),
                s.total_editing_pages.toString(),
                total.toString(),
                s.total_workdays.toString(),
                s.total_leave_days.toString(),
            ]

            rowData.forEach((text, i) => {
                page.drawText(text, {
                    x: xPosition,
                    y: yPosition,
                    size: 10,
                    font,
                    color: textColor,
                })
                xPosition += colWidths[i]
            })
            yPosition -= 18
        })

        // Totals
        yPosition -= 10
        page.drawLine({
            start: { x: 50, y: yPosition + 15 },
            end: { x: 545, y: yPosition + 15 },
            thickness: 1,
            color: primaryColor,
        })

        xPosition = 50
        const grandTotal = summaries.reduce((sum, s) =>
            sum + s.total_printing_pages + s.total_typesetting_pages + s.total_editing_pages, 0)
        const totalsData = [
            'TOTAL',
            summaries.reduce((sum, s) => sum + s.total_printing_pages, 0).toString(),
            summaries.reduce((sum, s) => sum + s.total_typesetting_pages, 0).toString(),
            summaries.reduce((sum, s) => sum + s.total_editing_pages, 0).toString(),
            grandTotal.toString(),
            summaries.reduce((sum, s) => sum + s.total_workdays, 0).toString(),
            summaries.reduce((sum, s) => sum + s.total_leave_days, 0).toString(),
        ]

        totalsData.forEach((text, i) => {
            page.drawText(text, {
                x: xPosition,
                y: yPosition,
                size: 10,
                font: boldFont,
                color: primaryColor,
            })
            xPosition += colWidths[i]
        })

        // Generate base64 string
        const pdfBytes = await pdfDoc.saveAsBase64()

        return { success: true, data: pdfBytes }
    } catch (error) {
        console.error('PDF export error:', error)
        return { success: false, error: 'فشل في تصدير الملف' }
    }
}

// Generate weekly report
export async function generateWeeklyReport(
    startDate: string,
    endDate: string
): Promise<{ summaries: EmployeeSummary[]; dateRange: { start: string; end: string } }> {
    const supabase = await createClient()

    // Get all active employees
    const { data: employees } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('is_active', true)
        .eq('role', 'employee')

    if (!employees) return { summaries: [], dateRange: { start: startDate, end: endDate } }

    // Get all reports in range
    const { data: reports } = await supabase
        .from('daily_reports')
        .select('*')
        .gte('report_date', startDate)
        .lte('report_date', endDate)

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

    return {
        summaries: summaries.sort((a, b) =>
            (b.total_printing_pages + b.total_typesetting_pages + b.total_editing_pages) -
            (a.total_printing_pages + a.total_typesetting_pages + a.total_editing_pages)
        ),
        dateRange: { start: startDate, end: endDate }
    }
}
