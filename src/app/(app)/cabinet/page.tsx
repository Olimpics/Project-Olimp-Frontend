'use client'
import React, { useState } from 'react'

//interface for Disciplines
interface Disciplines {
    idBindMainDisciplines: number
    codeMainDisciplines: string
    nameBindMainDisciplines: string
    Loans: number
    formControl?: string
    semestr: number
}

//interface for Student + Schedule
interface ScheduleItem {
    day: string
    time: string
    subject: string
}
interface Student {
    id: string
    firstName: string
    lastName: string
    faculty: string
    specialty: string
    course: number
    photoUrl: string
    schedule: ScheduleItem[]
}

//static data
const defaultStudentData: Student = {
    id: '001',
    firstName: 'Олександр',
    lastName: 'Іваненко',
    faculty: 'Факультет прикладної математики',
    specialty: 'Комп’ютерні науки',
    course: 2,
    photoUrl:
        'https://static.vecteezy.com/system/resources/thumbnails/001/840/612/small_2x/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg',
    schedule: [
        { day: 'Понеділок', time: '08:30 - 10:00', subject: 'Лінійна алгебра' },
        {
            day: 'Вівторок',
            time: '10:15 - 11:45',
            subject: 'Програмування на C#',
        },
        { day: 'Середа', time: '12:00 - 13:30', subject: 'Бази даних' },
        { day: 'Четвер', time: '14:00 - 15:30', subject: 'Операційні системи' },
        { day: 'П’ятниця', time: '16:00 - 17:30', subject: 'Англійська мова' },
    ],
}

//static data
const defaultPlanData: Disciplines[] = [
    {
        idBindMainDisciplines: 1,
        codeMainDisciplines: 'MATH101',
        nameBindMainDisciplines: 'Математика I',
        Loans: 5,
        formControl: 'Екзамен',
        semestr: 1,
    },
    {
        idBindMainDisciplines: 2,
        codeMainDisciplines: 'CS102',
        nameBindMainDisciplines: 'Програмування I',
        Loans: 4,
        formControl: 'Залік',
        semestr: 1,
    },
    {
        idBindMainDisciplines: 3,
        codeMainDisciplines: 'DB103',
        nameBindMainDisciplines: 'Бази даних',
        Loans: 3,
        formControl: 'Екзамен',
        semestr: 2,
    },
    {
        idBindMainDisciplines: 4,
        codeMainDisciplines: 'OS104',
        nameBindMainDisciplines: 'Операційні системи',
        Loans: 4,
        formControl: 'Залік',
        semestr: 2,
    },
]

export default function Page() {
    const [student] = useState<Student>(defaultStudentData)
    const [activeTab, setActiveTab] = useState<'schedule' | 'plan'>('schedule')

    //move to utils
    const planBySemester = defaultPlanData.reduce<
        Record<number, Disciplines[]>
    >((acc, item) => {
        ;(acc[item.semestr] = acc[item.semestr] || []).push(item)
        return acc
    }, {})

    return (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 md:p-8">
            <section className="w-full md:w-72 text-center">
                <img
                    src={student.photoUrl}
                    alt={`${student.firstName} ${student.lastName}`}
                    className="w-24 sm:w-36 h-24 sm:h-36 mx-auto rounded-full object-cover"
                />
                <h1 className="mt-4 mb-2 text-lg md:text-xl font-semibold">
                    {student.firstName} {student.lastName}
                </h1>
                <div className="space-y-1 text-left px-4">
                    <p>
                        <strong>Факультет:</strong> {student.faculty}
                    </p>
                    <p>
                        <strong>Спеціальність:</strong> {student.specialty}
                    </p>
                    <p>
                        <strong>Курс:</strong> {student.course}
                    </p>
                </div>
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
                                {student.schedule.map((item, idx) => (
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
                    <div className="space-y-6">
                        {Object.keys(planBySemester)
                            .sort((a, b) => Number(a) - Number(b))
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
                                                        Код
                                                    </th>
                                                    <th className="border px-2 sm:px-4 py-1 sm:py-2 text-left">
                                                        Дисципліна
                                                    </th>
                                                    <th className="border px-2 sm:px-4 py-1 sm:py-2 text-left">
                                                        Кредити
                                                    </th>
                                                    <th className="border px-2 sm:px-4 py-1 sm:py-2 text-left">
                                                        Форма контролю
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {planBySemester[
                                                    Number(sem)
                                                ].map((disc) => (
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
                                                                disc.codeMainDisciplines
                                                            }
                                                        </td>
                                                        <td className="border px-2 sm:px-4 py-1 sm:py-2">
                                                            {
                                                                disc.nameBindMainDisciplines
                                                            }
                                                        </td>
                                                        <td className="border px-2 sm:px-4 py-1 sm:py-2">
                                                            {disc.Loans}
                                                        </td>
                                                        <td className="border px-2 sm:px-4 py-1 sm:py-2">
                                                            {disc.formControl ||
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
            </section>
        </div>
    )
}
