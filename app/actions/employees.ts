'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ROUTES } from '@/lib/constants'
import type { EmployeeFormData, EmployeeUpdateData, Profile, ProfileInsert, AuditLogInsert, Json } from '@/lib/types'

// Create a new employee (Admin only)
export async function createEmployee(data: EmployeeFormData): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'غير مصرح' }

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: string } | null }

    if (currentProfile?.role !== 'admin') {
        return { success: false, error: 'غير مصرح' }
    }

    // Create auth user using admin client
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true, // Auto-confirm email
    })

    if (authError || !authData.user) {
        console.error('Auth error:', authError)
        return { success: false, error: 'فشل في إنشاء الحساب' }
    }

    // Create profile
    const profileData: ProfileInsert = {
        id: authData.user.id,
        full_name: data.full_name,
        phone: data.phone || null,
        role: data.role,
        is_active: true,
    }

    const { error: profileError } = await adminClient
        .from('profiles')
        .insert(profileData)

    if (profileError) {
        // Rollback: delete auth user
        await adminClient.auth.admin.deleteUser(authData.user.id)
        console.error('Profile error:', profileError)
        return { success: false, error: 'فشل في إنشاء الملف الشخصي' }
    }

    // Create audit log
    const auditLog: AuditLogInsert = {
        actor_id: user.id,
        target_employee_id: authData.user.id,
        action: 'CREATE_EMPLOYEE',
        after_data: {
            full_name: data.full_name,
            phone: data.phone,
            role: data.role,
        } as Json,
    }

    await adminClient
        .from('audit_logs')
        .insert(auditLog)

    revalidatePath(ROUTES.ADMIN_EMPLOYEES)
    return { success: true }
}

// Update employee profile (Admin only)
export async function updateEmployee(
    employeeId: string,
    data: EmployeeUpdateData
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'غير مصرح' }

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: string } | null }

    if (currentProfile?.role !== 'admin') {
        return { success: false, error: 'غير مصرح' }
    }

    // Get current employee data for audit
    const { data: beforeData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', employeeId)
        .single() as { data: Profile | null }

    // Update profile
    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: data.full_name,
            phone: data.phone || null,
            role: data.role,
            is_active: data.is_active,
        })
        .eq('id', employeeId)

    if (error) {
        console.error('Update error:', error)
        return { success: false, error: 'فشل في تحديث البيانات' }
    }

    // Create audit log
    const auditLog: AuditLogInsert = {
        actor_id: user.id,
        target_employee_id: employeeId,
        action: 'UPDATE_EMPLOYEE',
        before_data: beforeData as Json,
        after_data: data as unknown as Json,
    }

    await supabase
        .from('audit_logs')
        .insert(auditLog)

    revalidatePath(ROUTES.ADMIN_EMPLOYEES)
    return { success: true }
}

// Delete employee (Admin only)
export async function deleteEmployee(employeeId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'غير مصرح' }

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: string } | null }

    if (currentProfile?.role !== 'admin') {
        return { success: false, error: 'غير مصرح' }
    }

    // Get employee data for audit
    const { data: employeeData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', employeeId)
        .single() as { data: Profile | null }

    // Create audit log before deletion
    const auditLog: AuditLogInsert = {
        actor_id: user.id,
        target_employee_id: employeeId,
        action: 'DELETE_EMPLOYEE',
        before_data: employeeData as Json,
    }

    await supabase
        .from('audit_logs')
        .insert(auditLog)

    // Delete auth user (cascades to profile due to foreign key)
    const { error } = await adminClient.auth.admin.deleteUser(employeeId)

    if (error) {
        console.error('Delete error:', error)
        return { success: false, error: 'فشل في حذف الموظف' }
    }

    revalidatePath(ROUTES.ADMIN_EMPLOYEES)
    return { success: true }
}

// Get all employees (Admin only)
export async function getEmployees(): Promise<Profile[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false }) as { data: Profile[] | null }

    return data || []
}

// Get single employee
export async function getEmployee(id: string): Promise<Profile | null> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single() as { data: Profile | null }

    return data
}
