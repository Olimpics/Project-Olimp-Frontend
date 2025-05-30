'use client'

import { FunctionComponent, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'

import { ROUTES } from '@/constants'

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

    useEffect(() => {
        const checkLogin = () => {
            const studentProfile = localStorage.getItem("studentProfile")
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
        localStorage.removeItem("studentProfile")
        window.dispatchEvent(new Event("student-auth-changed"))
        router.push(ROUTES.mainpage)
    }

    const links = isLoggedIn ? headerLinks : headerLinksUnlogin

    return (
        <nav className="gap-10 flex ml-10">
            {links.map((el) => {
                const isActive = pathname === el.link
                const isLogout = el.name === 'Logout'

                return isLogout ? (
                    <button
                        key={el.name}
                        onClick={handleLogout}
                        className={clsx(
                            'font-medium ml-280 bg-red-500 py-1 px-3 rounded-3xl cursor-pointer',
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
        </nav>
    )
}