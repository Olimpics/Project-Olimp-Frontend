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
  { name: 'Додаткові бали', link: ROUTES.additionalScores },
  { name: 'Архів балів', link: '#' },
  { name: 'Рейтинги', link: '#' },
  { name: 'Контакти, інформація', link: '##' },
  { name: 'Новини', link: '###' },
  { name: 'Logout', link: ROUTES.mainpage }
]

const headerLinksAdmin = [
  { name: 'Особистий кабінет', link: ROUTES.cabinet },
  { name: 'Каталоги', link: ROUTES.catalogue },
  { name: 'Додаткові бали', link: ROUTES.additionalScores },
  { name: 'Архів балів', link: '#' },
  { name: 'Вибіркові дисципліни', link: ROUTES.courseCatalogue },
  { name: 'Періоди вибірних дисциплін', link: ROUTES.periods },
  { name: 'Параметри', link: ROUTES.parameters },
  { name: 'Рейтинги', link: '#' },
  { name: 'Аналітика', link: '##' },
  { name: 'Новини', link: '###' },
  { name: 'Logout', link: ROUTES.mainpage }
]

const headerLinksCatalogues = [
  { name: 'Дисципліни', link: ROUTES.adminCatalogue },
  { name: 'Студенти', link: ROUTES.adminStudentsCatalogue },
  { name: 'Факультети', link: ROUTES.adminFacultyCatalogue },
  { name: 'Кафедра', link: ROUTES.adminDepartmentsCatalogue },
  { name: "Зв'язні групи", link: ROUTES.adminBoundedCatalogue },
  { name: 'Навчальні програми', link: ROUTES.adminEduProgCatalogue },
  { name: "Групи", link: ROUTES.adminUnGroups },
]

const headerLinksUnlogin = [
  { name: 'Project Olimp', link: ROUTES.mainpage }
]

interface Notification {
  idNotification: number
  title: string
  message: string
}

interface Faculty {
  idFaculty: number,
  nameFaculty: string,
  abbreviation: string
}

export const Navigation: FunctionComponent = () => {
  const pathname = usePathname()
  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCataloguesOpen, setIsCataloguesOpen] = useState(false)
  const [isRatingsOpen, setIsRatingsOpen] = useState(false)
  const [isArchiveScoresOpen, setIsArchiveScoresOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userId, setUserId] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [roleId, setRoleId] = useState<number | null>(null)
  const [faculties, setFaculties] = useState<Faculty[] | null>(null)

  const fetchFaculties = async () => {

  }

  useEffect(() => {
    const init = async () => {
      const studentProfileString = getCookie(USER_PROFLE)

      if (!studentProfileString) {
        setIsLoggedIn(false)
        setUserId(null)
        setIsAdmin(false)
        setRoleId(null)
        setNotifications([])
        return
      }

      try {
        const studentProfile = JSON.parse(studentProfileString)
        const uid = studentProfile?.userId
        const admin = studentProfile?.isAdmin
        const role = studentProfile?.roleId

        if (uid) {
          setIsLoggedIn(true)
          setUserId(uid)
          setIsAdmin(!!admin)
          setRoleId(role ?? null)

          try {
            const res = await fetch(
              `http://localhost:5154/api/Notification/user/${uid}?isRead=false`
            )
            const data = await res.json()


            if (Array.isArray(data.items)) {
              setNotifications(data.items)
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

    const fetchFaculties = async () => {
      try {
        const res = await fetch('http://localhost:5154/api/Faculty')
        const data = await res.json()

        if (Array.isArray(data)) {
          setFaculties(data)
        } else if (Array.isArray(data.faculties)) {
          setFaculties(data.faculties)
        } else {
          console.warn('Unexpected faculty format', data)
          setFaculties([])
        }

      } catch (err) {
        console.error('Failed to fetch faculties:', err)
        setFaculties([])
      }
    }

    fetchFaculties()
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
    ? isAdmin
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
            <aside className="fixed top-0 right-0 h-full sm:w-80 w-full bg-white z-50 shadow-lg p-6 flex flex-col gap-4 overflow-y-auto">
              {links.map((el) => {
                const isLogout = el.name === 'Logout'
                const isCatalogues = el.name === 'Каталоги'
                const isRatings = el.name === 'Рейтинги'
                const isArchiveScores = el.name === 'Архів балів'

                if (isLogout) {
                  return (
                    <button
                      key={el.name}
                      onClick={handleLogout}
                      className="text-red-600 font-medium text-left text-xl"
                    >
                      {el.name}
                    </button>
                  )
                }

                if (isArchiveScores && userId !== null) {
                  return (
                    <div key={el.name} className="flex flex-col">
                      <button
                        onClick={() => setIsArchiveScoresOpen(prev => !prev)}
                        className="flex justify-between items-center text-gray-800 font-medium text-xl"
                      >
                        {el.name}
                        <span
                          className={clsx(
                            'transition-transform',
                            isArchiveScoresOpen && 'rotate-180'
                          )}
                        >
                          ▼
                        </span>
                      </button>

                      {isArchiveScoresOpen && (
                        <div className="ml-4 mt-2 flex flex-col gap-2">
                          {faculties?.map((faculty) => (
                            <Link
                              key={faculty.idFaculty}
                              href={`${ROUTES.archiveScores}/${faculty.idFaculty}`}
                              onClick={() => {
                                setIsMenuOpen(false)
                                setIsArchiveScoresOpen(false)
                              }}
                              className="text-gray-600 text-lg"
                            >
                              {faculty.nameFaculty} ({faculty.abbreviation})
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                if (isRatings && userId !== null) {
                  return (
                    <div key={el.name} className="flex flex-col">
                      <button
                        onClick={() => setIsRatingsOpen(prev => !prev)}
                        className="flex justify-between items-center text-gray-800 font-medium text-xl"
                      >
                        {el.name}
                        <span
                          className={clsx(
                            'transition-transform',
                            isRatingsOpen && 'rotate-180'
                          )}
                        >
                          ▼
                        </span>
                      </button>

                      {isRatingsOpen && (
                        <div className="ml-4 mt-2 flex flex-col gap-2">
                          {faculties?.map((faculty) => (
                            <Link
                              key={faculty.idFaculty}
                              href={`/ratings/${faculty.idFaculty}`}
                              onClick={() => {
                                setIsMenuOpen(false)
                                setIsRatingsOpen(false)
                              }}
                              className="text-gray-600 text-lg"
                            >
                              {faculty.nameFaculty} ({faculty.abbreviation})
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                if (isCatalogues) {
                  if (!isAdmin) {
                    return (
                      <Link
                        key={el.link}
                        href={el.link}
                        onClick={() => setIsMenuOpen(false)}
                        className={clsx(
                          'text-gray-800 font-medium text-xl',
                          pathname === el.link && 'text-blue-500'
                        )}
                      >
                        {el.name}
                      </Link>
                    )
                  }

                  if (isAdmin) {
                    return (
                      <div key={el.name} className="flex flex-col">
                        <button
                          onClick={() => setIsCataloguesOpen(prev => !prev)}
                          className="flex justify-between items-center text-gray-800 font-medium text-xl"
                        >
                          {el.name}
                          <span
                            className={clsx(
                              'transition-transform',
                              isCataloguesOpen && 'rotate-180'
                            )}
                          >
                            ▼
                          </span>
                        </button>

                        {isCataloguesOpen && (
                          <div className="ml-4 mt-2 flex flex-col gap-2">
                            {headerLinksCatalogues.map((sub) => (
                              <Link
                                key={sub.link}
                                href={sub.link}
                                onClick={() => {
                                  setIsMenuOpen(false)
                                  setIsCataloguesOpen(false)
                                }}
                                className={clsx(
                                  'text-gray-600 text-lg',
                                  pathname === sub.link && 'text-blue-500'
                                )}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }
                }

                return (
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