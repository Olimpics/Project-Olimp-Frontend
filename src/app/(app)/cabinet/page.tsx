'use client'
import React, { useState, useEffect } from 'react'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { apiService } from '@/services/axiosService' 

interface DisciplineDto {
  idBindMainDisciplines: number
  codeMainDisciplines: string
  nameBindMainDisciplines: string
  loans: number
  formControll?: string
  semestr: number
  educationalProgramName: string
}

interface PlanResponse {
  studentId: number
  studentName: string
  degreeName: string
  mainDisciplinesBySemester: Record<string, DisciplineDto[]>
  additionalDisciplinesBySemester: Record<string, any[]>
}

interface ScheduleItem {
  day: string
  time: string
  subject: string
}

interface AdminRole {
  idRole: number
  nameRole: string
}

const defaultSchedule: ScheduleItem[] = [
  { day: 'Понеділок', time: '08:30 - 10:00', subject: 'Лінійна алгебра' },
  { day: 'Вівторок', time: '10:15 - 11:45', subject: 'Програмування на C#' },
  { day: 'Середа', time: '12:00 - 13:30', subject: 'Бази даних' },
  { day: 'Четвер', time: '14:00 - 15:30', subject: 'Операційні системи' },
  { day: 'П’ятниця', time: '16:00 - 17:30', subject: 'Англійська мова' },
]


export default function Page() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'plan'>('schedule')
  const [planBySemester, setPlanBySemester] = useState<Record<number, DisciplineDto[]>>({})
  const [studentName, setStudentName] = useState('')
  const [degreeName, setDegreeName] = useState('')
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [errorPlan, setErrorPlan] = useState<string | null>(null)
  const [adminRoleName, setAdminRoleName] = useState<string>('')

  useEffect(() => {
    const rawProfile = getCookie(USER_PROFLE)

    if (!rawProfile) {
      console.error('No student profile found in cookie')
      return
    }

    const studentProfile = JSON.parse(rawProfile)
    setStudentName(studentProfile.name)

    if (studentProfile.roleId === 2) {
      fetchAdminRole(studentProfile)
    } else {
      setDegreeName(studentProfile.degreeName || '')

      const fetchPlan = async () => {
        setLoadingPlan(true)
        try {
          const data = await apiService.get<PlanResponse>(
            `StudentPage/disciplines/by-semester/${studentProfile.id}`
          )
          const grouped = Object.fromEntries(
            Object.entries(data.mainDisciplinesBySemester).map(([key, value]) => [
              Number(key),
              value,
            ])
          )
          setPlanBySemester(grouped)
        } catch (error) {
          console.error(error)
          setErrorPlan('Не вдалося завантажити навчальний план')
        } finally {
          setLoadingPlan(false)
        }
      }

      fetchPlan()
    }
  }, [])

  const fetchAdminRole = async (studentProfile: any) => {
    try {
      const adminFetch = await apiService.get<AdminRole>(`Role/${studentProfile.roleId}`)
      setAdminRoleName(adminFetch.nameRole)
    } catch (error) {
      console.error('Не вдалося завантажити роль адміністратора', error)
    }
  }

  useEffect(() => {
    if (adminRoleName) {
      setDegreeName(adminRoleName)
    }
  }, [adminRoleName])


  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
      {/* Sidebar */}
      <section className="w-full lg:w-72 text-center mb-6 lg:mb-0">
        {studentName ? (
          <>
            <h2 className="text-xl sm:text-2xl font-semibold">{studentName}</h2>
            <p className="text-sm sm:text-base text-gray-600">{degreeName}</p>
          </>
        ) : (
          <p className="text-gray-500">Завантаження профілю...</p>
        )}
      </section>

      {/* Content */}
      <section className="flex-1 bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md">
        <div className="flex space-x-8 border-b pb-2 mb-4 overflow-x-auto">
          {['schedule', 'plan'].map((tab) => (
            <button
              key={tab}
              className={`whitespace-nowrap pb-1 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'border-b-2 border-transparent hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab as 'schedule' | 'plan')}
            >
              {tab === 'schedule' ? 'Розклад занять' : 'Навчальний план'}
            </button>
          ))}
        </div>

        {activeTab === 'schedule' ? (
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="table-fixed w-full min-w-[600px] border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="hidden sm:table-cell w-1/3 border px-3 py-2 text-left text-sm sm:text-base">День</th>
                  <th className="w-1/3 border px-3 py-2 text-left text-sm sm:text-base">Час</th>
                  <th className="w-1/3 border px-3 py-2 text-left text-sm sm:text-base">Предмет</th>
                </tr>
              </thead>
              <tbody>
                {defaultSchedule.map((item, idx) => (
                  <tr key={idx} className={idx % 2 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="hidden sm:table-cell border px-3 py-2 text-sm">{item.day}</td>
                    <td className="border px-3 py-2 text-sm">{item.time}</td>
                    <td className="border px-3 py-2 text-sm">{item.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            {loadingPlan && <p>Завантаження навчального плану...</p>}
            {errorPlan && <p className="text-red-600">{errorPlan}</p>}
            {!loadingPlan && !errorPlan && (
              <div className="space-y-8">
                {Object.keys(planBySemester)
                  .map(Number)
                  .sort((a, b) => a - b)
                  .map((sem) => (
                    <div key={sem}>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">
                        {sem} семестр
                      </h3>
                      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                        <table className="table-fixed w-full min-w-[400px] border border-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="w-1/2 border px-3 py-2 text-left text-sm sm:text-base">
                                Дисципліна
                              </th>
                              <th className="w-1/2 border px-3 py-2 text-left text-sm sm:text-base">
                                Форма контролю
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {planBySemester[sem]?.length ? (
                              planBySemester[sem].map((disc, idx) => (
                                <tr key={disc.idBindMainDisciplines} className={idx % 2 ? 'bg-gray-50' : 'bg-white'}>
                                  <td className="border px-3 py-2 text-sm sm:text-base">
                                    {disc.nameBindMainDisciplines}
                                  </td>
                                  <td className="border px-3 py-2 text-sm sm:text-base">
                                    {disc.formControll || '-'}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={2} className="border px-3 py-4 text-center italic text-gray-500 text-sm">
                                  Немає дисциплін
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}