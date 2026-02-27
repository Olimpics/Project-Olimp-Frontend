'use client'

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import DataTable from '@/components/ui/DataTable'
import { FilterBox } from '@/components/ui/FilterBox'
import { Modal } from '@/components/ui/Modal'
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
  disciplinesShort: string
  disciplinesAll: string[]
  rawChoices: StudentSelectedDiscipline[]
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
            className={`px-4 py-2 rounded ${currentPage === page
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

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalSaving, setModalSaving] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false)
  const [declineConfirmLockUntil, setDeclineConfirmLockUntil] = useState(0)

  type LocalChoice = {
    bindId: number
    label: string
    isConfirm: 0 | 1
  }

  const [modalStudent, setModalStudent] = useState<StudentRow | null>(null)
  const [modalChoices, setModalChoices] = useState<LocalChoice[]>([])

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
          const allDisciplines =
            s.selectedDisciplines.length === 0
              ? []
              : s.selectedDisciplines.map(
                (d) => `${d.codeAddDisciplines} – ${d.nameAddDisciplines}`
              )

          const disciplinesShort =
            allDisciplines.length === 0 ? 'Немає вибраних дисциплін' : allDisciplines[0]

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
            disciplinesShort,
            disciplinesAll: allDisciplines,
            rawChoices: s.selectedDisciplines,
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
      {
        header: 'Обрані дисципліни',
        accessor: 'disciplinesShort',
        render: (row: StudentRow) => {
          const first = row.disciplinesShort
          const rest = row.disciplinesAll.slice(1)

          if (row.disciplinesAll.length <= 1) {
            return first
          }

          const moreCount = row.disciplinesAll.length - 1

         return (
  <span className="inline-flex items-center gap-2">
    <span>{first}</span>
    <MoreModalBadge rest={rest} moreCount={moreCount} />
  </span>
);
        },
      },
      { header: 'Статус набору', accessor: 'selectionLabel' },
      { header: 'Підтвердження', accessor: 'confirmationLabel' },
    ],
    []
  )

  const handleEdit = (row: StudentRow) => {
    const localChoices: LocalChoice[] =
      row.rawChoices.length === 0
        ? []
        : row.rawChoices.map((d) => ({
          bindId: d.idBindAddDisciplines,
          label: `${d.codeAddDisciplines} – ${d.nameAddDisciplines}`,
          isConfirm: 1,
        }))

    setModalStudent(row)
    setModalChoices(localChoices)
    setModalError(null)
    setIsModalOpen(true)
  }

  const performSave = useCallback(async () => {
    if (!modalStudent || modalChoices.length === 0) return

    try {
      setModalSaving(true)
      setModalError(null)

      const payload = modalChoices.map((c) => ({
        bindId: c.bindId,
        isConfirm: c.isConfirm,
      }))

      const res = await fetch('https://localhost:7011/api/DisciplineTabAdmin/UpdateChoice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Не вдалося зберегти зміни')

      setShowDeclineConfirm(false)
      setIsModalOpen(false)
      await fetchStudents(currentPage)
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : 'Сталася помилка при збереженні')
    } finally {
      setModalSaving(false)
    }
  }, [modalStudent, modalChoices, fetchStudents, currentPage])

  const handleSaveModal = () => {
    if (!modalStudent || modalChoices.length === 0) {
      setIsModalOpen(false)
      return
    }

    const hasDeclined = modalChoices.some((c) => c.isConfirm === 0)
    if (hasDeclined) {
      setShowDeclineConfirm(true)
      setDeclineConfirmLockUntil(Date.now() + 5000)
      return
    }

    performSave()
  }


  const getFacultyId = useCallback((): number => {
    try {
      const raw = getCookie(USER_PROFLE)
      if (!raw) return 0
      const user = JSON.parse(raw) as { idFaculty?: number; facultyId?: number }
      return user?.idFaculty ?? user?.facultyId ?? 0
    } catch {
      return 0
    }
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row gap-5">
      <aside className="sm:w-1/5 w-full">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200 mb-4 space-y-4 p-4 sm:p-5 transition-shadow duration-200">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус набору (дисципліни)
              </label>
              <select
                value={selectionFilter}
                onChange={(e) => setSelectionFilter(e.target.value as 'all' | '0' | '1')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="all">Усі</option>
                <option value="1">Набрано</option>
                <option value="0">Не набрано</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус підтвердження
              </label>
              <select
                value={confirmationFilter}
                onChange={(e) => setConfirmationFilter(e.target.value as 'all' | '0' | '1')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="all">Усі</option>
                <option value="1">Підтверджено</option>
                <option value="0">Не підтверджено</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Показувати тільки нові</label>
              <select
                value={isNewFilter}
                onChange={(e) => setIsNewFilter(e.target.value as '0' | '1')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="1">Так, тільки з останнього періоду</option>
                <option value="0">Усі вибори за весь час</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleApplyFilters}
          className="w-full mt-1 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200"
        >
          Застосувати фільтри
        </button>
      </aside>

      <main className="sm:w-4/5 w-full">
        <div className="mb-5 flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Каталог курсів</h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/course-catalogue"
                className="px-4 py-2 text-sm font-semibold border-b-4 border-blue-600 text-blue-700"
              >
                Студенти
              </Link>
              <Link
                href="/course-catalogue/disciplines"
                className="px-4 py-2 text-sm font-semibold border-b-4 border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
              >
                Дисципліни
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Пошук студента, факультету або групи..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                <button
                  onClick={handleApplyFilters}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200"
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
                className="sm:w-64 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50/90 p-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

          {loading ? (
            <div className="p-8 text-gray-600 text-sm">Завантаження...</div>
          ) : (
            <>
                <DataTable
                  columns={columns}
                  data={students}
                  isActionEnabled
                  onEdit={handleEdit}
                  showDeleteAction={false}
                />
              <div className="border-t border-slate-100 bg-slate-50/60 px-3 sm:px-4 lg:px-5 py-3">
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={(page) => {
                    setCurrentPage(page)
                    fetchStudents(page)
                  }}
                />
              </div>
            </>
          )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} classSize='max-w-2xl'>
        {modalStudent && (
          <div className="max-w-3xl">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                  Перегляд вибору дисциплін
                </h2>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 shadow-sm">
                    {modalStudent.fullName
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{modalStudent.fullName}</div>
                    <div className="text-sm text-gray-600">
                      {modalStudent.group} • {modalStudent.degreeLevelName}
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
                onClick={() => setIsModalOpen(false)}
                aria-label="Закрити"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {modalChoices.map((choice, index) => {
                const approved = choice.isConfirm === 1
                return (
                  <div
                    key={choice.bindId}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 gap-3 ${approved ? 'bg-emerald-50 border-emerald-200' : 'bg-red-200 border-gray-200'
                      } transition-colors duration-150`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full border border-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 bg-white">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{choice.label}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setModalChoices((prev) =>
                            prev.map((c) =>
                              c.bindId === choice.bindId ? { ...c, isConfirm: 1 } : c
                            )
                          )
                        }
                        className={`h-9 w-9 rounded-full flex items-center justify-center border text-white transition-colors duration-150 ${approved
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-emerald-100 border-emerald-200 text-emerald-600'
                          }`}
                        aria-label="Схвалити"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setModalChoices((prev) =>
                            prev.map((c) =>
                              c.bindId === choice.bindId ? { ...c, isConfirm: 0 } : c
                            )
                          )
                        }
                        className={`h-9 w-9 rounded-full flex items-center justify-center border transition-colors duration-150 ${!approved
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-500'
                          }`}
                        aria-label="Відхилити"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}

              {modalChoices.length === 0 && (
                <div className="text-sm text-gray-500">
                  У цього студента ще немає вибраних дисциплін.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Схвалено:{' '}
                  {
                    modalChoices.filter((c) => c.isConfirm === 1)
                      .length
                  }
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                  Відхилено:{' '}
                  {
                    modalChoices.filter((c) => c.isConfirm === 0)
                      .length
                  }
                </span>
              </div>
            </div>

            {modalError && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {modalError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors duration-150"
                disabled={modalSaving}
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={modalSaving || modalChoices.length === 0}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200"
              >
                {modalSaving ? 'Збереження…' : 'Підтвердити зміни'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {showDeclineConfirm && (
        <DeclineConfirmModal
          lockUntil={declineConfirmLockUntil}
          onConfirm={() => {
            setShowDeclineConfirm(false)
            performSave()
          }}
          onClose={() => setShowDeclineConfirm(false)}
        />
      )}
    </div>
  )
}

function DeclineConfirmModal({
  lockUntil,
  onConfirm,
  onClose,
}: {
  lockUntil: number
  onConfirm: () => void
  onClose: () => void
}) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(t)
  }, [])

  const secondsLeft = Math.max(0, Math.ceil((lockUntil - now) / 1000))
  const canConfirm = secondsLeft === 0

  return (
    <Modal isOpen onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Підтвердження відхилення</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Закрити"
        >
          ✕
        </button>
      </div>
      <div className="mt-4 space-y-3">
        <p className="text-gray-700">
          Ви відмовляєте студенту у частині обраних дисциплін. Студент буде повідомлений про
          відхилення.
        </p>
        <p className="text-sm text-gray-600">Продовжити?</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
        >
          Скасувати
        </button>
        <button
          onClick={() => (canConfirm ? onConfirm() : undefined)}
          disabled={!canConfirm}
          className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {canConfirm ? 'Продовжити' : `Продовжити (${secondsLeft} с)`}
        </button>
      </div>
    </Modal>
  )
}
function MoreModalBadge({
  rest,
  moreCount,
}: {
  rest: string[];
  moreCount: number;
}) {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне окна
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <>
      {/* Кнопка +N */}
      <span
        onClick={() => setOpen(true)}
        className="
          px-3 py-1
          rounded-full
          bg-blue-100 text-blue-800
          text-sm font-semibold
          cursor-pointer
          hover:bg-blue-200
        "
      >
        +{moreCount}
      </span>

      {/* Модальное окно */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Затемнение */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Окно */}
          <div
            ref={modalRef}
            className="
              relative z-10
              w-full max-w-lg
              rounded-xl
              bg-white
              p-6
              shadow-2xl
            "
          >
            {/* Крестик */}
            <button
              onClick={() => setOpen(false)}
              className="
                absolute top-3 right-3
                text-gray-400
                hover:text-gray-600
                text-xl
              "
            >
              ×
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Список дисциплин
            </h3>

            <div className="space-y-2 text-sm text-gray-800 max-h-96 overflow-y-auto">
              {rest.map((text, index) => (
                <div key={index} className="border-b pb-1 last:border-none">
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default CourseCataloguePage

