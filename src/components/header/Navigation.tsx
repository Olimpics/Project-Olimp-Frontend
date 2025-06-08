'use client'

import { FunctionComponent, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import Cookies from 'js-cookie'
import { ROUTES } from '@/constants'
import HamburgerSvg from '@/asssets/svgs/hamburger-svg'
import { STUDENT_PROFLE } from '@/constants/cookies';
import { getCookie } from '@/services/cookie-servies';

const headerLinks = [
    /*{ name: 'Project Olimp', link: ROUTES.mainpage },*/
    { name: 'Особистий кабінет', link: ROUTES.cabinet },
    { name: 'Вибір дисциплін', link: ROUTES.catalogue },
    /*{ name: 'Каталог ВБ', link: ROUTES.disciplines },*/
    { name: 'Logout', link: ROUTES.mainpage }
]

const headerLinksUnlogin = [
    { name: 'Project Olimp', link: ROUTES.mainpage }
]

export const Navigation: FunctionComponent = () => {
    const pathname = usePathname()
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        const checkLogin = () => {
            const studentProfile =getCookie(STUDENT_PROFLE)
            setIsLoggedIn(!!studentProfile)
        }

        checkLogin()

        const handleStorageUpdate = () => checkLogin()
        const handleCustomEvent = () => checkLogin()

        window.addEventListener('storage', handleStorageUpdate)
        window.addEventListener('student-auth-changed', handleCustomEvent)

        return () => {
            window.removeEventListener('storage', handleStorageUpdate)
            window.removeEventListener('student-auth-changed', handleCustomEvent)
        }
    }, [])

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault()
        Cookies.remove(STUDENT_PROFLE)
        window.dispatchEvent(new Event("student-auth-changed"))
        router.push(ROUTES.mainpage)
        setIsMenuOpen(false)
    }

    const links = isLoggedIn ? headerLinks : headerLinksUnlogin

    return (
      <div className='flex justify-center'>
        <div className='flex justify-between w-18/19'>
          <Link
            key={ROUTES.mainpage}
            href={ROUTES.mainpage}
            className={clsx(
              'items-center font-medium rounded-3xl bg-white py-1 px-3 text-main',
            )}
          >
            Project Olimp
          </Link>
          
          <div className="flex">
            <button type="button" className="relative p-2 rounded-full bg-white shadow-md hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>

              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                3
              </span>
            </button>
            <nav className="gap-10 flex m0 px-5">
                <button onClick={() => setIsMenuOpen(prev => !prev)}>
                    <HamburgerSvg  className="w-8 h-8 text-white" />
                </button>
            </nav>
          </div>
          
          {isMenuOpen && (
            <>
                <div
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <aside className="fixed top-0 right-0 h-full sm:w-64 w-full bg-white z-50 shadow-lg p-6 flex flex-col  gap-4">
                    {links.map((el) => {
                        const isLogout = el.name === 'Logout'
                        return isLogout ? (
                          <button
                            key={el.name}
                            onClick={handleLogout}
                            className="text-red-600 font-medium text-left"
                          >
                              {el.name}
                          </button>
                        ) : (
                          <Link
                            key={el.link}
                            href={el.link}
                            onClick={() => setIsMenuOpen(false)}
                            className={clsx(
                              'text-gray-800 font-medium',
                              pathname === el.link && 'text-blue-500'
                            )}
                          >
                              {el.name}
                          </Link>
                        )
                    })}
                </aside>
            </>
          )}
        </div>
      </div>
    )
}
