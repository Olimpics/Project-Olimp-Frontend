'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import { FilterBox } from '@/components/ui/FilterBox'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'

type StudentSelectedDiscipline = {
  idBindAddDisciplines: number
  idAddDisciplines: number
  nameAddDisciplines: string
  codeAddDisciplines: string
  semestr: number
  inProcess: number
}

type StudentWithChoices = {
  studentId: number
  fullName: string
  faculty: string
  group: string
  year: number
  degreeLevelId: number
  degreeLevelName: string
  selectedDisciplines: StudentSelectedDiscipline[]
  selectionStatus: number
  confirmationStatus: number
}

type Faculty = {
  idFaculty: number
  nameFaculty: string
  abbreviation: string
}

type EduDegree = {
  idEducationalDegree: number
  nameEducationalDegreec: string
}

type GroupItem = {
  id: number
  code: string
}

type Course = {
  courseNumber: number
}

type StudentRow = {
  id: number
  fullName: string
  faculty: string
  degreeLevelName: string
  year: number
  group: string
  disciplinesSummary: string
  selectionStatus: number
  confirmationStatus: number
  selectionLabel: string
  confirmationLabel: string
}

interface Column<T> {
  header: string
  accessor: keyof T
}

const sortingOptions = [
  { label: 'ПІБ (А-Я)', value: 0 },
  { label: 'ПІБ (Я-А)', value: 1 },
  { label: 'Факультет (↑)', value: 2 },
  { label: 'Факультет (↓)', value: 3 },
  { label: 'Група (↑)', value: 4 },
  { label: 'Група (↓)', value: 5 },
  { label: 'Курс (↑)', value: 6 },
  { label: 'Курс (↓)', value: 7 },
]

const courses: Course[] = [
  { courseNumber: 1 },
  { courseNumber: 2 },
  { courseNumber: 3 },
  { courseNumber: 4 },
]

const getFacultyIdFromCookie = (): number => {
  try {
    const raw = getCookie(USER_PROFLE)
    if (!raw) return 0
    const user = JSON.parse(raw) as { idFaculty?: number; facultyId?: number }
    return user?.idFaculty ?? user?.facultyId ?? 0
  } catch {
    return 0
  }
}

const Pagination: React.FC<{
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}> = ({ totalPages, currentPage, onPageChange }) => {
  const getPages = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 16) return Array.from({ length: totalPages }, (_, i) => i + 1)

    pages.push(1)
    if (currentPage > 4) pages.push('...')

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)

    if (currentPage < totalPages - 3) pages.push('...')
    pages.push(totalPages)

    return pages
  }

  return (
    <nav className="flex justify-center mt-4 space-x-2">
      {getPages().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(Number(page))}
            className={`px-4 py-2 rounded ${
              currentPage === page
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white text-blue-600 border border-gray-300 hover:bg-blue-100'
            }`}
          >
            {page}
          </button>
        )
      )}
    </nav>
  )
}

const CourseCataloguePage = () => {
  const [activeTab] = useState<'students'>('students')

  const [students, setStudents] = useState<StudentRow[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [degrees, setDegrees] = useState<EduDegree[]>([])
  const [groups, setGroups] = useState<GroupItem[]>([])

  const [pendingFaculties, setPendingFaculties] = useState<string[]>([])
  const [pendingDegrees, setPendingDegrees] = useState<string[]>([])
  const [pendingCourses, setPendingCourses] = useState<string[]>([])
  const [pendingGroups, setPendingGroups] = useState<string[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectionFilter, setSelectionFilter] = useState<'all' | '0' | '1'>('all')
  const [confirmationFilter, setConfirmationFilter] = useState<'all' | '0' | '1'>('all')
  const [isNewFilter, setIsNewFilter] = useState<'0' | '1'>('1')
  const [sortOrder, setSortOrder] = useState<number>(0)

  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(
    async (page: number = currentPage) => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('pageSize', '15')
        if (searchTerm.trim()) params.set('search', searchTerm.trim())

        if (pendingFaculties.length > 0) {
          params.set('faculties', pendingFaculties.join(','))
        }

        if (pendingCourses.length > 0) {
          params.set('courses', pendingCourses.join(','))
        }

        if (pendingGroups.length > 0) {
          params.set('groups', pendingGroups.join(','))
        }

        if (pendingDegrees.length > 0) {
          params.set('degreeLevelIds', pendingDegrees.join(','))
        }

        if (selectionFilter !== 'all') {
          params.set('selectionStatus', selectionFilter)
        }

        if (confirmationFilter !== 'all') {
          params.set('confirmationStatus', confirmationFilter)
        }

        params.set('sortOrder', String(sortOrder))
        params.set('isNew', isNewFilter)

        if (isNewFilter === '1') {
          const facultyId = getFacultyIdFromCookie()
          if (facultyId > 0) {
            params.set('facultyId', String(facultyId))
          }
        }

        const res = await fetch(
          `https://localhost:7011/api/DisciplineTabAdmin/GetStudentsWithDisciplineChoices?${params.toString()}`
        )
        if (!res.ok) {
          throw new Error('Не вдалося завантажити дані')
        }
        const data = await res.json()
        const list: StudentWithChoices[] = data.students || []

        const mapped: StudentRow[] = list.map((s) => {
          const disciplinesSummary =
            s.selectedDisciplines.length === 0
              ? 'Немає вибраних дисциплін'
              : s.selectedDisciplines
                  .map((d) => `${d.codeAddDisciplines} – ${d.nameAddDisciplines}`)
                  .join(', ')

          const selectionLabel =
            s.selectionStatus === 1 ? 'Набрано всі дисципліни' : 'Не набрано всі дисципліни'
          const confirmationLabel =
            s.confirmationStatus === 1 ? 'Усі підтверджено' : 'Не всі підтверджено'

          return {
            id: s.studentId,
            fullName: s.fullName,
            faculty: s.faculty,
            degreeLevelName: s.degreeLevelName,
            year: s.year,
            group: s.group,
            disciplinesSummary,
            selectionStatus: s.selectionStatus,
            confirmationStatus: s.confirmationStatus,
            selectionLabel,
            confirmationLabel,
          }
        })

        setStudents(mapped)
        setTotalPages(data.totalPages || 1)
        setCurrentPage(data.currentPage || page)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Сталася помилка під час завантаження')
        setStudents([])
      } finally {
        setLoading(false)
      }
    },
    [
      confirmationFilter,
      currentPage,
      isNewFilter,
      pendingDegrees,
      pendingFaculties,
      pendingCourses,
      pendingGroups,
      searchTerm,
      selectionFilter,
      sortOrder,
    ]
  )

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [facRes, degRes, groupRes] = await Promise.all([
          fetch('https://localhost:7011/api/Faculty'),
          fetch('https://localhost:7011/api/EducationalDegree'),
          fetch('https://localhost:7011/api/Filter/groups'),
        ])

        const [facData, degData, groupData] = await Promise.all([
          facRes.json(),
          degRes.json(),
          groupRes.json(),
        ])

        setFaculties(facData)
        setDegrees(degData)
        setGroups(groupData)

        await fetchStudents(1)
      } catch (e: unknown) {
        setError('Не вдалося завантажити фільтри')
      }
    }

    fetchFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleApplyFilters = () => {
    setCurrentPage(1)
    fetchStudents(1)
  }

  const columns: Column<StudentRow>[] = useMemo(
    () => [
      { header: 'ПІБ студента', accessor: 'fullName' },
      { header: 'Факультет', accessor: 'faculty' },
      { header: 'Рівень освіти', accessor: 'degreeLevelName' },
      { header: 'Курс', accessor: 'year' },
      { header: 'Група', accessor: 'group' },
      { header: 'Обрані дисципліни', accessor: 'disciplinesSummary' },
      { header: 'Статус набору', accessor: 'selectionLabel' },
      { header: 'Підтвердження', accessor: 'confirmationLabel' },
    ],
    []
  )

  const handleEdit = (row: StudentRow) => {
    console.log('Edit student with choices', row)
    // TODO: модалка з деталями вибору дисциплін
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
      <aside className="sm:w-1/5 w-full">
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4 space-y-4">
          <FilterBox
            name="Факультет"
            options={faculties}
            accessor="idFaculty"
            valueName="abbreviation"
            selectedValues={pendingFaculties}
            onChange={setPendingFaculties}
          />
          <FilterBox
            name="Рівень освіти"
            options={degrees}
            accessor="idEducationalDegree"
            valueName="nameEducationalDegreec"
            selectedValues={pendingDegrees}
            onChange={setPendingDegrees}
          />
          <FilterBox
            name="Курс"
            options={courses}
            accessor="courseNumber"
            selectedValues={pendingCourses}
            onChange={setPendingCourses}
          />
          <FilterBox
            name="Група"
            options={groups}
            accessor="id"
            valueName="code"
            selectedValues={pendingGroups}
            onChange={setPendingGroups}
          />

          <div className="pt-2 border-t border-gray-200 space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Статус набору (дисципліни)
              </label>
              <select
                value={selectionFilter}
                onChange={(e) => setSelectionFilter(e.target.value as 'all' | '0' | '1')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Усі</option>
                <option value="1">Набрано</option>
                <option value="0">Не набрано</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Статус підтвердження
              </label>
              <select
                value={confirmationFilter}
                onChange={(e) => setConfirmationFilter(e.target.value as 'all' | '0' | '1')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Усі</option>
                <option value="1">Підтверджено</option>
                <option value="0">Не підтверджено</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Показувати тільки нові</label>
              <select
                value={isNewFilter}
                onChange={(e) => setIsNewFilter(e.target.value as '0' | '1')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Так, тільки з останнього періоду</option>
                <option value="0">Усі вибори за весь час</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleApplyFilters}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Застосувати фільтри
        </button>
      </aside>

      <main className="sm:w-4/5 w-full">
        <div className="mb-4 flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Каталог курсів</h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="px-4 py-2 text-sm font-semibold border-b-4 border-blue-600 text-blue-600"
                disabled
              >
                Студенти
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Пошук студента, факультету або групи..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleApplyFilters}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Пошук
                </button>
              </div>

              <select
                value={sortOrder}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setSortOrder(val)
                  setCurrentPage(1)
                  fetchStudents(1)
                }}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
              >
                {sortingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-300 rounded-md">
          {loading ? (
            <div className="p-6 text-gray-600">Завантаження...</div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={students}
                isActionEnabled
                onEdit={handleEdit}
                showDeleteAction={false}
              />
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={(page) => {
                  setCurrentPage(page)
                  fetchStudents(page)
                }}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default CourseCataloguePage

