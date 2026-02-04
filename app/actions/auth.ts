'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants'
import type { Profile } from '@/lib/types'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'بيانات الدخول غير صحيحة' }
    }

    // Get user profile to determine redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single() as { data: { role: string } | null }

        const redirectTo = profile?.role === 'admin'
            ? ROUTES.ADMIN_DASHBOARD
            : ROUTES.EMPLOYEE_DASHBOARD

        revalidatePath('/', 'layout')
        redirect(redirectTo)
    }

    revalidatePath('/', 'layout')
    redirect(ROUTES.EMPLOYEE_DASHBOARD)
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect(ROUTES.LOGIN)
}

export async function getSession() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function getProfile(): Promise<Profile | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single() as { data: Profile | null }

    return profile
}
