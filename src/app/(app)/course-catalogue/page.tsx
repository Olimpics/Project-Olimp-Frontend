'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
          params.set('faculties', [getFacultyId()].join(','))
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
              <span className="relative inline-flex group">
                <span
                  className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold cursor-pointer"
                  title={rest.join(', ')}
                >
                  +{moreCount}
                </span>
                <div className="absolute z-20 hidden group-hover:block left-0 top-full mt-1 w-72 rounded-md bg-gray-900 text-white text-xs p-2 shadow-lg whitespace-pre-line">
                  {rest.map((text: string, index: number) => (
                    <div key={index}>{text}</div>
                  ))}
                </div>
              </span>
            </span>
          )
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
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
      <aside className="sm:w-1/5 w-full">
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4 space-y-4">
          {/* <FilterBox
            name="Факультет"
            options={faculties}
            accessor="idFaculty"
            valueName="abbreviation"
            selectedValues={pendingFaculties}
            onChange={setPendingFaculties}
          /> */}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalStudent && (
          <div className="max-w-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Перегляд вибору дисциплін</h2>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                    {modalStudent.fullName
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{modalStudent.fullName}</div>
                    <div className="text-sm text-gray-600">
                      {modalStudent.group} • {modalStudent.degreeLevelName}
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsModalOpen(false)}
                aria-label="Закрити"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {modalChoices.map((choice, index) => {
                const approved = choice.isConfirm === 1
                return (
                  <div
                    key={choice.bindId}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                      approved ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center text-xs text-gray-600 bg-white">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{choice.label}</div>
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
                        className={`h-8 w-8 rounded-full flex items-center justify-center border text-white ${
                          approved
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
                        className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                          !approved
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
              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {modalError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                disabled={modalSaving}
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={modalSaving || modalChoices.length === 0}
                className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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

export default CourseCataloguePage

