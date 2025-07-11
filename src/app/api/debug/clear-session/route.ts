import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const response = NextResponse.json({ success: true, message: 'Session cleared' })
        
        // Clear the session cookie
        response.cookies.set('session', '', {
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        })
        
        return response
    } catch (error) {
        console.error('Clear session API error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
