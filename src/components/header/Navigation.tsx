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
  { name: 'Контакти, інформація', link: '##' },
  { name: 'Новини', link: '###' },
  { name: 'Logout', link: ROUTES.mainpage }
]

const headerLinksAdmin = [
  { name: 'Особистий кабінет', link: ROUTES.cabinet },
  { name: 'Каталоги', link: ROUTES.catalogue },
  { name: 'Рейтинги', link: '#' },
  { name: 'Аналітика', link: '##' },
  { name: 'Новини', link: '###' },
  { name: 'Logout', link: ROUTES.mainpage }
]

const headerLinksUnlogin = [
  { name: 'Project Olimp', link: ROUTES.mainpage }
]

interface Notification {
  idNotification: number
  title: string
  message: string
}

export const Navigation: FunctionComponent = () => {
  const pathname = usePathname()
  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userId, setUserId] = useState<number | null>(null)
  const [roleId, setRoleId] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => {
      const studentProfileString = getCookie(USER_PROFLE)

      if (!studentProfileString) {
        setIsLoggedIn(false)
        setUserId(null)
        setRoleId(null)
        setNotifications([])
        return
      }

      try {
        const studentProfile = JSON.parse(studentProfileString)
        const uid = studentProfile?.userId
        const role = studentProfile?.roleId

        if (uid) {
          setIsLoggedIn(true)
          setUserId(uid)
          setRoleId(role ?? null)

          try {
            const res = await fetch(
              `http://185.237.207.78:5000/api/Notification/user/${uid}?isRead=false`
            )
            const data = await res.json()

            if (Array.isArray(data)) {
              setNotifications(data)
            } else if (Array.isArray(data.notifications)) {
              setNotifications(data.notifications)
            } else {
              console.warn('Unexpected notification format', data)
              setNotifications([])
            }
          } catch (error) {
            console.error('Failed to fetch notifications', error)
            setNotifications([])
          }
        } else {
          setIsLoggedIn(false)
          setUserId(null)
          setRoleId(null)
          setNotifications([])
        }
      } catch (err) {
        console.error('Error parsing student profile cookie:', err)
        setIsLoggedIn(false)
        setUserId(null)
        setRoleId(null)
        setNotifications([])
      }
    }

    init()

    window.addEventListener('storage', init)
    window.addEventListener('student-auth-changed', init)

    return () => {
      window.removeEventListener('storage', init)
      window.removeEventListener('student-auth-changed', init)
    }
  }, [])

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    if (userId !== null) {
      localStorage.removeItem(`${userId}_permissions`)
    }
    Cookies.remove(USER_PROFLE)
    window.dispatchEvent(new Event('student-auth-changed'))
    router.push(ROUTES.mainpage)
    setIsMenuOpen(false)
  }

  const links = isLoggedIn
    ? roleId === 2
      ? headerLinksAdmin
      : headerLinks
    : headerLinksUnlogin

  return (
    <div className='flex justify-center'>
      <div className='flex justify-between w-18/19'>
        <Link
          key={ROUTES.mainpage}
          href={ROUTES.mainpage}
          className='flex items-center font-medium rounded-3xl bg-white py-1 px-3 text-main'
        >
          Project Olimp
        </Link>

        <div className="flex">
          <NotificationSvg notifications={notifications} />
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