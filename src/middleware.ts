import { NextRequest, NextResponse } from 'next/server'

export default function middleware(request: NextRequest) {
    const studentProfile = request.cookies.get(`studentProfile`)

    const url = request.nextUrl.clone()
    if (studentProfile) {
        url.pathname = '/cabinet'
        return NextResponse.redirect(url)
    }
}

export const config = {
    matcher: ['/', '/login'],
}
