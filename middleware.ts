import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that don't require authentication
const publicRoutes = ['/login']

// Routes that require admin role
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
    const { supabaseResponse, user } = await updateSession(request)
    const { pathname } = request.nextUrl

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Not logged in
    if (!user) {
        if (isPublicRoute) {
            return supabaseResponse
        }
        // Redirect to login
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Logged in but on public route (login page)
    if (isPublicRoute) {
        // Redirect to dashboard based on role
        const url = request.nextUrl.clone()
        url.pathname = '/employee' // Default, will be corrected by getProfile in page
        return NextResponse.redirect(url)
    }

    // Check admin routes
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
    if (isAdminRoute) {
        // Role check will be done in the page component with proper profile fetch
        // For now, just allow through - RLS will prevent unauthorized access
    }

    // Root redirect
    if (pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/employee'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
