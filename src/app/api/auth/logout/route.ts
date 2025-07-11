import { logout } from '@/lib/actions/auth.action'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const result = await logout()
        
        if (result.success) {
            const response = NextResponse.json({ success: true }, { status: 200 })
            
            // Clear the session cookie
            response.cookies.set('session', '', {
                expires: new Date(0),
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            })
            
            return response
        } else {
            return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 })
        }
    } catch (error) {
        console.error('Logout API error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
