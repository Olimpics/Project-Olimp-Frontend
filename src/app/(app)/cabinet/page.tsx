'use client'
import React, { useState, useEffect } from 'react'
import { getCookie } from '@/services/cookie-servies';
import { STUDENT_PROFLE } from '@/constants/cookies';

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
        const student_storage_raw = getCookie(STUDENT_PROFLE)
        console.log(`student_storage_raw`,student_storage_raw)
        if (!student_storage_raw) {
            console.error("No student profile found in localStorage");
            return;
        }

        const student_storage = JSON.parse(student_storage_raw); 

        const url = `http://185.237.207.78:5000/api/StudentPage/disciplines/by-semester/${student_storage.idStudents}`;

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
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
           <section className="w-full lg:w-72 text-center mb-6 lg:mb-0">
                {studentName ? (
                    <>
                        <h2 className="text-xl sm:text-2xl font-semibold">
                            {studentName}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">
                            {degreeName}
                        </p>
                    </>
                ) : (
                    <p className="text-gray-500">Завантаження профілю...</p>
                )}
            </section>

            <section className="flex-1 bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md">
                <div className="flex space-x-8 border-b pb-2 mb-4 overflow-x-auto">
                    {['schedule', 'plan'].map((tab) => (
                        <button
                            key={tab}
                            className={
                                `whitespace-nowrap pb-1 font-medium transition-colors ` +
                                (activeTab === tab
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'border-b-2 border-transparent hover:text-gray-700')
                            }
                            onClick={() => setActiveTab(tab as any)}
                        >
                            {tab === 'schedule'
                                ? 'Розклад занять'
                                : 'Навчальний план'}
                        </button>
                    ))}
                </div>

                {activeTab === 'schedule' ? (
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                        <table className="table-fixed w-full min-w-[600px] border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="hidden sm:table-cell w-1/3 border px-3 py-2 text-left text-sm sm:text-base">
                                        День
                                    </th>
                                    <th className="w-1/3 border px-3 py-2 text-left text-sm sm:text-base">
                                        Час
                                    </th>
                                    <th className="w-1/3 border px-3 py-2 text-left text-sm sm:text-base">
                                        Предмет
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {defaultSchedule.map((item, idx) => (
                                    <tr
                                        key={idx}
                                        className={
                                            idx % 2 ? 'bg-gray-50' : 'bg-white'
                                        }
                                    >
                                        <td className="hidden sm:table-cell border px-3 py-2 text-sm">
                                            {item.day}
                                        </td>
                                        <td className="border px-3 py-2 text-sm">
                                            {item.time}
                                        </td>
                                        <td className="border px-3 py-2 text-sm">
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
                            <p>Завантаження навчального плану...</p>
                        )}
                        {errorPlan && (
                            <p className="text-red-600">{errorPlan}</p>
                        )}
                        {!loadingPlan && !errorPlan && (
                            <div className="space-y-8">
                                {Object.keys(planBySemester)
                                    .map(Number)
                                    .sort((a, b) => a - b)
                                    .map((sem) => (
                                        <div key={sem}>
                                            <h3 className="text-lg sm:text-xl font-semibold mb-2">
                                                {sem} семестр
                                            </h3>
                                            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                                                <table className="table-fixed w-full min-w-[400px] border border-gray-200">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="w-1/2 border px-3 py-2 text-left text-sm sm:text-base">
                                                                Дисципліна
                                                            </th>
                                                            <th className="w-1/2 border px-3 py-2 text-left text-sm sm:text-base">
                                                                Форма контролю
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {planBySemester[sem]
                                                            ?.length ? (
                                                            planBySemester[
                                                                sem
                                                            ].map(
                                                                (disc, idx) => (
                                                                    <tr
                                                                        key={
                                                                            disc.idBindMainDisciplines
                                                                        }
                                                                        className={
                                                                            idx %
                                                                            2
                                                                                ? 'bg-gray-50'
                                                                                : 'bg-white'
                                                                        }
                                                                    >
                                                                        <td className="border px-3 py-2 text-sm sm:text-base">
                                                                            {
                                                                                disc.nameBindMainDisciplines
                                                                            }
                                                                        </td>
                                                                        <td className="border px-3 py-2 text-sm sm:text-base">
                                                                            {disc.formControll ||
                                                                                '-'}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        ) : (
                                                            <tr>
                                                                <td
                                                                    colSpan={2}
                                                                    className="border px-3 py-4 text-center italic text-gray-500 text-sm"
                                                                >
                                                                    Немає
                                                                    дисциплін
                                                                </td>
                                                            </tr>
                                                        )}
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
