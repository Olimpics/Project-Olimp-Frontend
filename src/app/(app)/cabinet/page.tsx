'use client'

import React, { useState, useEffect } from 'react'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { apiService } from '@/services/axiosService'

// DTOs for student
interface DisciplineDto {
    idBindMainDisciplines: number
    codeMainDisciplines: string
    nameBindMainDisciplines: string
    loans: number
    formControll?: string
    semestr: number
    teachers: string
    educationalProgramName: string
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
    mainDisciplines: DisciplineDto[]
    additionalDisciplines: AdditionalDto[]
}
interface EventItem {
    id: number
    name: string
    date: string
    points: number
}

// Admin DTOs
interface StudentGrade {
    id: number
    fullName: string
    facultyAbbr: string
    department: string
    group: string
    semesterGrade: number | string
}

// Icons
const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
)

const ExportIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
)

// Static events for student
const staticEvents: EventItem[] = [
    { id: 1, name: 'Hackathon 2025', date: '2025-05-12', points: 5 },
    { id: 2, name: 'Workshop AI', date: '2025-06-01', points: 3 },
    { id: 3, name: 'Open Lecture', date: '2025-06-20', points: 2 },
]

// Mock data for admin
const initialStudentGrades: StudentGrade[] = [
    { id: 1, fullName: 'Іванов Іван Іванович', facultyAbbr: 'ФІТ', department: 'Кафедра ПЗ', group: 'ПЗ-21', semesterGrade: 95 },
    { id: 2, fullName: 'Петров Петро Петрович', facultyAbbr: 'ФІТ', department: 'Кафедра ПЗ', group: 'ПЗ-21', semesterGrade: 88 },
    { id: 3, fullName: 'Сидоров Сидір Сидорович', facultyAbbr: 'ФІТ', department: 'Кафедра ПЗ', group: 'ПЗ-22', semesterGrade: 75 },
    { id: 4, fullName: 'Коваленко Ганна Олександрівна', facultyAbbr: 'ФІТ', department: 'Кафедра ПЗ', group: 'ПЗ-21', semesterGrade: 92 },
    { id: 5, fullName: 'Бондаренко Олексій Сергійович', facultyAbbr: 'ФІТ', department: 'Кафедра КН', group: 'КН-21', semesterGrade: 84 },
    { id: 6, fullName: 'Ткаченко Марія Ігорівна', facultyAbbr: 'ФІТ', department: 'Кафедра ПЗ', group: 'ПЗ-21', semesterGrade: 91 },
    { id: 7, fullName: 'Мельник Дмитро Володимирович', facultyAbbr: 'ФЕУ', department: 'Кафедра ІСТ', group: 'ІСТ-11', semesterGrade: 79 },
    { id: 8, fullName: 'Шевченко Олена Вікторівна', facultyAbbr: 'ФАКС', department: 'Кафедра КН', group: 'КН-21', semesterGrade: 86 },
]

const mockSubjects = ['Лінійна алгебра', 'Програмування на C#', 'Бази даних']
const mockFaculties = ['ФІТ', 'ФЕУ', 'ФАКС']
const mockDepartments = ['Кафедра ПЗ', 'Кафедра КН', 'Кафедра ІСТ']
const mockGroups = ['ПЗ-21', 'ПЗ-22', 'КН-21']

export default function Page() {
    const [roleId, setRoleId] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState<string>('')

    // Common Profile State
    const [userName, setUserName] = useState('')
    const [degreeName, setDegreeName] = useState('')
    const [specialty, setSpecialty] = useState('')
    const [course, setCourse] = useState<number | null>(null)
    const [degreeLevel, setDegreeLevel] = useState('')
    const [educationalProgram, setEducationalProgram] = useState('')

    // Student Specific State
    const [selectedDay, setSelectedDay] = useState<string>('Понеділок')
    const [mainBySem, setMainBySem] = useState<Record<number, DisciplineDto[]>>({})
    const [addBySem, setAddBySem] = useState<Record<number, AdditionalDto[]>>({})

    // Admin Specific State
    const [selectedSubject, setSelectedSubject] = useState(mockSubjects[0])
    const [searchTerm, setSearchTerm] = useState('')
    const [facultyFilter, setFacultyFilter] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [groupFilter, setGroupFilter] = useState('')
    const [studentGrades, setStudentGrades] = useState<StudentGrade[]>(initialStudentGrades)
    const [editingGradeId, setEditingGradeId] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    useEffect(() => {
        const raw = getCookie(USER_PROFLE)
        if (!raw) return
        try {
            const prof = JSON.parse(raw)
            setRoleId(prof.roleId || 1)
            setUserName(prof.name)
            setDegreeName(prof.nameFaculty)
            setSpecialty(prof.speciality || '')
            setCourse(prof.course || null)
            setDegreeLevel(prof.degreeLevel || '-')

            if (prof.roleId === 2) {
                setActiveTab('student_grades')
            } else {
                setActiveTab('schedule')
                fetchStudentPlan(prof.id)
            }
        } catch (e) {
            console.error('Error parsing profile cookie', e)
        }
    }, [])

    const fetchStudentPlan = async (studentId: number) => {
        try {
            const data = await apiService.get<PlanResponse>(
                `StudentPage/educational-program/${studentId}`
            )
            if (data.mainDisciplines && data.mainDisciplines.length > 0) {
                setEducationalProgram(data.mainDisciplines[0].educationalProgramName)
            }
            const mainGrouped: Record<number, DisciplineDto[]> = {}
            data.mainDisciplines.forEach((d) => {
                if (!mainGrouped[d.semestr]) mainGrouped[d.semestr] = []
                mainGrouped[d.semestr].push(d)
            })
            const addGrouped: Record<number, AdditionalDto[]> = {}
            data.additionalDisciplines.forEach((d) => {
                if (!addGrouped[d.semestr]) addGrouped[d.semestr] = []
                addGrouped[d.semestr].push(d)
            })
            setMainBySem(mainGrouped)
            setAddBySem(addGrouped)
        } catch (err: any) {
            console.error('Error fetching plan:', err.message)
        }
    }

    const defaultSchedule: Record<string, { time: string; subject: string }[]> = {
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

    const handleGradeChange = (id: number, value: string) => {
        setStudentGrades(prev => prev.map(sg => sg.id === id ? { ...sg, semesterGrade: value } : sg))
    }

    const filteredGrades = studentGrades.filter(sg => {
        const matchesSearch = sg.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFaculty = facultyFilter ? sg.facultyAbbr === facultyFilter : true
        const matchesDept = departmentFilter ? sg.department === departmentFilter : true
        const matchesGroup = groupFilter ? sg.group === groupFilter : true
        return matchesSearch && matchesFaculty && matchesDept && matchesGroup
    })

    const totalPages = Math.ceil(filteredGrades.length / itemsPerPage)
    const paginatedGrades = filteredGrades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const renderStudentView = () => (
        <>
            <nav className="flex space-x-4 border-b pb-2 mb-6 overflow-x-auto">
                {['schedule', 'plan', 'events'].map((tab) => (
                    <button
                        key={tab}
                        className={`whitespace-nowrap pb-1 font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'border-b-2 border-transparent hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'schedule' ? 'Розклад' : tab === 'plan' ? 'Навчальний план' : 'Події'}
                    </button>
                ))}
            </nav>

            {activeTab === 'schedule' && (
                <>
                    <div className="flex space-x-2 overflow-x-auto mb-4">
                        {days.map((day) => (
                            <button
                                key={day}
                                className={`whitespace-nowrap px-3 py-1 rounded-md transition-colors ${
                                    selectedDay === day ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                                    <th className="px-4 py-2 text-left">Час</th>
                                    <th className="px-4 py-2 text-left">Предмет</th>
                                </tr>
                            </thead>
                            <tbody>
                                {defaultSchedule[selectedDay]?.length ? (
                                    defaultSchedule[selectedDay].map((itm, i) => (
                                        <tr key={i} className="hover:bg-blue-50">
                                            <td className="px-4 py-2">{itm.time}</td>
                                            <td className="px-4 py-2">{itm.subject}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-4 text-center italic text-gray-500">Немає занять</td>
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
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">{sem} семестр</h3>
                                <div className="overflow-x-auto mb-4">
                                    <table className="w-full min-w-[400px] border border-gray-200">
                                        <thead className="bg-blue-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Дисципліна</th>
                                                <th className="px-4 py-2 text-left">Форма контролю</th>
                                                <th className="px-4 py-2 text-left">Бали</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {main.length ? main.map((d) => (
                                                <tr key={d.idBindMainDisciplines} className="hover:bg-blue-50">
                                                    <td className="px-4 py-2">{d.nameBindMainDisciplines}</td>
                                                    <td className="px-4 py-2">{d.formControll || '-'}</td>
                                                    <td className="px-4 py-2">{d.loans}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={3} className="px-4 py-4 text-center italic text-gray-500">Немає дисциплін</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="overflow-x-auto bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="text-md sm:text-lg font-medium mb-2 text-blue-800">Додаткові дисципліни</h4>
                                    <table className="w-full min-w-[400px] border border-gray-300">
                                        <thead className="bg-blue-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Дисципліна</th>
                                                <th className="px-4 py-2 text-left">Статус</th>
                                                <th className="px-4 py-2 text-left">Бали</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {add.length ? add.map((d) => (
                                                <tr key={d.idBindAddDisciplines} className="hover:bg-blue-50">
                                                    <td className="px-4 py-2">{d.addDisciplineName}</td>
                                                    <td className="px-4 py-2">{d.inProcess ? 'В процесі' : 'Завершено'}</td>
                                                    <td className="px-4 py-2">{d.loans}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={3} className="px-4 py-4 text-center italic text-gray-500">Немає дисциплін</td></tr>
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
                                <th className="px-4 py-2 text-left">Назва події</th>
                                <th className="px-4 py-2 text-left">Дата</th>
                                <th className="px-4 py-2 text-left">Бали</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staticEvents.map((ev) => (
                                <tr key={ev.id} className="hover:bg-blue-50">
                                    <td className="px-4 py-2">{ev.name}</td>
                                    <td className="px-4 py-2">{ev.date}</td>
                                    <td className="px-4 py-2">{ev.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )

    const renderAdminView = () => (
        <>
            <nav className="flex space-x-4 border-b pb-2 mb-6 overflow-x-auto">
                <button
                    className={`whitespace-nowrap pb-1 font-medium border-b-2 border-blue-600 text-blue-600 transition-colors`}
                >
                    Оцінки студентів
                </button>
            </nav>

            {activeTab === 'student_grades' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
                            Генерувати семестрову відомість
                        </button>
                        <div className="flex items-center gap-2">
                            <label className="text-gray-700 font-medium">Предмет:</label>
                            <select 
                                value={selectedSubject} 
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {mockSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <input 
                            type="text" 
                            placeholder="Пошук (ПІБ)..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="border border-gray-300 rounded px-3 py-2"
                        />
                        <select 
                            value={facultyFilter} 
                            onChange={(e) => {
                                setFacultyFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="border border-gray-300 rounded px-3 py-2"
                        >
                            <option value="">Усі факультети</option>
                            {mockFaculties.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <select 
                            value={departmentFilter} 
                            onChange={(e) => {
                                setDepartmentFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="border border-gray-300 rounded px-3 py-2"
                        >
                            <option value="">Усі кафедри</option>
                            {mockDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select 
                            value={groupFilter} 
                            onChange={(e) => {
                                setGroupFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="border border-gray-300 rounded px-3 py-2"
                        >
                            <option value="">Усі групи</option>
                            {mockGroups.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <div className="flex justify-end mb-2 gap-2 items-center">
                            <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">
                                Прийняти зміни
                            </button>
                            <button title="Експорт" className="text-gray-600 hover:text-blue-600 transition p-1">
                                <ExportIcon />
                            </button>
                        </div>
                        <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
                            <table className="w-full min-w-[800px] border-collapse bg-white">
                                <thead className="bg-blue-600 text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-16">№ з/п</th>
                                        <th className="px-4 py-3 text-left">ПІБ</th>
                                        <th className="px-4 py-3 text-left">Факультет</th>
                                        <th className="px-4 py-3 text-left">Кафедра</th>
                                        <th className="px-4 py-3 text-left">Група</th>
                                        <th className="px-4 py-3 text-left w-40">Семестрова оцінка</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedGrades.map((sg, idx) => (
                                        <tr key={sg.id} className="border-b hover:bg-blue-50 transition">
                                            <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                            <td className="px-4 py-3 font-medium">{sg.fullName}</td>
                                            <td className="px-4 py-3">{sg.facultyAbbr}</td>
                                            <td className="px-4 py-3">{sg.department}</td>
                                            <td className="px-4 py-3">{sg.group}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 group/grade">
                                                    {editingGradeId === sg.id ? (
                                                        <input 
                                                            autoFocus
                                                            type="text" 
                                                            value={sg.semesterGrade}
                                                            onChange={(e) => handleGradeChange(sg.id, e.target.value)}
                                                            onBlur={() => setEditingGradeId(null)}
                                                            onKeyDown={(e) => e.key === 'Enter' && setEditingGradeId(null)}
                                                            className="w-20 border-2 border-blue-500 rounded px-2 py-1 outline-none"
                                                        />
                                                    ) : (
                                                        <>
                                                            <button 
                                                                onClick={() => setEditingGradeId(sg.id)}
                                                                className="opacity-0 group-hover/grade:opacity-100 text-gray-400 hover:text-blue-600 transition order-first"
                                                            >
                                                                <EditIcon />
                                                            </button>
                                                            <span 
                                                                className="min-w-[40px] cursor-pointer"
                                                                onDoubleClick={() => setEditingGradeId(sg.id)}
                                                            >
                                                                {sg.semesterGrade}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedGrades.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center text-gray-500 italic">Студентів не знайдено</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-1 mt-4">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded text-sm font-medium transition ${
                                        currentPage === i + 1 
                                            ? 'bg-blue-600 text-white' 
                                            : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    )

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50">
            <aside className="w-full lg:w-64 bg-white p-6 rounded-lg shadow border border-gray-200 text-center h-fit sticky top-8">
                <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-400">
                        {userName ? userName.charAt(0) : '?'}
                    </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                    {userName || '---'}
                </h2>
                <p className="text-sm text-blue-600 mb-4 font-medium">
                    {roleId === 2 ? 'Адміністратор' : 'Студент'}
                </p>
                <div className="space-y-3 text-left border-t pt-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase font-bold">Факультет</span>
                        <span className="text-sm text-gray-700 font-medium">{degreeName || '---'}</span>
                    </div>
                    {specialty && (
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase font-bold">Спеціальність</span>
                            <span className="text-sm text-gray-700 font-medium">{specialty}</span>
                        </div>
                    )}
                    {educationalProgram && (
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase font-bold">Освітня програма</span>
                            <span className="text-sm text-gray-700 font-medium">{educationalProgram}</span>
                        </div>
                    )}
                    {course && (
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase font-bold">Курс</span>
                            <span className="text-sm text-gray-700 font-medium">{course}</span>
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase font-bold">Освітній ступінь</span>
                        <span className="text-sm text-gray-700 font-medium">{degreeLevel}</span>
                    </div>
                </div>
            </aside>

            <main className="flex-1 bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow border border-gray-200">
                {roleId === 2 ? renderAdminView() : renderStudentView()}
            </main>
        </div>
    )
}
