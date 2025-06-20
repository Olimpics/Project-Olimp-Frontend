'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'
import DataTable from '@/components/ui/DataTable'
import { FilterBox } from '@/components/ui/FilterBox'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { Modal } from '@/components/ui/Modal'
import { router } from 'next/client';
import Import_button from '@/app/(app)/catalogue/admin_catalogues/import_button';
import FileUploadModal from '@/app/(app)/catalogue/admin_catalogues/import_button';

type Discipline = {
    idAddDisciplines: number
    nameAddDisciplines: string
    codeAddDisciplines: string
    faculty: string
    degreeLevelName: string
    countOfPeople: number
    maxCountPeople: number
    fullCount: string
    courseNumber: number
    evenSemester: boolean
}

type Faculty = {
    idFaculty: number
    nameFaculty: string
    abbreviation: string
}

type EduDegree = {
    idEducationalDegree: number
    nameEducationalDegreec: string
}

type Courses = {
    courseNumber: number
}

interface Column {
    header: string
    accessor: keyof Discipline | 'studentCount'
}

const sortingOptions = [
    { label: 'Назва програми (А-Я)', value: 1 },
    { label: 'Назва програми (Я-А)', value: 2 },
    { label: 'Код спеціальності (↓)', value: 3 }, 
    { label: 'Кількість студентів (↑)', value: 4 },
    { label: 'Кількість студентів (↓)', value: 5 },
]

const Pagination: React.FC<{
    totalPages: number
    currentPage: number
    onPageChange: (page: number) => void
}> = ({ totalPages, currentPage, onPageChange }) => {
    const getPages = () => {
        const pages: (number | string)[] = []
        if (totalPages <= 16)
            return Array.from({ length: totalPages }, (_, i) => i + 1)

        pages.push(1)
        if (currentPage > 4) pages.push('...')

        const start = Math.max(2, currentPage - 1)
        const end = Math.min(totalPages - 1, currentPage + 1)
        for (let i = start; i <= end; i++) pages.push(i)

        if (currentPage < totalPages - 3) pages.push('...')
        pages.push(totalPages)

        return pages
    }

    return (
        <nav className="flex justify-center mt-4 space-x-2">
            {getPages().map((page, idx) =>
                page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-2">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(Number(page))}
                        className={`px-4 py-2 rounded ${
                            currentPage === page
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-white text-blue-600 border border-gray-300 hover:bg-blue-100'
                        }`}
                    >
                        {page}
                    </button>
                )
            )}
        </nav>
    )
}

export const AdminDisciplinesCatalogue = React.memo(() => {
    const [disciplines, setDisciplines] = useState<Discipline[]>([])
    const [faculties, setFaculties] = useState<Faculty[]>([])
    const [eduDegrees, setEduDegrees] = useState<EduDegree[]>([])
    const [courses] = useState<Courses[]>([
        { courseNumber: 1 },
        { courseNumber: 2 },
        { courseNumber: 3 },
        { courseNumber: 4 },
    ])

    const [searchTerm, setSearchTerm] = useState('')
    const [roleId, setRoleId] = useState('')
    const [pendingFaculties, setPendingFaculties] = useState<string[]>([])
    const [pendingDegrees, setPendingDegrees] = useState<string[]>([])
    const [pendingCourses, setPendingCourses] = useState<string[]>([])
    const [isEvenSemester, setIsEvenSemester] = useState<boolean | null>(null)
    const [showOnlyAvailable, setShowOnlyAvailable] = useState<string[]>([])
    const [selectedSorting, setSelectedSorting] = useState<number>(0)

    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)
    const [selectedDiscipline, setSelectedDiscipline] =
        useState<Discipline>(null)
    const fetchFilteredData = useCallback(
        async (page: number = currentPage) => {
            const studentRaw = getCookie(USER_PROFLE)

            const student = JSON.parse(studentRaw)

            setRoleId(student.roleId)

            const query = new URLSearchParams({
                pageSize: '17',
                page: page.toString(),
                search: searchTerm,
                sortOrder: selectedSorting.toString(),
            })

            if (pendingFaculties.length > 0) {
                query.append('faculties', pendingFaculties.join(','))
            }

            const degreeIds = eduDegrees
                .filter((d) =>
                    pendingDegrees.includes(d.nameEducationalDegreec)
                )
                .map((d) => d.idEducationalDegree)

            if (degreeIds.length > 0) {
                query.append('degreeLevelIds', degreeIds.join(','))
            }

            if (pendingCourses.length > 0) {
                query.append('courses', pendingCourses.join(','))
            }

            if (showOnlyAvailable.includes('Тільки доступні')) {
                query.append('onlyAvailable', 'true')
            }

            if (isEvenSemester !== null) {
                query.append('isEvenSemester', isEvenSemester.toString())
            }

            const res = await fetch(
                `http://185.237.207.78:5000/api/AddDiscipline/GetAllDisciplines?${query.toString()}`
            )
            const data = await res.json()

            const formatted = (data.items || []).map((d: Discipline) => ({
                ...d,
                studentCount: `${d.countOfPeople} / ${d.maxCountPeople}`,
            }))
            setDisciplines(formatted)
            setTotalPages(data.totalPages || 1)
        },
        [
            currentPage,
            searchTerm,
            pendingFaculties,
            pendingDegrees,
            pendingCourses,
            isEvenSemester,
            showOnlyAvailable,
            selectedSorting,
            eduDegrees,
        ]
    )
  const router = useRouter()
    useEffect(() => {
        fetchFilteredData(1)
    }, [selectedSorting])

    useEffect(() => {
        const fetchInitialData = async () => {
            const facData = await (
                await fetch('http://185.237.207.78:5000/api/Faculty')
            ).json()
            const eduData = await (
                await fetch('http://185.237.207.78:5000/api/EducationalDegree')
            ).json()

            setFaculties(facData)
            setEduDegrees(eduData)

            fetchFilteredData(1)
        }

        fetchInitialData()
    }, [])

    const handleSearch = () => {
        setCurrentPage(1)
        fetchFilteredData(1)
    }
    const handleEdit = (discipline: Discipline) => {
        setSelectedDiscipline(discipline)
        setModalType('edit')
        setIsModalOpen(true)
    }

    const handleDelete = (discipline: Discipline) => {
        setSelectedDiscipline(discipline)
        setModalType('delete')
        setIsModalOpen(true)
    }
    const columns: Column[] = [
        { header: 'Факультет', accessor: 'facultyAbbreviation' },
        { header: 'Код дисципліни', accessor: 'codeAddDisciplines' },
        { header: 'Назва дисципліни', accessor: 'nameAddDisciplines' },
        { header: 'Кількість студентів', accessor: 'studentCount' },
        { header: 'Рівень освіти', accessor: 'degreeLevelName' },
    ]

    return (
        <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
            <aside className="sm:w-1/5 w-full">
                <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4">
                    <FilterBox
                        name="Тільки доступні дисципліни"
                        options={[{ name: 'Тільки доступні' }]}
                        accessor="name"
                        selectedValues={showOnlyAvailable}
                        onChange={setShowOnlyAvailable}
                    />
                    <FilterBox
                        name="Факультет"
                        options={faculties}
                        accessor="idFaculty"
                        valueName="abbreviation"
                        selectedValues={pendingFaculties}
                        onChange={setPendingFaculties}
                    />
                    <FilterBox
                        name="Рівень освіти"
                        options={eduDegrees}
                        accessor="nameEducationalDegreec"
                        selectedValues={pendingDegrees}
                        onChange={setPendingDegrees}
                    />
                    <FilterBox
                        name="Курс"
                        options={courses}
                        accessor="courseNumber"
                        selectedValues={pendingCourses}
                        onChange={setPendingCourses}
                    />
                    <FilterBox
                        name="Парний семестр"
                        options={[
                            { label: 'Так', value: true },
                            { label: 'Ні', value: false },
                        ]}
                        accessor="label"
                        selectedValues={
                            isEvenSemester === null
                                ? []
                                : [isEvenSemester ? 'Так' : 'Ні']
                        }
                        onChange={(selected) => {
                            if (selected.includes('Так'))
                                setIsEvenSemester(true)
                            else if (selected.includes('Ні'))
                                setIsEvenSemester(false)
                            else setIsEvenSemester(null)
                        }}
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Застосувати фільтри
                </button>
            </aside>
            <main className="sm:w-4/5 w-full">
                <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 justify-between">
                    <div className="w-150 flex gap-2">
                        <input
                            type="text"
                            placeholder="Пошук дисципліни..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSearch}
                            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Пошук
                        </button>
                    </div>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Експорт
                    </button>
                <FileUploadModal/>
                    <select
                        value={selectedSorting}
                        onChange={(e) => {
                            const newSort = Number(e.target.value)
                            setSelectedSorting(newSort)
                            setCurrentPage(1)
                        }}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {sortingOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <DataTable
                        onClick={(el)=>{
                          console.log(el)
                          window.open("/discipline/"+el.idAddDisciplines) // НЕ ЧІПАТИ

                        }}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isActionEnabled={true}
                        columns={columns}
                        data={disciplines}
                    />
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={(page) => {
                            setCurrentPage(page)
                            fetchFilteredData(page)
                        }}
                    />
                </div>
            </main>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {modalType === 'edit' && selectedDiscipline && (
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">
                            Редагування дисципліни
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Назва дисципліни
                                </label>
                                <input
                                    type="text"
                                    value={
                                        selectedDiscipline.nameAddDisciplines
                                    }
                                    onChange={(e) =>
                                        setSelectedDiscipline({
                                            ...selectedDiscipline,
                                            nameAddDisciplines: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Код дисципліни
                                </label>
                                <input
                                    type="text"
                                    value={
                                        selectedDiscipline.codeAddDisciplines
                                    }
                                    onChange={(e) =>
                                        setSelectedDiscipline({
                                            ...selectedDiscipline,
                                            codeAddDisciplines: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Факультет
                                </label>
                                <select
                                    value={selectedDiscipline.faculty}
                                    onChange={(e) =>
                                        setSelectedDiscipline({
                                            ...selectedDiscipline,
                                            faculty: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    {faculties.map((faculty) => (
                                        <option
                                            key={faculty.idFaculty}
                                            value={faculty.nameFaculty}
                                        >
                                            {faculty.nameFaculty}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Рівень освіти
                                </label>
                                <select
                                    value={selectedDiscipline.degreeLevelName}
                                    onChange={(e) =>
                                        setSelectedDiscipline({
                                            ...selectedDiscipline,
                                            degreeLevelName: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    {eduDegrees.map((degree) => (
                                        <option
                                            key={degree.idEducationalDegree}
                                            value={
                                                degree.nameEducationalDegreec
                                            }
                                        >
                                            {degree.nameEducationalDegreec}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Макс. кількість студентів
                                </label>
                                <input
                                    type="number"
                                    value={selectedDiscipline.maxCountPeople}
                                    onChange={(e) =>
                                        setSelectedDiscipline({
                                            ...selectedDiscipline,
                                            maxCountPeople: parseInt(
                                                e.target.value
                                            ),
                                        })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Курс
                                </label>
                                <select
                                    value={selectedDiscipline.courseNumber}
                                    onChange={(e) =>
                                        setSelectedDiscipline({
                                            ...selectedDiscipline,
                                            courseNumber: parseInt(
                                                e.target.value
                                            ),
                                        })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    {courses.map((course) => (
                                        <option
                                            key={course.courseNumber}
                                            value={course.courseNumber}
                                        >
                                            {course.courseNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="evenSemester"
                                    checked={selectedDiscipline.evenSemester}
                                    onChange={(e) =>
                                        setSelectedDiscipline({
                                            ...selectedDiscipline,
                                            evenSemester: e.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="evenSemester"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Парний семестр
                                </label>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={async () => {}}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Зберегти
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {modalType === 'delete' && selectedDiscipline && (
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">
                            Видалення дисципліни
                        </h2>
                        <p className="mb-4">
                            Ви дійсно хочете видалити дисципліну "
                            {selectedDiscipline.nameAddDisciplines}" (код:{' '}
                            {selectedDiscipline.codeAddDisciplines})?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Скасувати
                            </button>
                            <button
                                onClick={async () => {}}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Видалити
                            </button>
                        </div>
                    </div>
                )}
            </Modal>{' '}
        </div>
    )
})
