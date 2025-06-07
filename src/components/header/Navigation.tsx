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
    { name: 'Project Olimp', link: ROUTES.mainpage },
    { name: 'Особистий кабінет', link: ROUTES.cabinet },
    { name: 'Каталог ВБ', link: ROUTES.catalogue },
    { name: 'Вибір дисциплін', link: ROUTES.disciplines },
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
      <>
          <nav className="gap-10 flex m0 px-5">
              {links.map((el) => {
                  const isActive = pathname === el.link
                  const isLogout = el.name === 'Logout'

                  return isLogout ? (
                    <button
                      key={el.name}
                      onClick={handleLogout}
                      className={clsx(
                        'font-medium ml-auto mr-4 bg-red-500 py-1 px-3 rounded-3xl cursor-pointer',
                        isActive
                          ? 'rounded-3xl bg-white py-1 px-3 text-main'
                          : 'text-white'
                      )}
                    >
                        {el.name}
                    </button>
                  ) : (
                    <Link
                      key={el.link}
                      href={el.link}
                      className={clsx(
                        'flex items-center font-medium',
                        isActive
                          ? 'rounded-3xl bg-white py-1 px-3 text-main'
                          : 'text-white'
                      )}
                    >
                        {el.name}
                    </Link>
                  )
              })}
              <button onClick={() => setIsMenuOpen(prev => !prev)}>
                  <HamburgerSvg  className="w-8 h-8 text-white" />
              </button>
          </nav>

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
      </>
    )
}
