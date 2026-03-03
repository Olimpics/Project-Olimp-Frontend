'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { apiService } from '@/services/axiosService'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { FilterBox } from '@/components/ui/FilterBox'

const DEPARTMENT_ID = 21

type TargetAudience = 'Для всіх' | 'Перевибір'
type PeriodStatus = 'Відкрито' | 'Закрито'
type ForEduLevel = 'Для бакалаврів' | 'Для магістрів' | 'Для всіх'
type ForCourse = 'Для всіх' | '1' | '2' | '3'

type Period = {
  id: string
  apiId: number
  forCourse: ForCourse
  degreeLevelId: number 
  eduLevelLabel: ForEduLevel 
  targetAudience: TargetAudience
  startDate: string
  endDate: string
  status: PeriodStatus
  updatedAtLabel: string
}

type DisciplineChoicePeriodDto = {
  id?: number
  periodType: number
  periodCourse: number
  degreeLevelId?: number 
  isClose: number
  facultyId?: number
  departmentId?: number
  startDate: string
  endDate: string
}

function toPeriodType(t: TargetAudience): number {
  return t === 'Для всіх' ? 0 : 1
}
function fromPeriodType(n: number): TargetAudience {
  return n === 0 ? 'Для всіх' : 'Перевибір'
}

function toEduLevel(label: ForEduLevel): number {
  switch (label) {
    case 'Для бакалаврів': return 1
    case 'Для магістрів': return 2
    case 'Для всіх': return 3
    default: return 3
  }
}

function fromEduLevel(n: number): ForEduLevel {
  if (n === 1) return 'Для бакалаврів'
  if (n === 2) return 'Для магістрів'
  return 'Для всіх'
}

function toPeriodCourse(c: ForCourse): number {
  if (c === 'Для всіх') return 0
  return Number(c) as 1 | 2 | 3
}
function fromPeriodCourse(n: number): ForCourse {
  if (n === 0 || !n) return 'Для всіх'; 
  const val = String(n);
  return val as ForCourse;
}

function toIsClose(s: PeriodStatus): number {
  return s === 'Закрито' ? 1 : 0
}
function fromIsClose(n: number): PeriodStatus {
  return n === 1 ? 'Закрито' : 'Відкрито'
}

function apiToPeriod(dto: DisciplineChoicePeriodDto): Period {
  return {
    id: String(dto.id),
    apiId: dto.id ?? 0,
    forCourse: fromPeriodCourse(dto.periodCourse),
    degreeLevelId: dto.degreeLevelId ?? 3,
    eduLevelLabel: fromEduLevel(dto.degreeLevelId ?? 3), 
    targetAudience: fromPeriodType(dto.periodType),
    startDate: (dto.startDate || "").slice(0, 10),
    endDate: (dto.endDate || "").slice(0, 10),
    status: dto.isClose === 1 ? 'Закрито' : 'Відкрито',
    updatedAtLabel: '—',
  }
}

const forCourseOptions: ForCourse[] = ['Для всіх', '1', '2', '3'] 
const targetAudienceOptions: TargetAudience[] = ['Для всіх', 'Перевибір']
const statusDropdownOptions: PeriodStatus[] = ['Відкрито', 'Закрито']

const formatDateRange = (startISO: string, endISO: string) => {
  const toDM = (iso: string) => {
    const [y, m, d] = iso.split('-')
    return `${d}.${m}`
  }
  return `${toDM(startISO)} – ${toDM(endISO)}`
}

const statusPillClass = (status: PeriodStatus) => {
  switch (status) {
    case 'Відкрито':
      return 'bg-emerald-100 text-emerald-800'
    case 'Закрито':
      return 'bg-gray-200 text-gray-700'
  }
}

function IconEdit(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className ?? 'w-5 h-5'}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function IconLock(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className ?? 'w-5 h-5'}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function CloseConfirmModal({
  period,
  lockUntil,
  onConfirm,
  onClose,
}: {
  period: Period
  lockUntil: number
  onConfirm: () => void | Promise<void>
  onClose: () => void
}) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const secondsLeft = Math.max(0, Math.ceil((lockUntil - now) / 1000))
  const canConfirm = secondsLeft === 0

  return (
    <Modal isOpen onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Закриття періоду</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="mt-4 space-y-3">
        <p className="text-gray-700">
          Ви збираєтесь <strong>закрити</strong> період вибору дисциплін. Після закриття студенти не
          зможуть змінювати свій вибір у межах цього періоду. Переконайтесь, що всі потрібні дані
          збережені та що ви дійсно хочете завершити період.
        </p>
        <p className="text-sm text-gray-600">
          Період: для курсу {period.forCourse}, тип періоду {period.targetAudience},{' '}
          {formatDateRange(period.startDate, period.endDate)}.
        </p>
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
          {canConfirm ? 'Підтвердити закриття' : `Підтвердити закриття (${secondsLeft} с)`}
        </button>
      </div>
    </Modal>
  )
}

type PeriodModalMode = 'create' | 'edit'
type PeriodModalDraft = {
  forCourse: ForCourse
  eduLevelLabel: ForEduLevel 
  targetAudience: TargetAudience
  startDate: string
  endDate: string
  status: PeriodStatus
}

function getTomorrowYYYYMMDD(): string {
  const t = new Date()
  t.setDate(t.getDate() + 1)
  return t.toISOString().slice(0, 10)
}

function PeriodModal({
  isOpen,
  mode,
  draft,
  onClose,
  onChangeDraft,
  onSave,
  error,
}: {
  isOpen: boolean
  mode: PeriodModalMode
  draft: PeriodModalDraft
  onClose: () => void
  onChangeDraft: (next: PeriodModalDraft) => void
  onSave: () => void
  error?: string
}) {
  const title = mode === 'create' ? 'Створення періоду' : 'Редагування періоду'
  const isEdit = mode === 'edit'
  const minStartDate = getTomorrowYYYYMMDD()

  const todayStr = new Date().toISOString().slice(0, 10)
  const isAlreadyStarted = isEdit && todayStr > draft.startDate

  return (
    <Modal isOpen={isOpen} onClose={onClose} classSize='max-w-lg'>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {isEdit && (
        <div className="mt-2 space-y-1">
          {isAlreadyStarted && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
              Період уже розпочався, тому більшість полів заблоковано.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Для курсу</label>
          <select
            value={draft.forCourse}
            onChange={(e) => onChangeDraft({ ...draft, forCourse: e.target.value as ForCourse })}
            disabled={isAlreadyStarted}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {forCourseOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Рівень освіти</label>
          <select
            value={draft.eduLevelLabel}
            onChange={(e) => onChangeDraft({ ...draft, eduLevelLabel: e.target.value as ForEduLevel })}
            disabled={isAlreadyStarted}
            className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {['Для бакалаврів', 'Для магістрів', 'Для всіх'].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Тип періоду</label>
          <select
            value={draft.targetAudience}
            onChange={(e) => onChangeDraft({ ...draft, targetAudience: e.target.value as TargetAudience })}
            disabled={isAlreadyStarted}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {targetAudienceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Дата початку</label>
            <input
              type="date"
              value={draft.startDate}
              onChange={(e) => onChangeDraft({ ...draft, startDate: e.target.value })}
              disabled={isAlreadyStarted}
              min={isEdit ? undefined : minStartDate}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {!isEdit && (
              <p className="mt-0.5 text-xs text-gray-500">Не раніше ніж завтра</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Дата завершення</label>
            <input
              type="date"
              value={draft.endDate}
              onChange={(e) => onChangeDraft({ ...draft, endDate: e.target.value })}
              min={draft.startDate || minStartDate}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Статус</label>
          <select
            value={draft.status}
            onChange={(e) => onChangeDraft({ ...draft, status: e.target.value as PeriodStatus })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusDropdownOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
        >
          Скасувати
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Зберегти
        </button>
      </div>
    </Modal>
  )
}

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buttonPeriodClass, setButtonPeriodClass] = useState<boolean>(true)

  const getFacultyId = useCallback((): number => {
    try {
      const raw = getCookie(USER_PROFLE)
      if (!raw) return 0
      const user = JSON.parse(raw) as { idFaculty?: number; facultyId?: number }
      if (user?.facultyId != 1) { setButtonPeriodClass(false)}
      return user?.idFaculty ?? user?.facultyId ?? 0
    } catch {
      return 0
    }
  }, [])

  const fetchPeriods = useCallback(async () => {
    setLoading(true)
    setError(null)
    const facultyId = getFacultyId()
    try {
      const params = new URLSearchParams()
      params.set('facultyId', String(facultyId))
      params.set('departmentId', String(DEPARTMENT_ID))
      const list = await apiService.get<DisciplineChoicePeriodDto[]>(
        `DisciplineChoicePeriod?${params.toString()}`
      )
      setPeriods((Array.isArray(list) ? list : []).map(apiToPeriod))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Помилка завантаження періодів')
      setPeriods([])
    } finally {
      setLoading(false)
    }
  }, [getFacultyId])

  useEffect(() => {
    fetchPeriods()
  }, [fetchPeriods])

  const [pendingForCourse, setPendingForCourse] = useState<string[]>([])
  const [pendingTarget, setPendingTarget] = useState<string[]>([])
  const [pendingStatus, setPendingStatus] = useState<string[]>([])
  const [pendingEduLevel, setPendingEduLevel] = useState<string[]>([])

  const [eduLevelFilter, setEduLevelFilter] = useState<string[]>([])  
  const [forCourse, setForCourse] = useState<string[]>([])
  const [targetFilter, setTargetFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<PeriodModalMode>('create')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [closeConfirmPeriod, setCloseConfirmPeriod] = useState<Period | null>(null)
  const [closeConfirmLockUntil, setCloseConfirmLockUntil] = useState(0)
  const [draft, setDraft] = useState<PeriodModalDraft>({
    forCourse: 'Для всіх',
    targetAudience: 'Для всіх',
    eduLevelLabel: 'Для всіх',
    startDate: '2025-09-01',
    endDate: '2025-09-15',
    status: 'Відкрито',
  })

  const handleApplyFilters = () => {
    setForCourse(pendingForCourse)
    setEduLevelFilter(pendingEduLevel)
    setTargetFilter(pendingTarget)
    setStatusFilter(pendingStatus)
  }

  const filteredPeriods = useMemo(() => {
    return periods.filter((p) => {
      if (forCourse.length > 0 && !forCourse.includes(p.forCourse)) return false
      if (targetFilter.length > 0 && !targetFilter.includes(p.targetAudience)) return false
      if (statusFilter.length > 0 && !statusFilter.includes(p.status)) return false
      if (eduLevelFilter.length > 0 && !eduLevelFilter.includes(p.eduLevelLabel)) return false

      return true
    })
  }, [periods, forCourse, targetFilter, statusFilter, eduLevelFilter])

  const grouped = useMemo(() => {
    const map = new Map<string, Period[]>()
    for (const p of filteredPeriods) {
      if (!map.has(p.forCourse)) map.set(p.forCourse, [])
      map.get(p.forCourse)!.push(p)
    }
    const order: ForCourse[] = ['Для всіх', '1', '2', '3']
    return Array.from(map.entries()).sort(
      (a, b) => order.indexOf(a[0] as ForCourse) - order.indexOf(b[0] as ForCourse)
    )
  }, [filteredPeriods])

  const openCreate = () => {
    setError(null)
    setModalMode('create')
    setEditingId(null)
    setDraft({
      forCourse: 'Для всіх',
      targetAudience: 'Для всіх',
      eduLevelLabel: 'Для всіх',
      startDate: '',
      endDate: '',
      status: 'Відкрито',
    })
    setIsModalOpen(true)
  }

  const openEdit = (p: Period) => {
    setError(null)
    setModalMode('edit')
    setEditingId(p.id)
    setDraft({
      forCourse: p.forCourse,
      targetAudience: p.targetAudience,
      eduLevelLabel: fromEduLevel(p.degreeLevelId),
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!draft.startDate || !draft.endDate) return

    const todayTime = Date.now() 

    // кінець періоду користувачем
    const [y, m, d] = draft.endDate.split('-').map(Number)
    const endTime = new Date(y, m - 1, d).getTime()

    // мінімальний кінець = сьогодні + 3 дні
    const minEndTime = todayTime + 3 * 24 * 60 * 60 * 1000

    if (endTime < minEndTime) {
      setError('Дата завершення має бути не менше ніж через 3 дні від сьогоднішньої дати')
      return
    }

    const facultyId = getFacultyId()
    const startISO = `${draft.startDate}T00:00:00.000Z`
    const endISO = `${draft.endDate}T23:59:59.999Z`
    const today = new Date().toISOString().slice(0, 10)
    const tomorrow = getTomorrowYYYYMMDD()

    if (modalMode === 'create') {
      if (draft.startDate < tomorrow) {
        setError('Дата початку має бути не раніше ніж завтра')
        return
      }
      setError(null)
      try {
        const body: DisciplineChoicePeriodDto = {
          periodType: toPeriodType(draft.targetAudience),
          periodCourse: toPeriodCourse(draft.forCourse),
          degreeLevelId: toEduLevel(draft.eduLevelLabel),
          isClose: toIsClose(draft.status),
          facultyId,
          departmentId: DEPARTMENT_ID,
          startDate: startISO,
          endDate: endISO,
        }
        const created = await apiService.post<DisciplineChoicePeriodDto>('DisciplineChoicePeriod', body)
        setPeriods((prev) => [apiToPeriod(created), ...prev])
        setIsModalOpen(false)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Помилка створення періоду')
      }
      return 
    }

    if (modalMode === 'edit' && editingId) {
      const period = periods.find((p) => p.id === editingId)
      if (!period) return

      const isBeforeStart = today < draft.startDate

      try {
        let updatedDto: DisciplineChoicePeriodDto

        if (isBeforeStart) {
          const body: DisciplineChoicePeriodDto = {
            id: period.apiId,
            periodType: toPeriodType(draft.targetAudience),
            periodCourse: toPeriodCourse(draft.forCourse),
            degreeLevelId: toEduLevel(draft.eduLevelLabel),
            isClose: toIsClose(draft.status),
            facultyId,
            departmentId: DEPARTMENT_ID,
            startDate: startISO,
            endDate: endISO,
          }
          updatedDto = await apiService.put<DisciplineChoicePeriodDto>(`DisciplineChoicePeriod/${period.apiId}`, body)
        } else {
          const body = {
            id: period.apiId,
            isClose: toIsClose(draft.status),
            endDate: endISO,
          }
          await apiService.put(`DisciplineChoicePeriod/UpdateAfterStart?id=${period.apiId}`, body)
          updatedDto = { ...period, ...body, apiId: period.apiId } as any 
        }

        setPeriods((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...apiToPeriod(updatedDto as DisciplineChoicePeriodDto),
                  updatedAtLabel: 'щойно',
                }
              : p
          )
        )
        setIsModalOpen(false)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Помилка збереження періоду')
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
      <aside className="sm:w-1/4 w-full">
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 mb-4 divide-y divide-gray-100">
        
          <FilterBox
            name="Для курсу"
            options={forCourseOptions.map(opt => ({ id: opt, label: opt }))}
            accessor="id"
            valueName="label"
            selectedValues={pendingForCourse}
            onChange={setPendingForCourse}
          />

          <FilterBox
            name="Рівень освіти"
            options={[
              { id: 'Для бакалаврів', label: 'Для бакалаврів' },
              { id: 'Для магістрів', label: 'Для магістрів' },
              { id: 'Для всіх', label: 'Для всіх' }
            ]}
            accessor="id"
            valueName="label"
            selectedValues={pendingEduLevel}
            onChange={setPendingEduLevel}
          />

          <FilterBox
            name="Тип періоду"
            options={targetAudienceOptions.map(opt => ({ id: opt, label: opt }))}
            accessor="id"
            valueName="label"
            selectedValues={pendingTarget}
            onChange={setPendingTarget}
          />

          <FilterBox
            name="Статус"
            options={statusDropdownOptions.map(opt => ({ id: opt, label: opt }))}
            accessor="id"
            valueName="label"
            selectedValues={pendingStatus}
            onChange={setPendingStatus}
          />
        </div>

        <button
          onClick={handleApplyFilters}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Застосувати фільтри
        </button>
      </aside>

      <main className="sm:w-4/5 w-full">
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Періоди вибірних дисциплін</h1>
          { 
            buttonPeriodClass ? 
            <>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                <span className="text-xl leading-none">＋</span>
                Створити період
              </button>
            </>
            :
            <>
            </>
          }
        </div>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
              {error}
            </div>
          )}
          {loading ? (
            <div className="bg-white border border-gray-300 rounded-md p-6 text-gray-600">
              Завантаження…
            </div>
          ) : grouped.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-md p-6 text-gray-600">
              Немає періодів за вибраними фільтрами
            </div>
          ) : (
            grouped.map(([y, items]) => (
              <section key={y} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">{y}</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-3">
                  {items.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white border border-gray-300 rounded-md shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900">
                            Для курсу: {p.forCourse} · {fromEduLevel(p.degreeLevelId)} · Тип: {p.targetAudience}
                          </div>
                          <div className="text-sm text-gray-500">Остання зміна: {p.updatedAtLabel}</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-xl font-semibold text-gray-900 tabular-nums">
                            {formatDateRange(p.startDate, p.endDate)}
                          </div>
                          <span
                            className={[
                              'px-3 py-1 rounded-full text-sm font-medium w-24 text-center',
                              statusPillClass(p.status),
                            ].join(' ')}
                          >
                            {p.status}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
                              aria-label="Edit"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={async () => {
                                const nextStatus: PeriodStatus =
                                  p.status === 'Закрито' ? 'Відкрито' : 'Закрито'
                                if (nextStatus === 'Закрито') {
                                  setCloseConfirmPeriod(p)
                                  setCloseConfirmLockUntil(Date.now() + 5000)
                                  return
                                }
                                try {
                                  await apiService.put(
                                    `DisciplineChoicePeriod/OpenOrClose?id=${p.apiId}`,
                                    { id: p.apiId, isClose: 0 }
                                  )
                                  setPeriods((prev) =>
                                    prev.map((x) =>
                                      x.id === p.id
                                        ? {
                                            ...x,
                                            status: 'Відкрито',
                                            updatedAtLabel: 'щойно',
                                          }
                                        : x
                                    )
                                  )
                                } catch (e: unknown) {
                                  setError(
                                    e instanceof Error ? e.message : 'Помилка зміни статусу'
                                  )
                                }
                              }}
                              className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
                              aria-label="Lock"
                            >
                              <IconLock />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            ))
          )}
        </div>

        <PeriodModal
          isOpen={isModalOpen}
          mode={modalMode}
          draft={draft}
          onClose={() => setIsModalOpen(false)}
          onChangeDraft={setDraft}
          onSave={handleSave}
          error={error} 
        />

        {closeConfirmPeriod && (
          <CloseConfirmModal
            period={closeConfirmPeriod}
            lockUntil={closeConfirmLockUntil}
            onConfirm={async () => {
              try {
                await apiService.put(
                  `DisciplineChoicePeriod/OpenOrClose?id=${closeConfirmPeriod.apiId}`,
                  { id: closeConfirmPeriod.apiId, isClose: 1 }
                )
                setPeriods((prev) =>
                  prev.map((x) =>
                    x.id === closeConfirmPeriod.id
                      ? { ...x, status: 'Закрито' as PeriodStatus, updatedAtLabel: 'щойно' }
                      : x
                  )
                )
                setCloseConfirmPeriod(null)
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Помилка закриття періоду')
              }
            }}
            onClose={() => setCloseConfirmPeriod(null)}
          />
        )}
      </main>
    </div>
  )
}