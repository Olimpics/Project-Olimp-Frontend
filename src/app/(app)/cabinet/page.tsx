'use client'

import React, { useState, useEffect } from 'react'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { apiService } from '@/services/axiosService'

// DTO
interface DisciplineDto {
    idBindMainDisciplines: number
    codeMainDisciplines: string
    nameBindMainDisciplines: string
    loans: number
    formControll?: string
    semestr: number
}
interface AdditionalDto {
    idBindAddDisciplines: number
    studentId: number
    studentFullName: string
    addDisciplinesId: number
    addDisciplineName: string
    semestr: number
    loans: number
    inProcess: boolean
}
interface PlanResponse {
    studentId: number
    studentName: string
    degreeName: string
    mainDisciplinesBySemester: Record<string, DisciplineDto[]>
    additionalDisciplinesBySemester: Record<string, AdditionalDto[]>
}
interface EventItem {
    id: number
    name: string
    date: string
    points: number
}

// static events
const staticEvents: EventItem[] = [
    { id: 1, name: 'Hackathon 2025', date: '2025-05-12', points: 5 },
    { id: 2, name: 'Workshop AI', date: '2025-06-01', points: 3 },
    { id: 3, name: 'Open Lecture', date: '2025-06-20', points: 2 },
]

export default function Page() {
    const [activeTab, setActiveTab] = useState<'schedule' | 'plan' | 'events'>(
        'schedule'
    )
    const [selectedDay, setSelectedDay] = useState<string>('Понеділок')

    const [mainBySem, setMainBySem] = useState<Record<number, DisciplineDto[]>>(
        {}
    )
    const [addBySem, setAddBySem] = useState<Record<number, AdditionalDto[]>>(
        {}
    )

    const [studentName, setStudentName] = useState('')
    const [degreeName, setDegreeName] = useState('')
    const [specialty, setSpecialty] = useState('')
    const [course, setCourse] = useState<number | null>(null)
    const [degreeLevel, setDegreeLevel] = useState('')

    // static schedule
    const defaultSchedule: Record<string, { time: string; subject: string }[]> =
        {
            Понеділок: [
                { time: '08:30 - 10:00', subject: 'Лінійна алгебра' },
                { time: '10:15 - 11:45', subject: 'Програмування на C#' },
            ],
            Вівторок: [{ time: '12:00 - 13:30', subject: 'Бази даних' }],
            Середа: [{ time: '14:00 - 15:30', subject: 'Операційні системи' }],
            Четвер: [{ time: '16:00 - 17:30', subject: 'Англійська мова' }],
            'П’ятниця': [],
        }
    const days = Object.keys(defaultSchedule)

    useEffect(() => {
        const raw = getCookie(USER_PROFLE)
        if (!raw) return
        const prof = JSON.parse(raw)
        console.log(prof)
        setStudentName(prof.name)
        setDegreeName(prof.nameFaculty)
        setSpecialty(prof.speciality || '')
        setCourse(prof.course || null)
        setDegreeLevel(prof.degreeLevel || '-')

        // fetch data from server
        const fetchPlan = async () => {
            try {
                // const { data } = await apiService.get<PlanResponse>(
                //     `/StudentPage/disciplines/by-semester/${prof.id}`
                // )

                const response = await fetch(
                    `http://185.237.207.78:5000/api/StudentPage/disciplines/by-semester/${prof.id}`
                )
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const data: PlanResponse = await response.json()
                const main = Object.fromEntries(
                    Object.entries(data.mainDisciplinesBySemester).map(
                        ([k, v]) => [Number(k), v]
                    )
                ) as Record<number, DisciplineDto[]>
                const add = Object.fromEntries(
                    Object.entries(data.additionalDisciplinesBySemester).map(
                        ([k, v]) => [Number(k), v]
                    )
                ) as Record<number, AdditionalDto[]>
                setMainBySem(main)
                setAddBySem(add)
            } catch (err: any) {
                console.error(
                    'Error fetching plan:',
                    err.response?.status || err.message
                )
            } finally {
            }
        }
        fetchPlan()
    }, [])

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 text-center mb-6 lg:mb-0">
                <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 mb-4"></div>
                <h2 className="text-xl sm:text-2xl font-semibold">
                    {studentName || '---'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                    {degreeName || '---'}
                </p>
                <p className="text-sm text-gray-700">
                    Спеціальність: {specialty || '---'}
                </p>
                <p className="text-sm text-gray-700">Курс: {course ?? '-'}</p>
                <p className="text-sm text-gray-700">
                    Освітній ступінь: {degreeLevel}
                </p>
            </aside>

            {/* Content */}
            <main className="flex-1 bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow hover:shadow-md transition">
                <nav className="flex space-x-4 border-b pb-2 mb-6 overflow-x-auto">
                    {['schedule', 'plan', 'events'].map((tab) => (
                        <button
                            key={tab}
                            className={`whitespace-nowrap pb-1 font-medium transition-colors ${
                                activeTab === tab
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'border-b-2 border-transparent hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab(tab as any)}
                        >
                            {tab === 'schedule'
                                ? 'Розклад'
                                : tab === 'plan'
                                  ? 'Навчальний план'
                                  : 'Події'}
                        </button>
                    ))}
                </nav>

                {activeTab === 'schedule' && (
                    <>
                        {/* Day tabs */}
                        <div className="flex space-x-2 overflow-x-auto mb-4">
                            {days.map((day) => (
                                <button
                                    key={day}
                                    className={`whitespace-nowrap px-3 py-1 rounded-md transition-colors ${
                                        selectedDay === day
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                    onClick={() => setSelectedDay(day)}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[400px] border-collapse">
                                <thead className="bg-blue-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">
                                            Час
                                        </th>
                                        <th className="px-4 py-2 text-left">
                                            Предмет
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {defaultSchedule[selectedDay]?.length ? (
                                        defaultSchedule[selectedDay].map(
                                            (itm, i) => (
                                                <tr
                                                    key={i}
                                                    className="hover:bg-blue-50"
                                                >
                                                    <td className="px-4 py-2">
                                                        {itm.time}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {itm.subject}
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={2}
                                                className="px-4 py-4 text-center italic text-gray-500"
                                            >
                                                Немає занять
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'plan' && (
                    <div className="space-y-8">
                        {Object.keys(mainBySem).map((s) => {
                            const sem = Number(s)
                            const main = mainBySem[sem] || []
                            const add = addBySem[sem] || []
                            return (
                                <section key={sem}>
                                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                                        {sem} семестр
                                    </h3>

                                    {/* Основні дисципліни */}
                                    <div className="overflow-x-auto mb-4">
                                        <table className="w-full min-w-[400px] border border-gray-200">
                                            <thead className="bg-blue-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">
                                                        Дисципліна
                                                    </th>
                                                    <th className="px-4 py-2 text-left">
                                                        Форма контролю
                                                    </th>
                                                    <th className="px-4 py-2 text-left">
                                                        Бали
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {main.length ? (
                                                    main.map((d, i) => (
                                                        <tr
                                                            key={
                                                                d.idBindMainDisciplines
                                                            }
                                                            className="hover:bg-blue-50"
                                                        >
                                                            <td className="px-4 py-2">
                                                                {
                                                                    d.nameBindMainDisciplines
                                                                }
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                {d.formControll ||
                                                                    '-'}
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                {d.loans}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={3}
                                                            className="px-4 py-4 text-center italic text-gray-500"
                                                        >
                                                            Немає дисциплін
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Додаткові дисципліни */}
                                    <div className="overflow-x-auto bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <h4 className="text-md sm:text-lg font-medium mb-2 text-blue-800">
                                            Додаткові дисципліни
                                        </h4>
                                        <table className="w-full min-w-[400px] border border-gray-300">
                                            <thead className="bg-blue-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">
                                                        Дисципліна
                                                    </th>
                                                    <th className="px-4 py-2 text-left">
                                                        Статус
                                                    </th>
                                                    <th className="px-4 py-2 text-left">
                                                        Бали
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {add.length ? (
                                                    add.map((d, i) => (
                                                        <tr
                                                            key={
                                                                d.idBindAddDisciplines
                                                            }
                                                            className="hover:bg-blue-50"
                                                        >
                                                            <td className="px-4 py-2">
                                                                {
                                                                    d.addDisciplineName
                                                                }
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                {d.inProcess
                                                                    ? 'В процесі'
                                                                    : 'Завершено'}
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                {d.loans}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={3}
                                                            className="px-4 py-4 text-center italic text-gray-500"
                                                        >
                                                            Немає дисциплін
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )
                        })}
                    </div>
                )}

                {activeTab === 'events' && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[400px] border border-gray-200">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">
                                        Назва події
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Дата
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Бали
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {staticEvents.map((ev) => (
                                    <tr
                                        key={ev.id}
                                        className="hover:bg-blue-50"
                                    >
                                        <td className="px-4 py-2">{ev.name}</td>
                                        <td className="px-4 py-2">{ev.date}</td>
                                        <td className="px-4 py-2">
                                            {ev.points}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    )
}
