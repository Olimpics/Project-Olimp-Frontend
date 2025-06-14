'use client'

import { FunctionComponent, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import Cookies from 'js-cookie'
import { ROUTES } from '@/constants'
import HamburgerSvg from '@/asssets/svgs/hamburger-svg'
import NotificationSvg from '@/asssets/svgs/notification-svg'
import { USER_PROFLE } from '@/constants/cookies'
import { getCookie } from '@/services/cookie-servies'

const headerLinks = [
  { name: 'Особистий кабінет', link: ROUTES.cabinet },
  { name: 'Вибір дисциплін', link: ROUTES.catalogue },
  { name: 'Рейтинги', link: '#' },
  { name: 'Аналітика', link: '##' },
  { name: 'Logout', link: ROUTES.mainpage }
]

interface Notification {
  idNotification: number
  title: string
  message: string
}

const headerLinksUnlogin = [
  { name: 'Project Olimp', link: ROUTES.mainpage }
]

export const Navigation: FunctionComponent = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationFetch, setIsNotificationFetch] = useState<Notification[]>([])

  useEffect(() => {
    const init = async () => {
      const studentProfile = getCookie(USER_PROFLE)

      const studentProfileParsed = JSON.parse(studentProfile)

      console.log(studentProfileParsed)

      if (studentProfile) {
        setIsLoggedIn(true)

        try {
          const res = await fetch(`http://185.237.207.78:5000/api/Notification/user/${studentProfileParsed.userId}?includeRead=false`)
          const data = await res.json()

          if (Array.isArray(data)) {
            setIsNotificationFetch(data)
          } else if (Array.isArray(data.notifications)) {
            setIsNotificationFetch(data.notifications)
          } else {
            console.warn('Unexpected notification format', data)
            setIsNotificationFetch([])
          }
        } catch (error) {
          console.error('Failed to fetch notifications', error)
          setIsNotificationFetch([])
        }
      } else {
        setIsLoggedIn(false)
        setIsNotificationFetch([])
      }
    }

    init()

    const handleStorageUpdate = () => init()
    const handleCustomEvent = () => init()

    window.addEventListener('storage', handleStorageUpdate)
    window.addEventListener('student-auth-changed', handleCustomEvent)

    return () => {
      window.removeEventListener('storage', handleStorageUpdate)
      window.removeEventListener('student-auth-changed', handleCustomEvent)
    }
  }, [])

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    Cookies.remove(USER_PROFLE)
    window.dispatchEvent(new Event('student-auth-changed'))
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
            'flex items-center font-medium rounded-3xl bg-white py-1 px-3 text-main',
          )}
        >
          Project Olimp
        </Link>

        <div className="flex">
          <NotificationSvg
            notifications={Array.isArray(isNotificationFetch)
              ? isNotificationFetch.map(n => ({
                  idNotification: n.idNotification,
                  title: n.title,
                  message: n.message,
                }))
              : []}
          />

          <nav className="gap-10 flex m0 px-5">
            <button onClick={() => setIsMenuOpen(prev => !prev)}>
              <HamburgerSvg className="w-8 h-8 text-white" />
            </button>
          </nav>
        </div>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <aside className="fixed top-0 right-0 h-full sm:w-80 w-full bg-white z-50 shadow-lg p-6 flex flex-col gap-4">
              {links.map((el) => {
                const isLogout = el.name === 'Logout'
                return isLogout ? (
                  <button
                    key={el.name}
                    onClick={handleLogout}
                    className="text-red-600 font-medium text-left text-xl"
                  >
                    {el.name}
                  </button>
                ) : (
                  <Link
                    key={el.link}
                    href={el.link}
                    onClick={() => setIsMenuOpen(false)}
                    className={clsx(
                      'text-gray-800 font-medium text-xl',
                      pathname === el.link && 'text-blue-500 text-xl'
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