'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { FilterBox } from '@/components/ui/FilterBox'
import { Modal } from '@/components/ui/Modal'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { apiService } from '@/services/axiosService'

type AdminDiscipline = {
  idAddDisciplines: number
  nameAddDisciplines: string
  teachers: string | null
  departmentName: string | null
  credits: number | null
  normative: number | null
  maxCountPeople: number | null
  currentCount: number
  status: string
  isForceChange: number
  degreeLevelId: number | null
  isFaculty: number
  facultyId: number
  facultyAbbreviation: string | null
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

const sortingOptions = [
  { label: 'Назва (А-Я)', value: 0 },
  { label: 'Назва (Я-А)', value: 1 },
  { label: 'Набір (від меншого до більшого)', value: 2 },
  { label: 'Набір (від більшого до меншого)', value: 3 },
]

const statusFilterOptions = [
  { label: 'Усі статуси', value: 0 },
  { label: 'Не обрана', value: 1 },
  { label: 'Умовно обрана', value: 2 },
  { label: 'Обрано', value: 3 },
  { label: 'Набрана', value: 4 },
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

export const Pagination: React.FC<{
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

type StatusCode = 1 | 2 | 3 | 4

const statusToCode = (status: string | null | undefined): StatusCode | null => {
  if (!status) return null
  const normalized = status.trim().toLowerCase()

  if (['not acquired', 'не обрана', 'не обрано', 'не набрана'].includes(normalized)) {
    return 1
  }

  if (['smartly acquired', 'умовно обрана', 'умовно обрано'].includes(normalized)) {
    return 2
  }


  if (['accepted', 'обрана', 'обрано'].includes(normalized)) {
    return 3
  }

  if (
    ['collected', 'набрана', 'набрано', 'закрита', 'набрана/закрита', 'набрана / закрита'].includes(normalized)
  ) {
    return 4
  }

  return null
}
const codeToStatusLabel = (code: StatusCode | string | null): string => {
  const numericCode = Number(code);
  switch (numericCode) {
    case 1: return 'Не обрана';
    case 2: return 'Умовно';
    case 3: return 'Обрана';
    case 4: return 'Набрана';
    default: return 'Без статусу'; 
  }
}

const getStatusConfig = (code: StatusCode | string | null) => {
  const numericCode = Number(code); 
  switch (numericCode) {
    case 2:
      return {
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        barClass: 'bg-amber-500',
      }
    case 3:
      return {
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        barClass: 'bg-emerald-500',
      }
    case 4:
      return {
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        barClass: 'bg-purple-500',
      }
    default:
      return {
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        barClass: 'bg-red-500',
      }
  }
}

const DisciplineCataloguePage = () => {
  const [disciplines, setDisciplines] = useState<AdminDiscipline[]>([])
  const [studentRefreshTrigger, setStudentRefreshTrigger] = useState(0)
  const [viewMode, setViewMode] = useState<'disciplines' | 'students'>('disciplines')

  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [degrees, setDegrees] = useState<EduDegree[]>([])

  const [pendingFaculties, setPendingFaculties] = useState<string[]>([])
  const [pendingDegrees, setPendingDegrees] = useState<string[]>([])

  const [statusFilter, setStatusFilter] = useState<number>(0)
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isFacultyFilter, setIsFacultyFilter] = useState<'all' | '1' | '0'>('all')

  const [searchTerm, setSearchTerm] = useState('')

  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalSaving, setModalSaving] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [editingDiscipline, setEditingDiscipline] = useState<AdminDiscipline | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<StatusCode | null>(null)

  const fetchDisciplines = useCallback(
    async (page: number) => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('pageSize', '15')
        params.set('sortOrder', String(sortOrder)) 

        if (searchTerm.trim()) params.set('search', searchTerm.trim())
        
        if (pendingFaculties.length > 0) {
          params.set('faculties', pendingFaculties.join(','))
        } else {
          /*const facultyId = getFacultyIdFromCookie()
          if (facultyId > 0) params.set('faculties', String(facultyId))*/
        }

        if (pendingDegrees.length > 0) params.set('degreeLevelIds', pendingDegrees.join(','))
        if (isFacultyFilter !== 'all') params.set('isFaculty', isFacultyFilter)
        if (statusFilter > 0) params.set('statusFilter', String(statusFilter))

        const data = await apiService.get<any>(
          `DisciplineTabAdmin/GetDisciplinesWithStatus?${params.toString()}`
        )
        setDisciplines(data.items || [])
        setTotalPages(data.totalPages || 1)
        setCurrentPage(page) 
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    },
    [isFacultyFilter, pendingDegrees, pendingFaculties, searchTerm, sortOrder, statusFilter]
  )

  useEffect(() => {
    const init = async () => {
      const [fData, dData] = await Promise.all([
        apiService.get<any>('Faculty'),
        apiService.get<any>('EducationalDegree')
      ])
      setFaculties(fData)
      setDegrees(dData)
      
      fetchDisciplines(1)
    }
    console.log("USE EFFECT ", disciplines)
    init()
  }, []) 

  useEffect(() => {
    if (disciplines.length > 0) {
        fetchDisciplines(1)
    }
    console.log("USE EFFECT WITH SORT ORDER ", disciplines)
  }, [sortOrder])

  const handleApplyFilters = () => {
    fetchDisciplines(1)
  }

  const openEditModal = (discipline: AdminDiscipline) => {
    setEditingDiscipline(discipline)
    setSelectedStatus(statusToCode(discipline.status) ?? 1)
    setModalError(null)
    setIsModalOpen(true)
  }

  const handleSaveStatus = async () => {
    if (!editingDiscipline || !selectedStatus) {
      setIsModalOpen(false)
      return
    }

    try {
      setModalSaving(true)
      setModalError(null)

      const data = await apiService.put<any>(
        'DisciplineTabAdmin/UpdateDisciplineStatus',
        {
          disciplineId: editingDiscipline.idAddDisciplines,
          status: selectedStatus,
        }
      )

      setDisciplines((prev) =>
        prev.map((d) =>
          d.idAddDisciplines === data.disciplineId
            ? {
                ...d,
                status: data.status ?? d.status,
                isForceChange: typeof data.isForceChange === 'number' ? data.isForceChange : d.isForceChange,
              }
            : d
        )
      )

      setIsModalOpen(false)
      setEditingDiscipline(null)
    } catch (e: unknown) {
      setModalError(
        e instanceof Error ? e.message : 'Сталася помилка під час збереження статусу'
      )
    } finally {
      setModalSaving(false)
    }
  }

  const getProgressInfo = (d: AdminDiscipline) => {
    const current = d.currentCount
    const normative = d.normative ?? undefined
    const max = d.maxCountPeople ?? undefined

    let denominator: number | undefined
    let mode: 'Norm' | 'Max' | null = null

    if (normative && normative > 0 && current < normative) {
      denominator = normative
      mode = 'Norm'
    } else if (max && max > 0) {
      denominator = max
      mode = 'Max'
    } else if (normative && normative > 0) {
      denominator = normative
      mode = 'Norm'
    }

    const percent = denominator ? Math.min(100, (current / denominator) * 100) : 0
    const rangeLabel = denominator ? `${current} / ${denominator}` : `${current}`

    return {
      percent,
      rangeLabel,
      mode,
    }
  }

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

          <div className="pt-2 border-t border-gray-200 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип дисципліни</label>
              <select
                value={isFacultyFilter}
                onChange={(e) => setIsFacultyFilter(e.target.value as 'all' | '1' | '0')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="all">Усі</option>
                <option value="1">Факультетські</option>
                <option value="0">Університетські</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус нормативу</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                {statusFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
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
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Статус набору дисциплін
          </h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/course-catalogue"
                className="px-4 py-2 text-sm font-semibold border-b-4 border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
              >
                Студенти
              </Link>
              <span className="px-4 py-2 text-sm font-semibold border-b-4 border-blue-600 text-blue-700">
                Дисципліни
              </span>
              <Link
                href="/table"
                className="px-4 py-2 text-sm font-semibold border-b-4 border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
              >
                Таблиця
              </Link>
          </div>

            <div className="flex flex-row-reverse sm:flex-row gap-2 w-1/2">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Пошук за назвою, викладачем або кафедрою..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                <button
                  onClick={handleApplyFilters}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200"
                >
                  Оновити
                </button>
              </div>

            <select
              value={sortOrder}
              onChange={(e) => {
                const val = Number(e.target.value)
                setSortOrder(val)
                setCurrentPage(1)
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

        <div className="">
          {loading ? (
            <div className="p-4 text-gray-600">Завантаження...</div>
          ) : disciplines.length === 0 ? (
            <div className="p-4 text-gray-600">За вибраними фільтрами дисциплін не знайдено.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                {disciplines.map((d) => {
                  const statusCode = statusToCode(d.status)
                  const config = getStatusConfig(statusCode)
                  const statusLabel =
                    statusCode != null ? codeToStatusLabel(statusCode) : d.status || 'Без статусу'
                  const { percent, rangeLabel, mode } = getProgressInfo(d)

                  return (
                    <div
                      key={d.idAddDisciplines}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/95 shadow-sm hover:shadow-lg p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3 h-40">
                          <div>
                            <div className="text-xs uppercase tracking-wide text-gray-500">
                              {d.facultyAbbreviation || 'Без факультету'}
                              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                              {d.teachers && (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5">
                                  {d.teachers}
                                </span>
                              )}
                              {d.isFaculty != null && (
                                <span className="inline-flex items-center rounded-full py-0.5">
                                  {d.isFaculty ? "Факультетська" : "Університетська"}
                                </span>
                              )}
                            </div>
                            </div>
                            <h2 className="mt-6 text-base w-80 sm:text-lg font-semibold text-gray-900">
                              {d.nameAddDisciplines}
                            </h2>
                            {d.departmentName && (
                              <div className="mt-1 text-xs text-gray-500">
                                Кафедра: {d.departmentName}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 w-1/4">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}
                            >
                              {statusLabel}
                            </span>
                            {d.isForceChange === 1 && (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                                Адмін. зміна
                              </span>
                            )}
                          </div>
                        </div>


                        <div className="mt-6">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Набір студентів</span>
                            <span className="font-medium">
                              {rangeLabel}
                              {mode && (
                                <span className="ml-1 text-[10px] uppercase text-gray-500">
                                  ({mode})
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${config.barClass}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <div className="mt-1 flex justify-between text-[11px] text-gray-500">
                            <span>Норматив: {d.normative ?? '—'}</span>
                            <span>Максимум: {d.maxCountPeople ?? '—'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => openEditModal(d)}
                          className="inline-flex items-center rounded-xl border border-blue-600 px-3.5 py-1.5 text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200"
                        >
                          Редагувати статус
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={(page) => {
                  setCurrentPage(page)
                  fetchDisciplines(page)
                }}
              />
            </>
          )}
        </div>
{/* 
        <StudentDisciplinesTable
          searchTerm=""
          faculties={[]}
          degrees={[]}
          courses={[]}
          groups={[]}
          selectionFilter="all"
          confirmationFilter="all"
          isNewFilter="0"
          sortOrder={0}
          refreshTrigger={studentRefreshTrigger}
          onEdit={(row: StudentRow) => {
            console.log('Edit student:', row)
          }}
        /> */}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {editingDiscipline && (
            <div className="max-w-2xl">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                    Редагування статусу
                  </h2>
                  <div className="mt-2">
                    <div className="font-semibold text-gray-900">
                      {editingDiscipline.nameAddDisciplines}
                    </div>
                    <div className="text-sm text-gray-600">
                      {editingDiscipline.facultyAbbreviation || 'Без факультету'}
                      {editingDiscipline.departmentName
                        ? ` • ${editingDiscipline.departmentName}`
                        : ''}
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

              <div className="space-y-3">
                {statusFilterOptions
                  .filter((opt) => opt.value !== 0)
                  .map((opt) => {
                    const code = opt.value as StatusCode
                    const isSelected = selectedStatus === code
                    const config = getStatusConfig(code)
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer text-base ${
                          isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="status"
                            value={opt.value}
                            checked={isSelected}
                            onChange={() => setSelectedStatus(code)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span>{codeToStatusLabel(code)}</span>
                        </div>
                        <span
                          className={`ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${config.badgeClass}`}
                        >
                          {opt.value === 1
                            ? 'нижче 80% норм.'
                            : opt.value === 2
                            ? '80–100% норм.'
                            : opt.value === 3
                            ? '100%+ норм.'
                            : 'максимум досягнуто'}
                        </span>
                      </label>
                    )
                  })}
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
                  onClick={handleSaveStatus}
                  disabled={modalSaving || !selectedStatus}
                  className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {modalSaving ? 'Збереження…' : 'Зберегти статус'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  )
}

export default DisciplineCataloguePage

