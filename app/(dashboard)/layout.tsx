import { redirect } from 'next/navigation'
import { getProfile } from '@/app/actions/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ROUTES } from '@/lib/constants'

export default async function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    const profile = await getProfile()

    if (!profile) {
        redirect(ROUTES.LOGIN)
    }

    return (
        <DashboardLayout profile={profile}>
            {children}
        </DashboardLayout>
    )
}
