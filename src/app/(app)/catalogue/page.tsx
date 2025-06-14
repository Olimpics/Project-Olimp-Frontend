'use client'

import { useState, useEffect } from 'react'
import { AdminCatalogue } from '@/app/(app)/catalogue/admin_catalogues/admin_catalogue'
import { StudentCatalogue } from '@/app/(app)/catalogue/stud_catalogue/stud_catalogue'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'

const Page = () => {
    const [activeTab, setActiveTab] = useState(1)
    const [roleId, setRoleId] = useState<string | null>(null)
    console.log(`roleIdroleId`,roleId)
    useEffect(() => {
        const userProfileString = getCookie(USER_PROFLE)
        if (userProfileString) {
            try {
                const user = JSON.parse(userProfileString)
                setRoleId(user.roleId?.toString() ?? null)
            } catch (e) {

            }
        }
    }, [roleId])

    const renderContent = () => {
        if (activeTab === 1) {
            if (roleId === '2') return <AdminCatalogue />
            if (roleId === '1') return <StudentCatalogue />
        }

        if (activeTab === 2) {
            return <div>ASDASDASD</div>
        }

        return <div>Неверная вкладка</div>
    }

    return (
      <div>
          <div className="flex justify-center mb-6 border-b border-gray-300">
              <button
                onClick={() => setActiveTab(1)}
                className={`px-6 py-3 text-lg font-semibold  ${
                  activeTab === 1
                    ? 'border-b-4 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                  Каталог
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`px-6 py-3 text-lg font-semibold  ${
                  activeTab === 2
                    ? 'border-b-4 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                  Вкладка 2
              </button>
          </div>


          {renderContent()}
      </div>
    )
}

export default Page
