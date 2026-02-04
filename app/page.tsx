import { redirect } from 'next/navigation'
import { getProfile } from '@/app/actions/auth'
import { ROUTES } from '@/lib/constants'

export default async function HomePage() {
  const profile = await getProfile()

  if (!profile) {
    redirect(ROUTES.LOGIN)
  }

  // Redirect based on role
  if (profile.role === 'admin') {
    redirect(ROUTES.ADMIN_DASHBOARD)
  } else {
    redirect(ROUTES.EMPLOYEE_DASHBOARD)
  }
}
