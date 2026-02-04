// ============================================
// Application Constants - Arabic Labels
// ============================================

export const APP_NAME = 'نظام حضور الموظفين'
export const APP_NAME_SHORT = 'الحضور'

// Route paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    EMPLOYEE_DASHBOARD: '/employee',
    EMPLOYEE_HISTORY: '/employee/history',
    ADMIN_DASHBOARD: '/admin',
    ADMIN_EMPLOYEES: '/admin/employees',
    ADMIN_EMPLOYEES_NEW: '/admin/employees/new',
    ADMIN_REPORTS: '/admin/reports',
    ADMIN_ANALYTICS: '/admin/analytics',
    ADMIN_EXPORTS: '/admin/exports',
} as const

// Arabic labels
export const LABELS = {
    // Common
    SAVE: 'حفظ',
    CANCEL: 'إلغاء',
    EDIT: 'تعديل',
    DELETE: 'حذف',
    ADD: 'إضافة',
    SEARCH: 'بحث',
    FILTER: 'تصفية',
    EXPORT: 'تصدير',
    LOADING: 'جاري التحميل...',
    NO_DATA: 'لا توجد بيانات',
    CONFIRM: 'تأكيد',
    BACK: 'رجوع',

    // Auth
    LOGIN: 'تسجيل الدخول',
    LOGOUT: 'تسجيل الخروج',
    EMAIL: 'البريد الإلكتروني',
    PASSWORD: 'كلمة المرور',

    // Navigation
    DASHBOARD: 'لوحة التحكم',
    EMPLOYEES: 'الموظفون',
    REPORTS: 'التقارير',
    ANALYTICS: 'التحليلات',
    EXPORTS: 'التصدير',
    HISTORY: 'السجل',

    // Employee
    EMPLOYEE: 'موظف',
    ADMIN: 'مدير',
    FULL_NAME: 'الاسم الكامل',
    PHONE: 'رقم الهاتف',
    ROLE: 'الدور',
    STATUS: 'الحالة',
    ACTIVE: 'نشط',
    INACTIVE: 'غير نشط',
    CREATED_AT: 'تاريخ الإنشاء',

    // Reports
    DAILY_REPORT: 'التقرير اليومي',
    REPORT_DATE: 'تاريخ التقرير',
    BOOK_TITLE: 'عنوان الكتاب',
    PRINTING_PAGES: 'صفحات الطباعة',
    TYPESETTING_PAGES: 'صفحات التنضيد',
    EDITING_PAGES: 'صفحات التحرير',
    NOTES: 'ملاحظات',
    IS_LEAVE: 'إجازة اليوم',
    TOTAL_PAGES: 'إجمالي الصفحات',
    WORKDAYS: 'أيام العمل',
    LEAVE_DAYS: 'أيام الإجازة',

    // Date filters
    START_DATE: 'من تاريخ',
    END_DATE: 'إلى تاريخ',
    THIS_WEEK: 'هذا الأسبوع',
    THIS_MONTH: 'هذا الشهر',
    LAST_MONTH: 'الشهر الماضي',

    // Theme
    LIGHT_MODE: 'نهاري',
    DARK_MODE: 'ليلي',

    // Messages
    SUCCESS_SAVED: 'تم الحفظ بنجاح',
    SUCCESS_DELETED: 'تم الحذف بنجاح',
    ERROR_OCCURRED: 'حدث خطأ',
    CONFIRM_DELETE: 'هل أنت متأكد من الحذف؟',
    CONFIRM_DEACTIVATE: 'هل أنت متأكد من تعطيل هذا الموظف؟',

    // Export
    WEEKLY_REPORT: 'تقرير أسبوعي',
    MONTHLY_REPORT: 'تقرير شهري',
    EXPORT_PDF: 'تصدير PDF',
    EXPORT_EXCEL: 'تصدير Excel',
} as const

// Role options
export const ROLE_OPTIONS = [
    { value: 'employee', label: LABELS.EMPLOYEE },
    { value: 'admin', label: LABELS.ADMIN },
] as const

// Status options
export const STATUS_OPTIONS = [
    { value: true, label: LABELS.ACTIVE },
    { value: false, label: LABELS.INACTIVE },
] as const
