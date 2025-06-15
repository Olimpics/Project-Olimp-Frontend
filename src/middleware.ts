import { NextRequest, NextResponse } from 'next/server'
import { USER_PROFLE } from '@/constants/cookies';

export default function middleware(request: NextRequest) {
    const studentProfile = request.cookies.get(USER_PROFLE)
    const { pathname } = request.nextUrl

    const url = request.nextUrl.clone()

    if (pathname === '/login' && studentProfile) {
        url.pathname = '/cabinet'
        return NextResponse.redirect(url)
    }

    const protectedRoutes = ['/cabinet', '/catalogue',"/disciplines","/stud_disciplines_catalogue.tsx"]
    if (protectedRoutes.some((route) => pathname.startsWith(route)) && !studentProfile) {
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (pathname === '/') {
        url.pathname = studentProfile ? '/cabinet' : '/login'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}
