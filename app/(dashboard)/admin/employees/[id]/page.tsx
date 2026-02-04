'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { SkeletonForm } from '@/components/ui/skeleton'
import { useToast } from '@/components/providers/toast-provider'
import { getEmployee, updateEmployee } from '@/app/actions/employees'
import { LABELS, ROUTES, ROLE_OPTIONS, STATUS_OPTIONS } from '@/lib/constants'
import type { Profile, EmployeeUpdateData } from '@/lib/types'
import { UserCog, ArrowRight, User, Phone } from 'lucide-react'
import Link from 'next/link'

export default function EditEmployeePage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = use(params)
    const router = useRouter()
    const { showToast } = useToast()
    const [employee, setEmployee] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState<EmployeeUpdateData>({
        full_name: '',
        phone: '',
        role: 'employee',
        is_active: true,
    })

    useEffect(() => {
        async function fetchEmployee() {
            try {
                const data = await getEmployee(resolvedParams.id)
                if (data) {
                    setEmployee(data)
                    setFormData({
                        full_name: data.full_name,
                        phone: data.phone || '',
                        role: data.role,
                        is_active: data.is_active,
                    })
                }
            } catch (error) {
                console.error('Fetch error:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchEmployee()
    }, [resolvedParams.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.full_name) {
            showToast('الاسم الكامل مطلوب', 'error')
            return
        }

        setIsSaving(true)
        try {
            const result = await updateEmployee(resolvedParams.id, formData)

            if (result.success) {
                showToast(LABELS.SUCCESS_SAVED, 'success')
                router.push(ROUTES.ADMIN_EMPLOYEES)
            } else {
                showToast(result.error || LABELS.ERROR_OCCURRED, 'error')
            }
        } catch (error) {
            console.error('Update error:', error)
            showToast(LABELS.ERROR_OCCURRED, 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const handleChange = (field: keyof EmployeeUpdateData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>تحميل...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SkeletonForm />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!employee) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <p className="text-muted-foreground mb-4">الموظف غير موجود</p>
                <Link href={ROUTES.ADMIN_EMPLOYEES}>
                    <Button>{LABELS.BACK}</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={ROUTES.ADMIN_EMPLOYEES}>
                    <Button variant="ghost" size="sm">
                        <ArrowRight className="w-4 h-4" />
                        {LABELS.BACK}
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCog className="w-6 h-6 text-primary" />
                        تعديل بيانات الموظف
                    </h1>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>بيانات الموظف</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="full_name" required>
                                <User className="w-4 h-4 inline ml-1" />
                                {LABELS.FULL_NAME}
                            </Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={e => handleChange('full_name', e.target.value)}
                                placeholder="أدخل الاسم الكامل"
                                disabled={isSaving}
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                <Phone className="w-4 h-4 inline ml-1" />
                                {LABELS.PHONE}
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={e => handleChange('phone', e.target.value)}
                                placeholder="رقم الهاتف"
                                disabled={isSaving}
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role" required>
                                {LABELS.ROLE}
                            </Label>
                            <Select
                                id="role"
                                value={formData.role}
                                onChange={value => handleChange('role', value as 'admin' | 'employee')}
                                options={ROLE_OPTIONS.map(r => ({ value: r.value, label: r.label }))}
                                disabled={isSaving}
                            />
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                            <div>
                                <p className="font-medium">{LABELS.STATUS}</p>
                                <p className="text-sm text-muted-foreground">
                                    تعطيل الموظف سيمنعه من تسجيل الدخول
                                </p>
                            </div>
                            <Switch
                                checked={formData.is_active}
                                onChange={checked => handleChange('is_active', checked)}
                                disabled={isSaving}
                                label={formData.is_active ? LABELS.ACTIVE : LABELS.INACTIVE}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4">
                            <Button
                                type="submit"
                                className="flex-1"
                                isLoading={isSaving}
                            >
                                {LABELS.SAVE}
                            </Button>
                            <Link href={ROUTES.ADMIN_EMPLOYEES}>
                                <Button variant="ghost" type="button" disabled={isSaving}>
                                    {LABELS.CANCEL}
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
