'use client'
import React, { useState, useEffect } from 'react'

interface DisciplineDto {
    idBindMainDisciplines: number
    codeMainDisciplines: string
    nameBindMainDisciplines: string
    loans: number
    formControll?: string
    semestr: number
    // educationalProgramName
    educationalProgramName: string
}

interface PlanResponse {
    studentId: number
    studentName: string
    degreeName: string
    mainDisciplinesBySemester: Record<string, DisciplineDto[]>
    additionalDisciplinesBySemester: Record<string, any[]>
}

interface ScheduleItem {
    day: string
    time: string
    subject: string
}

const defaultSchedule: ScheduleItem[] = [
    { day: 'Понеділок', time: '08:30 - 10:00', subject: 'Лінійна алгебра' },
    { day: 'Вівторок', time: '10:15 - 11:45', subject: 'Програмування на C#' },
    { day: 'Середа', time: '12:00 - 13:30', subject: 'Бази даних' },
    { day: 'Четвер', time: '14:00 - 15:30', subject: 'Операційні системи' },
    { day: 'П’ятниця', time: '16:00 - 17:30', subject: 'Англійська мова' },
]

export default function Page() {
    // вкладки
    const [activeTab, setActiveTab] = useState<'schedule' | 'plan'>('schedule')

    // стани
    const [planBySemester, setPlanBySemester] = useState<
        Record<number, DisciplineDto[]>
    >({})
    const [studentName, setStudentName] = useState<string>('')
    const [degreeName, setDegreeName] = useState<string>('')
    const [loadingPlan, setLoadingPlan] = useState<boolean>(false)
    const [errorPlan, setErrorPlan] = useState<string | null>(null)

    // фетч
    useEffect(() => {
        const url =
            'http://185.237.207.78:5000/api/StudentPage/disciplines/by-semester/20162'
        setLoadingPlan(true)
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json() as Promise<PlanResponse>
            })
            .then((data) => {
                setStudentName(data.studentName)
                setDegreeName(data.degreeName)
                const grouped: Record<number, DisciplineDto[]> = {}
                Object.entries(data.mainDisciplinesBySemester).forEach(
                    ([sem, arr]) => {
                        grouped[Number(sem)] = arr
                    }
                )
                setPlanBySemester(grouped)
            })
            .catch((err) => {
                console.error(err)
                setErrorPlan('Не вдалося завантажити навчальний план')
            })
            .finally(() => setLoadingPlan(false))
    }, [])

    return (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 md:p-8">
            <section className="w-full md:w-72 text-center">
                {studentName ? (
                    <>
                        <div className="text-lg font-medium">{studentName}</div>
                        <div className="text-sm text-gray-600">
                            {degreeName}
                        </div>
                    </>
                ) : (
                    <div>Завантаження профілю...</div>
                )}
            </section>

            <section className="flex-1 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                <div className="flex border-b mb-4">
                    <button
                        className={`mr-6 pb-2 border-b-2 transition-colors ${
                            activeTab === 'schedule'
                                ? 'border-blue-600 text-blue-600 font-semibold'
                                : 'border-transparent hover:border-gray-300 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('schedule')}
                    >
                        Розклад занять
                    </button>
                    <button
                        className={`pb-2 border-b-2 transition-colors ${
                            activeTab === 'plan'
                                ? 'border-blue-600 text-blue-600 font-semibold'
                                : 'border-transparent hover:border-gray-300 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('plan')}
                    >
                        Навчальний план
                    </button>
                </div>

                {activeTab === 'schedule' ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="hidden sm:table-cell border px-2 sm:px-4 py-1 sm:py-2 text-left">
                                        День
                                    </th>
                                    <th className="border px-2 sm:px-4 py-1 sm:py-2 text-left">
                                        Час
                                    </th>
                                    <th className="border px-2 sm:px-4 py-1 sm:py-2 text-left">
                                        Предмет
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {defaultSchedule.map((item, idx) => (
                                    <tr
                                        key={idx}
                                        className={
                                            idx % 2 === 0
                                                ? 'bg-white'
                                                : 'bg-gray-50'
                                        }
                                    >
                                        <td className="hidden sm:table-cell border px-2 sm:px-4 py-1 sm:py-2">
                                            {item.day}
                                        </td>
                                        <td className="border px-2 sm:px-4 py-1 sm:py-2">
                                            {item.time}
                                        </td>
                                        <td className="border px-2 sm:px-4 py-1 sm:py-2">
                                            {item.subject}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div>
                        {loadingPlan && (
                            <div>Завантаження навчального плану...</div>
                        )}
                        {errorPlan && (
                            <div className="text-red-600">{errorPlan}</div>
                        )}
                        {!loadingPlan && !errorPlan && (
                            <div className="space-y-6">
                                {Object.keys(planBySemester)
                                    .map(Number)
                                    .sort((a, b) => a - b)
                                    .map((sem) => (
                                        <div key={sem}>
                                            <h3 className="text-lg font-medium mb-2">
                                                {sem} семестр
                                            </h3>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="border px-2 sm:px-4 py-1 sm:py-2 text-left">
                                                                Дисципліна
                                                            </th>
                                                            <th className="border px-2 sm:px-4 py-1 sm:py-2 text-left">
                                                                Форма контролю
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {planBySemester[
                                                            sem
                                                        ]?.map((disc) => (
                                                            <tr
                                                                key={
                                                                    disc.idBindMainDisciplines
                                                                }
                                                                className={
                                                                    disc.idBindMainDisciplines %
                                                                        2 ===
                                                                    0
                                                                        ? 'bg-gray-50'
                                                                        : 'bg-white'
                                                                }
                                                            >
                                                                <td className="border px-2 sm:px-4 py-1 sm:py-2">
                                                                    {
                                                                        disc.nameBindMainDisciplines
                                                                    }
                                                                </td>
                                                                <td className="border px-2 sm:px-4 py-1 sm:py-2">
                                                                    {disc.formControll ||
                                                                        '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    )
}
