'use client'
import { FunctionComponent } from 'react'
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

    const user_check = typeof window !== 'undefined' ? localStorage.getItem("studentProfile") : null

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault()
        localStorage.removeItem("studentProfile")
        router.push(ROUTES.mainpage)
    }

    const links = user_check ? headerLinks : headerLinksUnlogin

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
                            'font-medium',
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