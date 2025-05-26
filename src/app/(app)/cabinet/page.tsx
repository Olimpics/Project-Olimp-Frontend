'use client'

import React, { useState, useEffect } from 'react'
import styles from './studentCabinet.module.css'

interface ScheduleItem {
    day: string
    time: string
    subject: string
}

interface Student {
    id: number
    firstName: string
    lastName: string
    faculty: string
    specialty: string
    course: number
    photoUrl: string
    schedule: ScheduleItem[]
}

const defaultStudentData: Student = {
    id: 1,
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

const StudentCabinet: React.FC = () => {
    const [student, setStudent] = useState<Student | null>(defaultStudentData)
    const [error, setError] = useState<string | null>(null)

    // useEffect(() => {
    //     async function loadStudent() {
    //         try {
    //             const res = await fetch('/api/student')
    //             if (!res.ok) throw new Error(`HTTP ${res.status}`)
    //             const data: Student = await res.json()
    //             setStudent(data)
    //         } catch (e: any) {
    //             console.error(e)
    //             setError('Не вдалося завантажити дані студента')
    //         }
    //     }
    //     loadStudent()
    // }, [])

    if (error) {
        return <div style={{ padding: '1rem', color: 'red' }}>{error}</div>
    }
    if (!student) {
        return <div style={{ padding: '1rem' }}>Завантаження...</div>
    }

    return (
        <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-8 p-4 md:p-8">
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
                <h2 className="text-xl sm:text-2xl text-black-600 mb-4 inline-block border-b-2 border-black-600 pb-1">
                    Розклад занять
                </h2>
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
            </section>
        </div>
    )
}

export default StudentCabinet
