'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
    adminCatalogService,
    CampaignDiscipline,
    StudentBySelective,
} from '@/services/adminCatalogService'

const CampaignDisciplinesPage = () => {
    const [disciplines, setDisciplines] = useState<CampaignDiscipline[]>([])
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [notice, setNotice] = useState('')

    const [expanded, setExpanded] = useState<string | null>(null)
    const [studentsByDisc, setStudentsByDisc] = useState<Record<string, StudentBySelective[]>>({})
    const [loadingStudents, setLoadingStudents] = useState<string | null>(null)

    const fetchDisciplines = useCallback(async (p: number, term: string) => {
        setLoading(true)
        setError(null)
        try {
            const data = await adminCatalogService.getCampaignDisciplines({ page: p, search: term })
            setDisciplines(data.items || [])
            setTotalPages(data.totalPages || 1)
            setPage(data.currentPage || p)
        } catch (e: any) {
            setError(e?.message || 'Не вдалося завантажити дисципліни')
            setDisciplines([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDisciplines(1, '')
    }, [fetchDisciplines])

    const toggleExpand = async (disciplineId: string) => {
        if (expanded === disciplineId) {
            setExpanded(null)
            return
        }
        setExpanded(disciplineId)
        if (!studentsByDisc[disciplineId]) {
            setLoadingStudents(disciplineId)
            try {
                const data = await adminCatalogService.getStudentsByDiscipline(disciplineId)
                setStudentsByDisc((prev) => ({ ...prev, [disciplineId]: data.items || [] }))
            } catch {
                setStudentsByDisc((prev) => ({ ...prev, [disciplineId]: [] }))
            } finally {
                setLoadingStudents(null)
            }
        }
    }

    const handleCancel = async (disciplineId: string, studentId: string) => {
        try {
            await adminCatalogService.repealChoice(studentId, disciplineId)
            setStudentsByDisc((prev) => ({
                ...prev,
                [disciplineId]: (prev[disciplineId] || []).filter((s) => s.studentId !== studentId),
            }))
            setDisciplines((prev) =>
                prev.map((d) =>
                    d.disciplineId === disciplineId ? { ...d, currentCount: Math.max(0, d.currentCount - 1) } : d,
                ),
            )
            setNotice('Вибір студента скасовано')
        } catch (e: any) {
            setNotice(e?.response?.data?.message || 'Не вдалося скасувати вибір')
        }
        setTimeout(() => setNotice(''), 4000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-3">
                <Link href="/course-catalogue" className="px-4 py-2 text-sm font-semibold border-b-4 border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors">
                    Студенти
                </Link>
                <Link href="/course-catalogue/disciplines" className="px-4 py-2 text-sm font-semibold border-b-4 border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors">
                    Статус набору
                </Link>
                <span className="px-4 py-2 text-sm font-semibold border-b-4 border-blue-600 text-blue-700">
                    Поточний вибір
                </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Каталог поточного вибору</h1>
            <p className="text-sm text-slate-500 mb-5">Дисципліни активної кампанії вибору. Підтвердження виконується автоматично після завершення періоду перевірки.</p>

            <div className="flex gap-2 mb-5 max-w-xl">
                <input
                    type="text"
                    placeholder="Пошук дисципліни…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchDisciplines(1, search)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={() => fetchDisciplines(1, search)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                    Пошук
                </button>
            </div>

            {notice && <div className="mb-4 px-4 py-2 rounded bg-blue-50 text-blue-700 text-sm border border-blue-200">{notice}</div>}
            {error && <div className="mb-4 px-4 py-2 rounded bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

            {loading ? (
                <div className="p-8 text-gray-600 text-sm">Завантаження…</div>
            ) : disciplines.length === 0 ? (
                <div className="p-8 text-gray-500 italic text-sm">Немає дисциплін у поточній кампанії</div>
            ) : (
                <div className="space-y-3">
                    {disciplines.map((d) => {
                        const isOpen = expanded === d.disciplineId
                        const students = studentsByDisc[d.disciplineId] || []
                        return (
                            <div key={d.disciplineId} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => toggleExpand(d.disciplineId)}
                                    className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                                >
                                    <div>
                                        <p className="font-medium text-slate-800">{d.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {d.code ? `${d.code} · ` : ''}{d.departmentName || ''}
                                            {d.facultyAbbreviation ? ` · ${d.facultyAbbreviation}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-slate-600">
                                            Обрали: <b className="text-blue-700">{d.currentCount}</b>
                                            {d.maxCountPeople ? ` / ${d.maxCountPeople}` : ''}
                                        </span>
                                        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                                        {loadingStudents === d.disciplineId ? (
                                            <p className="text-sm text-gray-500 py-2">Завантаження студентів…</p>
                                        ) : students.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic py-2">Немає студентів</p>
                                        ) : (
                                            <ul className="divide-y divide-slate-100">
                                                {students.map((s) => (
                                                    <li key={s.studentId} className="flex items-center justify-between gap-3 py-2.5">
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800">{s.studentName}</p>
                                                            <p className="text-xs text-slate-400">{s.groupCode} · {s.faculty} · {s.year} курс</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCancel(d.disciplineId, s.studentId)}
                                                            className="text-sm font-medium text-red-600 hover:text-red-700"
                                                        >
                                                            Скасувати вибір
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => fetchDisciplines(p, search)}
                            className={`px-4 py-2 rounded ${page === p ? 'bg-blue-600 text-white font-bold' : 'bg-white text-blue-600 border border-gray-300 hover:bg-blue-100'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CampaignDisciplinesPage
