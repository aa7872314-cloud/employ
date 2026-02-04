import { APP_NAME } from '@/lib/constants'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-white font-bold text-2xl">ح</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{APP_NAME}</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        نظام إدارة الحضور والتقارير
                    </p>
                </div>

                {children}
            </div>
        </div>
    )
}
