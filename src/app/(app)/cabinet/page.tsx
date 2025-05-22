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
        <div className={styles.container}>
            <section className={styles.sidebar}>
                <img
                    src={student.photoUrl}
                    alt={`${student.firstName} ${student.lastName}`}
                    className={styles.avatar}
                />
                <h1 className={styles.name}>
                    {student.firstName} {student.lastName}
                </h1>
                <div className={styles.details}>
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

            <section className={styles.schedule}>
                <h2>Розклад занять</h2>
                <table className={styles.scheduleTable}>
                    <thead>
                        <tr className={styles.headerRow}>
                            <th className={styles.cell}>День</th>
                            <th className={styles.cell}>Час</th>
                            <th className={styles.cell}>Предмет</th>
                        </tr>
                    </thead>
                    <tbody>
                        {student.schedule.map((item, idx) => (
                            <tr key={idx}>
                                <td className={styles.cell}>{item.day}</td>
                                <td className={styles.cell}>{item.time}</td>
                                <td className={styles.cell}>{item.subject}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    )
}

export default StudentCabinet
