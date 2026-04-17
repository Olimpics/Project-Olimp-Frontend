'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import DataTable from '@/components/ui/DataTable'
import { apiService } from '@/services/axiosService'

interface GroupDetails {
  idGroup: number
  groupCode: string
  numberOfStudents: number
  adminId: number
  degreeId: number
  course: number
  facultyId: number
  facultyName: string
  departmentId: number
  departmentName: string
  idEducationalProgram: number
  educationalProgramName: string
  idSpeciality: number
  specialityName: string
  admissionYear: number
  idStudyForm: number
  idSpecialization: number
  specializationName: string
  isAccelerated: boolean
}

interface Student {
  idStudent: number
  userId: number
  nameStudent: string
  emailStudent: string
  eductionalStatus: string
}

const GroupDetailsPage = () => {
  const { id } = useParams()
  const [group, setGroup] = useState<GroupDetails | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Загальна інформація')

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setLoading(true)
      try {
        // Fetch group details (using mock for now as per current structure, but could be API)
        // In a real scenario, we would use: const groupData = await apiService.get<GroupDetails>(`Group/${id}`)
        const mockData: GroupDetails = {
          idGroup: Number(id),
          groupCode: 'КН-31',
          numberOfStudents: 25,
          adminId: 1,
          degreeId: 1,
          course: 3,
          facultyId: 101,
          facultyName: 'Факультет комп’ютерних наук та технологій',
          departmentId: 201,
          departmentName: 'Кафедра програмної інженерії',
          idEducationalProgram: 301,
          educationalProgramName: 'Інженерія програмного забезпечення',
          idSpeciality: 121,
          specialityName: 'Інженерія програмного забезпечення',
          admissionYear: 2022,
          idStudyForm: 1,
          idSpecialization: 401,
          specializationName: 'Розробка та тестування ПЗ',
          isAccelerated: false,
        }
        setGroup(mockData)

        // Fetch students from the specified API
        const studentsData = await apiService.get<Student[]>(`Group/${id}/students`)
        setStudents(studentsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading && !group) return <div className="p-8 text-center text-gray-500">Завантаження...</div>
  if (!group) return <div className="p-8 text-center text-red-500">Групу не знайдено</div>

  const studyFormMap = (id: number) => {
    switch (id) {
      case 1: return 'Денна'
      case 2: return 'Заочна'
      default: return 'Не вказано'
    }
  }

  const tabs = [
    'Загальна інформація',
    'Вибіркові дисципліни',
    'Навчальний план',
    'Рейтинг групи',
  ]

  const infoGridItems = [
    { label: 'Факультет', value: group.facultyName },
    { label: 'Кафедра', value: group.departmentName },
    { label: 'Освітня програма', value: group.educationalProgramName },
    { label: 'Спеціальність', value: group.specialityName },
    { label: 'Спеціалізація', value: group.specializationName },
    { label: 'Курс навчання', value: `${group.course} курс` },
    { label: 'Рік вступу', value: group.admissionYear },
    { label: 'Форма навчання', value: studyFormMap(group.idStudyForm) },
    { label: 'Скорочений термін навчання', value: group.isAccelerated ? 'Так' : 'Ні' },
  ]

  const studentColumns = [
    { header: '№', accessor: 'idStudent' as const, render: (_: any, index: number) => index + 1 },
    { header: 'ПІБ', accessor: 'nameStudent' as const },
    { header: 'Email', accessor: 'emailStudent' as const },
    { header: 'Статус', accessor: 'eductionalStatus' as const },
  ]

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans flex flex-col">
      <div className="w-full bg-white border-b border-gray-200 px-6 pt-6 z-0">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end">
          <div className="mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Група {group.groupCode}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Кількість студентів: {students.length}
            </p>
          </div>
          
          <div className="flex space-x-6 lg:space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                  activeTab === tab
                    ? 'text-[#2563eb] border-[#2563eb]'
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-grow p-6 md:p-8 max-w-[1440px] mx-auto w-full">
        <div className="space-y-6">
          {activeTab === 'Загальна інформація' && (
            <>
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-y-10">
                  {infoGridItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-xs md:text-sm text-gray-400 mb-1">
                        {item.label}
                      </span>
                      <span className="text-sm md:text-base text-gray-800 font-normal">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">Список студентів</h3>
                </div>
                <div className="p-0">
                    <DataTable 
                        columns={studentColumns as any} 
                        data={students} 
                        isActionEnabled={false}
                        emptyMessage={loading ? 'Завантаження списку...' : 'Студентів не знайдено'}
                    />
                </div>
              </section>
            </>
          )}
          {activeTab !== 'Загальна інформація' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              Контент вкладки "{activeTab}" знаходиться в розробці.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default GroupDetailsPage
