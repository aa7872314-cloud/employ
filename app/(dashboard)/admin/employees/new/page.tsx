'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/providers/toast-provider'
import { createEmployee } from '@/app/actions/employees'
import { LABELS, ROUTES, ROLE_OPTIONS } from '@/lib/constants'
import type { EmployeeFormData } from '@/lib/types'
import { UserPlus, ArrowRight, Mail, Lock, User, Phone } from 'lucide-react'
import Link from 'next/link'

export default function NewEmployeePage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<EmployeeFormData>({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'employee',
    })
    const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({})

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {}

        if (!formData.email) {
            newErrors.email = 'البريد الإلكتروني مطلوب'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'البريد الإلكتروني غير صالح'
        }

        if (!formData.password) {
            newErrors.password = 'كلمة المرور مطلوبة'
        } else if (formData.password.length < 6) {
            newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        }

        if (!formData.full_name) {
            newErrors.full_name = 'الاسم الكامل مطلوب'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) return

        setIsLoading(true)
        try {
            const result = await createEmployee(formData)

            if (result.success) {
                showToast('تم إنشاء الموظف بنجاح', 'success')
                router.push(ROUTES.ADMIN_EMPLOYEES)
            } else {
                showToast(result.error || LABELS.ERROR_OCCURRED, 'error')
            }
        } catch (error) {
            console.error('Create error:', error)
            showToast(LABELS.ERROR_OCCURRED, 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (field: keyof EmployeeFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
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
                        <UserPlus className="w-6 h-6 text-primary" />
                        إضافة موظف جديد
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
                                error={errors.full_name}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" required>
                                <Mail className="w-4 h-4 inline ml-1" />
                                {LABELS.EMAIL}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={e => handleChange('email', e.target.value)}
                                placeholder="example@company.com"
                                error={errors.email}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" required>
                                <Lock className="w-4 h-4 inline ml-1" />
                                {LABELS.PASSWORD}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={e => handleChange('password', e.target.value)}
                                placeholder="كلمة المرور الأولية"
                                error={errors.password}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                سيستخدم الموظف هذه الكلمة لتسجيل الدخول لأول مرة
                            </p>
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
                                placeholder="رقم الهاتف (اختياري)"
                                disabled={isLoading}
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
                                onChange={value => handleChange('role', value)}
                                options={ROLE_OPTIONS.map(r => ({ value: r.value, label: r.label }))}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4">
                            <Button
                                type="submit"
                                className="flex-1"
                                isLoading={isLoading}
                            >
                                إنشاء الموظف
                            </Button>
                            <Link href={ROUTES.ADMIN_EMPLOYEES}>
                                <Button variant="ghost" type="button" disabled={isLoading}>
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
