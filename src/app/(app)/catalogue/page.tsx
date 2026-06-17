'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { StudentDisciplinesCatalogue } from '@/app/(app)/catalogue/stud_catalogue/stud_disciplines_catalogue'
import AdminDisciplinesCatalogue from '@/app/(app)/catalogue/admin_catalogues/disciplines/page'
import { apiService } from '@/services/axiosService'

const CatalogueContent = () => {
  const searchParams = useSearchParams()
  const activeTabParam = parseInt(searchParams.get('activeTab') || '1', 10)

  const [activeTab, setActiveTab] = useState<number>(activeTabParam)
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userProfileString = getCookie(USER_PROFLE)
        if (userProfileString) {
          const parsed = JSON.parse(userProfileString)
          setUser(parsed)
        }
      } catch (e) {
        console.error('Failed to initialize user', e)
      }
    }
    initializeUser()
  }, [])

  const renderContent = () => {
    if (!user) return null

    const isAdmin = user.isAdmin || user.IsAdmin

    if (activeTab === 1) {
      if (isAdmin) return <AdminDisciplinesCatalogue />
      return <StudentDisciplinesCatalogue />
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

const Page = () => {
  return (
    <Suspense fallback={<div className="text-center py-10">Завантаження...</div>}>
      <CatalogueContent />
    </Suspense>
  )
}

export default Page