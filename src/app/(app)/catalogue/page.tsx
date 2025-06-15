'use client'

import { useState, useEffect } from 'react'
import { AdminStudentCatalogue } from '@/app/(app)/catalogue/admin_catalogues/admin_students_catalogue'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { StudentDisciplinesCatalogue } from '@/app/(app)/catalogue/stud_catalogue/stud_disciplines_catalogue';
import { AdminDisciplinesCatalogue } from '@/app/(app)/catalogue/admin_catalogues/admin_disciplines_catalogue';

const Page = () => {
    const [activeTab, setActiveTab] = useState(1)
    const userProfileString = getCookie(USER_PROFLE)
    const user = JSON.parse(userProfileString)
    const roleId = (user.roleId?.toString() ?? null)

    const renderContent = () => {
        if (activeTab === 1) {
            if (roleId === '2') return <AdminDisciplinesCatalogue />
            if (roleId === '1') return <StudentDisciplinesCatalogue />
        }
        else if (activeTab ===2) {
            if (roleId === '2') return <AdminStudentCatalogue />
        }


        return <div>Неверная вкладка</div>
    }

    return (
      <div>
          {roleId === '2' && <>
              <div className="flex justify-center mb-6 border-b border-gray-300">
                  <button
                    onClick={() => setActiveTab(1)}
                    className={`px-6 py-3 text-lg font-semibold  ${
                      activeTab === 1
                        ? 'border-b-4 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-blue-500'
                    }`}
                  >
                      Дисципліни
                  </button>
                  <button
                    onClick={() => setActiveTab(2)}
                    className={`px-6 py-3 text-lg font-semibold  ${
                      activeTab === 2
                        ? 'border-b-4 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-blue-500'
                    }`}
                  >
                      Студенти
                  </button>
              </div>
          </>}

          {renderContent()}
      </div>
    )
}

export default Page
