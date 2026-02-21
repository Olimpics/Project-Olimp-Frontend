'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { apiService } from '@/services/axiosService'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'

const DEPARTMENT_ID = 21

type TargetAudience = 'Всіх' | 'Перевибір'
type PeriodStatus = 'Відкрито' | 'Закрито'

type ForCourse = '1' | '2' | '3' | 'Для всіх'

type Period = {
  id: string
  apiId: number
  forCourse: ForCourse
  targetAudience: TargetAudience
  startDate: string
  endDate: string
  status: PeriodStatus
  updatedAtLabel: string
}

// API: periodType 0=Всіх 1=Перевибір, periodCourse 0=Для всіх 1,2,3, isClose 0=Відкрито 1=Закрито
type DisciplineChoicePeriodDto = {
  id?: number
  periodType: number
  periodCourse: number
  isClose: number
  facultyId?: number
  departmentId?: number
  startDate: string
  endDate: string
}

function toPeriodType(t: TargetAudience): number {
  return t === 'Всіх' ? 0 : 1
}
function fromPeriodType(n: number): TargetAudience {
  return n === 0 ? 'Всіх' : 'Перевибір'
}
function toPeriodCourse(c: ForCourse): number {
  if (c === 'Для всіх') return 0
  return Number(c) as 1 | 2 | 3
}
function fromPeriodCourse(n: number): ForCourse {
  if (n === 0) return 'Для всіх'
  return String(n) as ForCourse
}
function toIsClose(s: PeriodStatus): number {
  return s === 'Закрито' ? 1 : 0
}
function fromIsClose(n: number): PeriodStatus {
  return n === 1 ? 'Закрито' : 'Відкрито'
}

function apiToPeriod(dto: DisciplineChoicePeriodDto): Period {
  const start = dto.startDate.slice(0, 10)
  const end = dto.endDate.slice(0, 10)
  return {
    id: String(dto.id),
    apiId: dto.id ?? 0,
    forCourse: fromPeriodCourse(dto.periodCourse),
    targetAudience: fromPeriodType(dto.periodType),
    startDate: start,
    endDate: end,
    status: fromIsClose(dto.isClose),
    updatedAtLabel: '—',
  }
}

const forCourseOptions: ForCourse[] = ['Для всіх', '1', '2', '3']
const targetAudienceOptions: TargetAudience[] = ['Всіх', 'Перевибір']
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
          Період: для курсу {period.forCourse}, семестр {period.targetAudience},{' '}
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
}: {
  isOpen: boolean
  mode: PeriodModalMode
  draft: PeriodModalDraft
  onClose: () => void
  onChangeDraft: (next: PeriodModalDraft) => void
  onSave: () => void
}) {
  const title = mode === 'create' ? 'Створення періоду' : 'Редагування періоду'
  const isEdit = mode === 'edit'
  const minStartDate = getTomorrowYYYYMMDD()

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
        <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
          При редагуванні можна змінити лише дату завершення та статус (відкрито/закрито).
        </p>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Для курсу</label>
          <select
            value={draft.forCourse}
            onChange={(e) => onChangeDraft({ ...draft, forCourse: e.target.value as ForCourse })}
            disabled={isEdit}
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
          <label className="block text-sm text-gray-600 mb-1">Семестр</label>
          <select
            value={draft.targetAudience}
            onChange={(e) => onChangeDraft({ ...draft, targetAudience: e.target.value as TargetAudience })}
            disabled={isEdit}
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
              disabled={isEdit}
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
            {!isEdit && draft.startDate && (
              <p className="mt-0.5 text-xs text-gray-500">Не раніше дати початку</p>
            )}
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

  const [pendingForCourse, setPendingForCourse] = useState<ForCourse>('Для всіх')
  const [pendingTarget, setPendingTarget] = useState<string>('Всіх')
  const [pendingStatus, setPendingStatus] = useState<string>('Усі')

  const [forCourse, setForCourse] = useState<ForCourse>('Для всіх')
  const [targetFilter, setTargetFilter] = useState<string>('Всіх')
  const [statusFilter, setStatusFilter] = useState<string>('Усі')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<PeriodModalMode>('create')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [closeConfirmPeriod, setCloseConfirmPeriod] = useState<Period | null>(null)
  const [closeConfirmLockUntil, setCloseConfirmLockUntil] = useState(0)
  const [draft, setDraft] = useState<PeriodModalDraft>({
    forCourse: 'Для всіх',
    targetAudience: 'Всіх',
    startDate: '2025-09-01',
    endDate: '2025-09-15',
    status: 'Відкрито',
  })

  const filteredPeriods = useMemo(() => {
    return periods.filter((p) => {
      if (forCourse && p.forCourse !== forCourse) return false

      if (targetFilter === 'Всіх' && p.targetAudience !== 'Всіх') return false
      if (targetFilter === 'Перевибір' && p.targetAudience !== 'Перевибір') return false

      if (statusFilter === 'Відкрито' && p.status !== 'Відкрито') return false
      if (statusFilter === 'Закрито' && p.status !== 'Закрито') return false

      return true
    })
  }, [periods, forCourse, targetFilter, statusFilter])

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

  const handleApplyFilters = () => {
    setForCourse(pendingForCourse)
    setTargetFilter(pendingTarget)
    setStatusFilter(pendingStatus)
  }

  const openCreate = () => {
    setError(null)
    setModalMode('create')
    setEditingId(null)
    setDraft({
      forCourse: 'Для всіх',
      targetAudience: 'Всіх',
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
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!draft.startDate || !draft.endDate) return
    if (draft.endDate < draft.startDate) return

    const facultyId = getFacultyId()
    const startISO = `${draft.startDate}T00:00:00.000Z`
    const endISO = `${draft.endDate}T23:59:59.999Z`
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
          isClose: toIsClose(draft.status),
          facultyId,
          departmentId: DEPARTMENT_ID,
          startDate: startISO,
          endDate: endISO,
        }
        const created = await apiService.post<DisciplineChoicePeriodDto>(
          'DisciplineChoicePeriod',
          body
        )
        setPeriods((prev) => [apiToPeriod(created), ...prev])
        setIsModalOpen(false)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Помилка створення періоду')
      }
    } else if (modalMode === 'edit' && editingId) {
      const period = periods.find((p) => p.id === editingId)
      if (!period) return
      try {
        const body = {
          id: period.apiId,
          isClose: toIsClose(draft.status),
          endDate: `${draft.endDate}T23:59:59.999Z`,
        }
        await apiService.put(
          `DisciplineChoicePeriod/UpdateAfterStart?id=${period.apiId}`,
          body
        )
        setPeriods((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  endDate: draft.endDate,
                  status: draft.status,
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
      <aside className="sm:w-1/5 w-full">
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Для курсу</label>
            <select
              value={pendingForCourse}
              onChange={(e) => setPendingForCourse(e.target.value as ForCourse)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {forCourseOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Семестр</label>
            <select
              value={pendingTarget}
              onChange={(e) => setPendingTarget(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Всіх">Всіх</option>
              <option value="Перевибір">Перевибір</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Статус</label>
            <select
              value={pendingStatus}
              onChange={(e) => setPendingStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Усі">Усі</option>
              <option value="Відкрито">Відкрито</option>
              <option value="Закрито">Закрито</option>
            </select>
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
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Періоди вибірних дисциплін</h1>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <span className="text-xl leading-none">＋</span>
            Створити період
          </button>
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
                            Для курсу: {p.forCourse} · Семестр: {p.targetAudience}
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


