'use client'

import React, { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'

type Semester = 'Осінь' | 'Весна'
type PeriodStatus = 'Відкрито' | 'Закрито' | 'Архів'

type Period = {
  id: string
  academicYear: string 
  semester: Semester
  startDate: string 
  endDate: string 
  status: PeriodStatus
  updatedAtLabel: string 
}

const academicYears = ['2025 / 2026', '2024 / 2025', '2023 / 2024']
const semesters: Semester[] = ['Осінь', 'Весна']
const statuses: PeriodStatus[] = ['Відкрито', 'Закрито', 'Архів']

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
    case 'Архів':
      return 'bg-amber-100 text-amber-800'
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

type PeriodModalMode = 'create' | 'edit'
type PeriodModalDraft = {
  academicYear: string
  semester: Semester
  startDate: string
  endDate: string
  status: PeriodStatus
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

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Рік навчання</label>
          <select
            value={draft.academicYear}
            onChange={(e) => onChangeDraft({ ...draft, academicYear: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {academicYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">Семестр</label>
          <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
            {semesters.map((s) => {
              const active = draft.semester === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChangeDraft({ ...draft, semester: s })}
                  className={[
                    'px-4 py-2 text-sm font-medium',
                    active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Дата початку</label>
            <input
              type="date"
              value={draft.startDate}
              onChange={(e) => onChangeDraft({ ...draft, startDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Дата завершення</label>
            <input
              type="date"
              value={draft.endDate}
              onChange={(e) => onChangeDraft({ ...draft, endDate: e.target.value })}
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
            {statuses.map((s) => (
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
  const [periods, setPeriods] = useState<Period[]>([
    {
      id: 'p1',
      academicYear: '2025 / 2026',
      semester: 'Осінь',
      startDate: '2025-09-01',
      endDate: '2025-09-15',
      status: 'Відкрито',
      updatedAtLabel: '2 дні тому',
    },
    {
      id: 'p2',
      academicYear: '2025 / 2026',
      semester: 'Весна',
      startDate: '2026-02-10',
      endDate: '2026-02-20',
      status: 'Закрито',
      updatedAtLabel: '5 місяців тому',
    },
  ])

  // TODO: тут фетчимо періоди з бекенду, коли будуть ендпоінти
  // useEffect(() => { fetchPeriods() }, [])

  const [pendingYear, setPendingYear] = useState<string>(academicYears[0])
  const [pendingSemester, setPendingSemester] = useState<string>('Осінь і Весна')
  const [pendingStatus, setPendingStatus] = useState<string>('Активний та Архів')

  const [year, setYear] = useState<string>(academicYears[0])
  const [semester, setSemester] = useState<string>('Осінь і Весна')
  const [status, setStatus] = useState<string>('Активний та Архів')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<PeriodModalMode>('create')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<PeriodModalDraft>({
    academicYear: academicYears[0],
    semester: 'Осінь',
    startDate: '2025-09-01',
    endDate: '2025-09-15',
    status: 'Відкрито',
  })

  const filteredPeriods = useMemo(() => {
    return periods.filter((p) => {
      if (year && p.academicYear !== year) return false

      if (semester === 'Осінь' && p.semester !== 'Осінь') return false
      if (semester === 'Весна' && p.semester !== 'Весна') return false

      if (status === 'Активний' && p.status !== 'Відкрито') return false
      if (status === 'Архів' && p.status !== 'Архів') return false

      return true
    })
  }, [periods, year, semester, status])

  const grouped = useMemo(() => {
    const map = new Map<string, Period[]>()
    for (const p of filteredPeriods) {
      if (!map.has(p.academicYear)) map.set(p.academicYear, [])
      map.get(p.academicYear)!.push(p)
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filteredPeriods])

  const handleApplyFilters = () => {
    setYear(pendingYear)
    setSemester(pendingSemester)
    setStatus(pendingStatus)
  }

  const openCreate = () => {
    setModalMode('create')
    setEditingId(null)
    setDraft({
      academicYear: pendingYear ?? academicYears[0],
      semester: 'Осінь',
      startDate: '',
      endDate: '',
      status: 'Відкрито',
    })
    setIsModalOpen(true)
  }

  const openEdit = (p: Period) => {
    setModalMode('edit')
    setEditingId(p.id)
    setDraft({
      academicYear: p.academicYear,
      semester: p.semester,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!draft.academicYear || !draft.startDate || !draft.endDate) return
    if (draft.endDate < draft.startDate) return

    if (modalMode === 'create') {
      // TODO: тут робимо POST на бекенд для створення періоду
      const next: Period = {
        id: `tmp-${Date.now()}`,
        academicYear: draft.academicYear,
        semester: draft.semester,
        startDate: draft.startDate,
        endDate: draft.endDate,
        status: draft.status,
        updatedAtLabel: 'щойно',
      }
      setPeriods((prev) => [next, ...prev])
    } else if (modalMode === 'edit' && editingId) {
      // TODO: тут робимо PUT/PATCH на бекенд для редагування періоду
      setPeriods((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                academicYear: draft.academicYear,
                semester: draft.semester,
                startDate: draft.startDate,
                endDate: draft.endDate,
                status: draft.status,
                updatedAtLabel: 'щойно',
              }
            : p
        )
      )
    }

    setIsModalOpen(false)
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
      <aside className="sm:w-1/5 w-full">
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Рік навчання</label>
            <select
              value={pendingYear}
              onChange={(e) => setPendingYear(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {academicYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Семестр</label>
            <select
              value={pendingSemester}
              onChange={(e) => setPendingSemester(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Осінь і Весна">Осінь і Весна</option>
              <option value="Осінь">Осінь</option>
              <option value="Весна">Весна</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Статус</label>
            <select
              value={pendingStatus}
              onChange={(e) => setPendingStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Активний та Архів">Активний та Архів</option>
              <option value="Активний">Активний</option>
              <option value="Архів">Архів</option>
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
          {grouped.length === 0 ? (
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
                  {items
                    .slice()
                    .sort((a, b) => a.semester.localeCompare(b.semester))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="bg-white border border-gray-300 rounded-md shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900">
                            {p.semester === 'Осінь' ? 'Осінній період' : 'Весняний період'}
                          </div>
                          <div className="text-sm text-gray-500">Остання зміна: {p.updatedAtLabel}</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-xl font-semibold text-gray-900 tabular-nums">
                            {formatDateRange(p.startDate, p.endDate)}
                          </div>
                          <span
                            className={[
                              'px-3 py-1 rounded-full text-sm font-medium',
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
                              onClick={() => {
                                setPeriods((prev) =>
                                  prev.map((x) =>
                                    x.id === p.id
                                      ? {
                                          ...x,
                                          status: x.status === 'Закрито' ? 'Відкрито' : 'Закрито',
                                          updatedAtLabel: 'щойно',
                                        }
                                      : x
                                  )
                                )
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
      </main>
    </div>
  )
}


