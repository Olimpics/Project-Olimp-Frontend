import { NextRequest, NextResponse } from 'next/server'

export default function middleware(request: NextRequest) {
    const studentProfile = request.cookies.get('studentProfile')
    const { pathname } = request.nextUrl

    const url = request.nextUrl.clone()

    if (pathname === '/') {
        if (studentProfile) {
            url.pathname = '/cabinet'
        } else {
            url.pathname = '/login'
        }
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/', '/login'],
}