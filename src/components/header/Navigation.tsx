'use client'
import { FunctionComponent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

import { ROUTES } from '@/constants'


const headerLinks = [
    { name: 'Особистий кабінет', link: ROUTES.cabinet },
    { name: 'Каталог ВБ', link: ROUTES.catalogue },
    { name: 'Вибір дисциплін', link: ROUTES.disciplines },
]

export const Navigation: FunctionComponent = () => {
    const pathname = usePathname()
    return (
        <nav className="gap-10 flex">
            {headerLinks.map((el) => {
                return (
                    <Link
                        className={clsx(
                            'flex items-center font-medium',
                            pathname === el.link
                                ? 'rounded-3xl bg-white py-1 px-3 flex items-center text-main'
                                : 'text-white'
                        )}
                        key={el.link}
                        href={el.link}
                    >
                        {el.name}
                    </Link>
                )
            })}
        </nav>
    )
}
