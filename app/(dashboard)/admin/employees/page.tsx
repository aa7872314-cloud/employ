'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonTable } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/dialog'
import { useToast } from '@/components/providers/toast-provider'
import { getEmployees, deleteEmployee, updateEmployee } from '@/app/actions/employees'
import { formatDate, cn } from '@/lib/utils'
import { LABELS, ROUTES } from '@/lib/constants'
import type { Profile } from '@/lib/types'
import { Users, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react'

export default function AdminEmployeesPage() {
    const { showToast } = useToast()
    const [employees, setEmployees] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; employee: Profile | null }>({
        open: false,
        employee: null,
    })
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchEmployees = async () => {
        setIsLoading(true)
        try {
            const data = await getEmployees()
            setEmployees(data)
        } catch (error) {
            console.error('Fetch error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    const handleToggleActive = async (employee: Profile) => {
        try {
            const result = await updateEmployee(employee.id, {
                full_name: employee.full_name,
                phone: employee.phone || '',
                role: employee.role,
                is_active: !employee.is_active,
            })

            if (result.success) {
                showToast(employee.is_active ? 'تم تعطيل الموظف' : 'تم تفعيل الموظف', 'success')
                fetchEmployees()
            } else {
                showToast(result.error || LABELS.ERROR_OCCURRED, 'error')
            }
        } catch (error) {
            console.error('Toggle error:', error)
            showToast(LABELS.ERROR_OCCURRED, 'error')
        }
    }

    const handleDelete = async () => {
        if (!deleteModal.employee) return

        setIsDeleting(true)
        try {
            const result = await deleteEmployee(deleteModal.employee.id)

            if (result.success) {
                showToast(LABELS.SUCCESS_DELETED, 'success')
                setDeleteModal({ open: false, employee: null })
                fetchEmployees()
            } else {
                showToast(result.error || LABELS.ERROR_OCCURRED, 'error')
            }
        } catch (error) {
            console.error('Delete error:', error)
            showToast(LABELS.ERROR_OCCURRED, 'error')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        {LABELS.EMPLOYEES}
                    </h1>
                    <p className="text-muted-foreground">إدارة الموظفين</p>
                </div>
                <Link href={ROUTES.ADMIN_EMPLOYEES_NEW}>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        إضافة موظف
                    </Button>
                </Link>
            </div>

            {/* Employees Table */}
            <Card>
                <CardHeader>
                    <CardTitle>قائمة الموظفين ({employees.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <SkeletonTable rows={5} />
                    ) : employees.length === 0 ? (
                        <EmptyState
                            icon={<Users className="w-8 h-8 text-muted-foreground" />}
                            title={LABELS.NO_DATA}
                            description="لا يوجد موظفون مسجلون"
                            action={
                                <Link href={ROUTES.ADMIN_EMPLOYEES_NEW}>
                                    <Button>إضافة موظف</Button>
                                </Link>
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                            {LABELS.FULL_NAME}
                                        </th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                            {LABELS.PHONE}
                                        </th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                            {LABELS.ROLE}
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                                            {LABELS.STATUS}
                                        </th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                            {LABELS.CREATED_AT}
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                                            إجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(employee => (
                                        <tr
                                            key={employee.id}
                                            className={cn(
                                                'border-b border-border/50 hover:bg-muted/30 transition-colors',
                                                !employee.is_active && 'opacity-60'
                                            )}
                                        >
                                            <td className="py-3 px-4 font-medium">
                                                {employee.full_name}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {employee.phone || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={cn(
                                                    'px-2 py-1 rounded-full text-sm',
                                                    employee.role === 'admin'
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-blue-500/10 text-blue-500'
                                                )}>
                                                    {employee.role === 'admin' ? LABELS.ADMIN : LABELS.EMPLOYEE}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={cn(
                                                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm',
                                                    employee.is_active
                                                        ? 'bg-success/10 text-success'
                                                        : 'bg-muted text-muted-foreground'
                                                )}>
                                                    {employee.is_active ? (
                                                        <>
                                                            <UserCheck className="w-3 h-3" />
                                                            {LABELS.ACTIVE}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserX className="w-3 h-3" />
                                                            {LABELS.INACTIVE}
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {formatDate(employee.created_at)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link href={`${ROUTES.ADMIN_EMPLOYEES}/${employee.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(employee)}
                                                    >
                                                        {employee.is_active ? (
                                                            <UserX className="w-4 h-4" />
                                                        ) : (
                                                            <UserCheck className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteModal({ open: true, employee })}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, employee: null })}
                onConfirm={handleDelete}
                title="حذف الموظف"
                message={`هل أنت متأكد من حذف "${deleteModal.employee?.full_name}"؟ سيتم حذف جميع التقارير المرتبطة.`}
                confirmText={LABELS.DELETE}
                isLoading={isDeleting}
            />
        </div>
    )
}
