// ============================================
// Database Types
// ============================================

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string
                    phone: string | null
                    role: 'admin' | 'employee'
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name: string
                    phone?: string | null
                    role?: 'admin' | 'employee'
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    phone?: string | null
                    role?: 'admin' | 'employee'
                    is_active?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            daily_reports: {
                Row: {
                    id: string
                    employee_id: string
                    report_date: string
                    book_title: string | null
                    printing_pages: number
                    typesetting_pages: number
                    editing_pages: number
                    notes: string | null
                    is_leave: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    employee_id: string
                    report_date: string
                    book_title?: string | null
                    printing_pages?: number
                    typesetting_pages?: number
                    editing_pages?: number
                    notes?: string | null
                    is_leave?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    employee_id?: string
                    report_date?: string
                    book_title?: string | null
                    printing_pages?: number
                    typesetting_pages?: number
                    editing_pages?: number
                    notes?: string | null
                    is_leave?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "daily_reports_employee_id_fkey"
                        columns: ["employee_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            audit_logs: {
                Row: {
                    id: string
                    actor_id: string | null
                    target_employee_id: string | null
                    report_id: string | null
                    action: string
                    before_data: Json | null
                    after_data: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    actor_id?: string | null
                    target_employee_id?: string | null
                    report_id?: string | null
                    action: string
                    before_data?: Json | null
                    after_data?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    actor_id?: string | null
                    target_employee_id?: string | null
                    report_id?: string | null
                    action?: string
                    before_data?: Json | null
                    after_data?: Json | null
                    created_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
            get_user_role: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type DailyReport = Database['public']['Tables']['daily_reports']['Row']
export type DailyReportInsert = Database['public']['Tables']['daily_reports']['Insert']
export type DailyReportUpdate = Database['public']['Tables']['daily_reports']['Update']

export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

// Extended types with relations
export type DailyReportWithEmployee = DailyReport & {
    profiles: Profile
}

export type AuditLogWithDetails = AuditLog & {
    actor: Profile | null
    target_employee: Profile | null
}

// Form types
export interface DailyReportFormData {
    report_date: string
    book_title: string
    printing_pages: number
    typesetting_pages: number
    editing_pages: number
    notes: string
    is_leave: boolean
}

export interface EmployeeFormData {
    email: string
    password: string
    full_name: string
    phone: string
    role: 'admin' | 'employee'
}

export interface EmployeeUpdateData {
    full_name: string
    phone: string
    role: 'admin' | 'employee'
    is_active: boolean
}

// Report summary types
export interface EmployeeSummary {
    employee_id: string
    full_name: string
    total_printing_pages: number
    total_typesetting_pages: number
    total_editing_pages: number
    total_workdays: number
    total_leave_days: number
}

export interface DateRangeFilter {
    start_date: string
    end_date: string
}
