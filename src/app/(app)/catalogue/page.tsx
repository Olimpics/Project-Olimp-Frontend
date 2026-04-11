'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { StudentDisciplinesCatalogue } from '@/app/(app)/catalogue/stud_catalogue/stud_disciplines_catalogue'
import { AdminDisciplinesCatalogue } from '@/app/(app)/catalogue/admin_catalogues/disciplines/page'

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
    } 

    return <div>Невірна вкладка</div>
  }

  if (!user) {
    return <div className="text-center py-10">Завантаження...</div>
  }

  return (
    <div>
      {renderContent()}
    </div>
  )
}

export default Page