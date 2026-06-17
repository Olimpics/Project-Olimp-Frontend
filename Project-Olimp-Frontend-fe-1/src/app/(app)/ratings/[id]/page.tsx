'use client'

import React, { useState, useEffect } from 'react'
import DataTable from '@/components/ui/DataTable'

interface Department {
  id: number
  name: string
  programs: EducationalProgram[]
}

interface EducationalProgram {
  id: number
  name: string
}

interface RatingEntry {
  id: number
  fullName: string
  group: string
  score: number
}

const RatingPage = () => {
  const [selectedCourse, setSelectedCourse] = useState<number>(1)
  const [selectedSemester, setSelectedSemester] = useState<number>(1)
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [ratings, setRatings] = useState<RatingEntry[]>([])

  // Mock data initialization
  useEffect(() => {
    const mockDepartments: Department[] = [
      {
        id: 1,
        name: 'Кафедра програмної інженерії',
        programs: [
          { id: 101, name: 'Інженерія програмного забезпечення' },
          { id: 102, name: 'Комп’ютерні науки' },
        ],
      },
      {
        id: 2,
        name: 'Кафедра комп’ютерних систем',
        programs: [
          { id: 201, name: 'Системна інженерія' },
          { id: 202, name: 'Кібербезпека' },
        ],
      },
    ]
    setDepartments(mockDepartments)
    setSelectedProgramId(mockDepartments[0].programs[0].id)

    const mockRatings: RatingEntry[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      fullName: `Студент ${i + 1} Олександрович`,
      group: 'КН-31',
      score: 95 - i * 2,
    }))
    setRatings(mockRatings)
  }, [])

  const ratingColumns = [
    { header: '№', accessor: 'id' as const },
    { header: 'ПІБ', accessor: 'fullName' as const },
    { header: 'Група', accessor: 'group' as const },
    { header: 'Бал', accessor: 'score' as const },
  ]

  const courses = [1, 2, 3, 4, 5]
  const semesters = [1, 2]

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white font-sans overflow-hidden">
      {/* Top Bar - Integrated directly below the header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 z-20">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex space-x-2 overflow-x-auto no-scrollbar">
            {courses.map((course) => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`pb-1 px-4 text-sm font-semibold transition-colors duration-200 border-b-2 whitespace-nowrap ${
                  selectedCourse === course
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
              >
                {course} Курс
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg shrink-0">
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-8 py-2 text-xs font-bold rounded-md transition-all ${
                  selectedSemester === sem
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {sem} СЕМЕСТР
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Pinned to the very left edge */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Освітні програми</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {departments.map((dept) => (
              <div key={dept.id} className="mb-4 last:mb-0">
                <div className="px-3 py-2 text-xs font-bold text-blue-800 bg-blue-50 rounded mb-1">
                  {dept.name}
                </div>
                <div className="space-y-1">
                  {dept.programs.map((prog) => (
                    <button
                      key={prog.id}
                      onClick={() => setSelectedProgramId(prog.id)}
                      className={`w-full text-left px-4 py-2 text-sm rounded transition-colors ${
                        selectedProgramId === prog.id
                          ? 'bg-blue-600 text-white font-medium shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {prog.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area - Stretching to fill all remaining space */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Action Strip - Stretches with the table */}
          <div className="flex justify-between items-center bg-white px-6 py-4 border-b border-gray-200 shrink-0">
            <h2 className="text-xl font-bold text-gray-800">
              Рейтингова таблиця
            </h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm text-sm font-medium whitespace-nowrap active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Розрахувати рейтинг
              </button>
              <button className="p-2 bg-white text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 transition border border-gray-200 shadow-sm active:scale-95" title="Експортувати">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Table Container - Fills the rest of the main content */}
          <div className="flex-1 overflow-auto bg-white">
            <DataTable
              columns={ratingColumns as any}
              data={ratings}
              isActionEnabled={false}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default RatingPage
