// Seed script to create the first admin user
// Run with: npx tsx scripts/seed-admin.ts

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables!')
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function seedAdmin() {
    const email = 'admin@employ.com'
    const password = 'Admin123!'
    const fullName = 'مدير النظام'

    console.log('Creating admin user...')
    console.log('Email:', email)
    console.log('Password:', password)

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    })

    if (authError) {
        console.error('Error creating auth user:', authError.message)

        // Check if user already exists
        if (authError.message.includes('already been registered')) {
            console.log('\nUser already exists! Try logging in with:')
            console.log('Email:', email)
            console.log('Password:', password)
        }
        return
    }

    if (!authData.user) {
        console.error('No user returned')
        return
    }

    console.log('Auth user created with ID:', authData.user.id)

    // Create profile
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: authData.user.id,
            full_name: fullName,
            phone: null,
            role: 'admin',
            is_active: true,
        })

    if (profileError) {
        console.error('Error creating profile:', profileError.message)
        // Rollback: delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        return
    }

    console.log('\n✅ Admin user created successfully!')
    console.log('================================')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('================================')
    console.log('\nYou can now login at http://localhost:3000/login')
}

seedAdmin().catch(console.error)
