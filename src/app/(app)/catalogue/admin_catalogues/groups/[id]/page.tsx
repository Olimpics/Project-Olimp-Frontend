'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import DataTable from '@/components/ui/DataTable'
import { apiService } from '@/services/axiosService'

interface GroupDetails {
  idGroup: number
  groupCode: string
  numberOfStudents: number
  curatorName?: string
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

interface StudentSelection {
    id: number
    name: string
    disciplines: { name: string, color: string }[]
}

interface StudySubject {
    name: string
    hours: number
    credits: number
}

interface SemesterPlan {
    semesterNumber: number
    subjects: StudySubject[]
}

interface StudentRating {
    id: number
    name: string
    averageGrade: number
}

const mockStudentSelections: StudentSelection[] = [
    {
        id: 1,
        name: 'Іванов Іван Іванович',
        disciplines: [
            { name: 'Хмарні технології', color: 'bg-blue-100 text-blue-700' },
            { name: 'Штучний інтелект', color: 'bg-purple-100 text-purple-700' },
            { name: 'Блокчейн', color: 'bg-emerald-100 text-emerald-700' }
        ]
    },
    {
        id: 2,
        name: 'Петров Петро Петрович',
        disciplines: [
            { name: 'Кібербезпека', color: 'bg-rose-100 text-rose-700' },
            { name: 'Аналіз даних', color: 'bg-amber-100 text-amber-700' }
        ]
    },
    {
        id: 3,
        name: 'Сидоров Сидір Сидорович',
        disciplines: [
            { name: 'Мобільна розробка', color: 'bg-indigo-100 text-indigo-700' },
            { name: 'Інтернет речей', color: 'bg-teal-100 text-teal-700' },
            { name: 'UI/UX Дизайн', color: 'bg-fuchsia-100 text-fuchsia-700' }
        ]
    },
    {
        id: 4,
        name: 'Коваленко Ганна Олександрівна',
        disciplines: [
            { name: 'Штучний інтелект', color: 'bg-purple-100 text-purple-700' },
            { name: 'Хмарні технології', color: 'bg-blue-100 text-blue-700' }
        ]
    },
    {
        id: 5,
        name: 'Бондаренко Олексій Сергійович',
        disciplines: [
            { name: 'Блокчейн', color: 'bg-emerald-100 text-emerald-700' },
            { name: 'Аналіз даних', color: 'bg-amber-100 text-amber-700' }
        ]
    }
]

const mockStudyPlan: SemesterPlan[] = [
    {
        semesterNumber: 5,
        subjects: [
            { name: 'Програмування на Java', hours: 120, credits: 4 },
            { name: 'Комп’ютерні мережі', hours: 150, credits: 5 },
            { name: 'Теорія алгоритмів', hours: 90, credits: 3 },
            { name: 'Проектування БД', hours: 120, credits: 4 },
            { name: 'Філософія', hours: 60, credits: 2 }
        ]
    },
    {
        semesterNumber: 6,
        subjects: [
            { name: 'Розробка Web-застосунків', hours: 150, credits: 5 },
            { name: 'Тестування ПЗ', hours: 120, credits: 4 },
            { name: 'Операційні системи', hours: 120, credits: 4 },
            { name: 'Правознавство', hours: 60, credits: 2 },
            { name: 'Чисельні методи', hours: 90, credits: 3 }
        ]
    }
]

const mockRatings: StudentRating[] = [
    { id: 1, name: 'Іванов Іван Іванович', averageGrade: 95.5 },
    { id: 2, name: 'Коваленко Ганна Олександрівна', averageGrade: 92.8 },
    { id: 3, name: 'Петров Петро Петрович', averageGrade: 88.4 },
    { id: 4, name: 'Шевченко Олена Вікторівна', averageGrade: 85.2 },
    { id: 5, name: 'Бондаренко Олексій Сергійович', averageGrade: 82.0 },
    { id: 6, name: 'Ткаченко Марія Ігорівна', averageGrade: 78.5 },
    { id: 7, name: 'Мельник Дмитро Володимирович', averageGrade: 75.0 },
]

const GroupDetailsPage = () => {
  const { id } = useParams()
  const [group, setGroup] = useState<GroupDetails | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Загальна інформація')
  const [academicYear, setAcademicYear] = useState('2025/2026')
  const [selectedSemester, setSelectedSemester] = useState(mockStudyPlan[0].semesterNumber)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const mockData: GroupDetails = {
          idGroup: Number(id),
          groupCode: 'КН-31',
          numberOfStudents: 25,
          curatorName: 'Петренко Олександр Миколайович',
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
              Куратор: {group.curatorName || 'Не вказано'}
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

          {activeTab === 'Вибіркові дисципліни' && (
            <div className="space-y-4">
                <div className="flex justify-end items-center gap-2">
                    <label htmlFor="academicYear" className="text-sm font-medium text-gray-700">Навчальний рік:</label>
                    <select 
                        id="academicYear"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="2024/2025">2024/2025</option>
                        <option value="2025/2026">2025/2026</option>
                        <option value="2026/2027">2026/2027</option>
                    </select>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10">
                    <div className="divide-y divide-gray-100">
                        {mockStudentSelections.map((selection) => (
                            <div key={selection.id} className="py-8 first:pt-0 last:pb-0">
                                <h4 className="text-lg font-bold text-gray-900 mb-4">{selection.name}</h4>
                                <div className="flex flex-wrap gap-3">
                                    {selection.disciplines.map((discipline, idx) => (
                                        <span 
                                            key={idx}
                                            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${discipline.color} border border-transparent hover:border-current transition-colors`}
                                        >
                                            {discipline.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'Навчальний план' && (
            <div className="space-y-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {mockStudyPlan.map((sem) => (
                        <button
                            key={sem.semesterNumber}
                            onClick={() => setSelectedSemester(sem.semesterNumber)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                selectedSemester === sem.semesterNumber
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            Семестр {sem.semesterNumber}
                        </button>
                    ))}
                </div>

                {mockStudyPlan.filter(s => s.semesterNumber === selectedSemester).map((sem) => {
                    const totalHours = sem.subjects.reduce((sum, s) => sum + s.hours, 0)
                    const totalCredits = sem.subjects.reduce((sum, s) => sum + s.credits, 0)

                    return (
                        <div key={sem.semesterNumber} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50">
                                    <tr className="border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Назва дисципліни</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Години</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Кредити ECTS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sem.subjects.map((subject, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3.5 text-sm text-gray-700 font-medium">{subject.name}</td>
                                            <td className="px-6 py-3.5 text-sm text-gray-600">{subject.hours}</td>
                                            <td className="px-6 py-3.5 text-sm text-gray-600 text-right">{subject.credits}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50/80 border-t border-gray-100">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">Всього</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{totalHours}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{totalCredits}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )
                })}
            </div>
          )}

          {activeTab === 'Рейтинг групи' && (
            <div className="space-y-8">
                <div className="flex justify-end items-center gap-2">
                    <label htmlFor="academicYearRating" className="text-sm font-medium text-gray-700">Навчальний рік:</label>
                    <select 
                        id="academicYearRating"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="2024/2025">2024/2025</option>
                        <option value="2025/2026">2025/2026</option>
                        <option value="2026/2027">2026/2027</option>
                    </select>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider w-20 text-center">Місце</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">ПІБ</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider w-40 text-center">Середній бал</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Прогрес</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockRatings.map((rating, idx) => {
                                const isTop3 = idx < 3
                                return (
                                    <tr key={rating.id} className="hover:bg-gray-50 transition-colors">
                                        <td className={`px-8 py-5 text-center font-bold text-lg ${isTop3 ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {idx + 1}
                                        </td>
                                        <td className="px-8 py-5 text-sm md:text-base text-gray-800 font-medium">
                                            {rating.name}
                                        </td>
                                        <td className="px-8 py-5 text-center text-sm md:text-base font-bold text-gray-700">
                                            {rating.averageGrade.toFixed(1)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                <div 
                                                    className="bg-blue-500 h-full rounded-full" 
                                                    style={{ width: `${rating.averageGrade}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { 
                            label: 'Середній бал групи', 
                            value: (mockRatings.reduce((a, b) => a + b.averageGrade, 0) / mockRatings.length).toFixed(1) 
                        },
                        { 
                            label: 'Найвищий бал', 
                            value: Math.max(...mockRatings.map(r => r.averageGrade)).toFixed(1) 
                        },
                        { 
                            label: 'Кількість студентів', 
                            value: mockRatings.length 
                        }
                    ].map((card, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
                            <span className="text-xs md:text-sm text-gray-400 uppercase font-bold tracking-wider mb-2">{card.label}</span>
                            <span className="text-2xl md:text-3xl font-bold text-gray-900">{card.value}</span>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {activeTab !== 'Загальна інформація' && 
           activeTab !== 'Вибіркові дисципліни' && 
           activeTab !== 'Навчальний план' && 
           activeTab !== 'Рейтинг групи' && (
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
