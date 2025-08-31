'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import { AdminStudentCatalogue } from '@/app/(app)/catalogue/admin_catalogues/admin_students_catalogue'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { StudentDisciplinesCatalogue } from '@/app/(app)/catalogue/stud_catalogue/stud_disciplines_catalogue'
import { AdminDisciplinesCatalogue } from '@/app/(app)/catalogue/admin_catalogues/admin_disciplines_catalogue'
import { AdminFacultyCatalogue } from '@/app/(app)/catalogue/admin_catalogues/admin_faculty_catalogue'
import { AdminDepartmentCatalogue } from '@/app/(app)/catalogue/admin_catalogues/admin_cath_catalogue'
import { AdminEducationalProgramCatalogue } from '@/app/(app)/catalogue/admin_catalogues/admin_group_catalogue'
import { AdminGroupsCatalogue } from '@/app/(app)/catalogue/admin_catalogues/admin_un_groups'
import { AdminBindLoansPage } from '@/app/(app)/catalogue/admin_catalogues/admin_bounded_catalogue'

const Page = () => {
  const searchParams = useSearchParams()
  const activeTabParam = parseInt(searchParams.get('activeTab') || '1', 10)

  const [activeTab, setActiveTab] = useState<number>(activeTabParam)
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    const userProfileString = getCookie(USER_PROFLE)
    if (userProfileString) {
      try {
        const parsed = JSON.parse(userProfileString)
        setUser(parsed)
      } catch (e) {
        console.error('Failed to parse user profile', e)
      }
    }
  }, [])

  const roleId = user?.roleId?.toString() ?? null

  const renderContent = () => {
    if (activeTab === 1) {
      if (roleId === '2') return <AdminDisciplinesCatalogue />
      if (roleId === '1') return <StudentDisciplinesCatalogue />
    } else if (activeTab === 2) {
      if (roleId === '2') return <AdminStudentCatalogue/> 
    } else if (activeTab === 3) {
      if (roleId === '2') return <AdminFacultyCatalogue />
    } else if (activeTab === 4) {
      return <AdminDepartmentCatalogue />
    } else if (activeTab === 5) {
      return <AdminEducationalProgramCatalogue />
    } else if (activeTab === 6) {
      return <AdminEducationalProgramCatalogue />
    } else if (activeTab === 7) {
      return <AdminGroupsCatalogue />
    } else if (activeTab === 8) {
      return <AdminBindLoansPage />
    }

    return <div>Невірна вкладка</div>
  }

  if (!user) {
    return <div className="text-center py-10">Завантаження...</div>
  }

  return (
    <div>
      {roleId === '2' && (
        <div className="flex justify-center mb-6 border-b border-gray-300">
          {[1, 2, 3, 4, 6, 7, 8].map((tab) => {
            const tabNames: Record<number, string> = {
              1: 'Дисципліни',
              2: 'Студенти',
              3: 'Факультети',
              4: 'Кафедра',
              6: 'Спеціальності',
              7: 'Групи',
              8: "Зв'язні групи",
            }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-lg font-semibold ${
                  activeTab === tab
                    ? 'border-b-4 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                {tabNames[tab]}
              </button>
            )
          })}
        </div>
      )}

      {renderContent()}
    </div>
  )
}

export default Page