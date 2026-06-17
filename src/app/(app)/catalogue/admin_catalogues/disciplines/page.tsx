'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'
import clsx from 'clsx'
import DataTable from '@/components/ui/DataTable'
import { FilterBox } from '@/components/ui/FilterBox'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { Modal } from '@/components/ui/Modal'
import { apiService } from '@/services/axiosService'
import { adminCatalogService } from '@/services/adminCatalogService'
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
    const router = useRouter()
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
    const [archivedFilter, setArchivedFilter] = useState<'all' | 'active' | 'archived'>('all')
    const [deleting, setDeleting] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)
    const [selectedSorting, setSelectedSorting] = useState<number>(0)

    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)
    const [selectedDiscipline, setSelectedDiscipline] =
        useState<Discipline | null>(null)

    const [isAddMainModalOpen, setIsAddMainModalOpen] = useState(false)
    const [isCopyPastModalOpen, setIsCopyPastModalOpen] = useState(false)
    const [catalogYears, setCatalogYears] = useState<any[]>([])
    const [selectedCatalogId, setSelectedCatalogId] = useState<string | number | ''>('')
    const [pastDisciplines, setPastDisciplines] = useState<{ id: string | number; code: string; name: string }[]>([])
    const [pastSearchTerm, setPastSearchTerm] = useState('')
    const [selectedPastDisciplineId, setSelectedPastDisciplineId] = useState<string | number | ''>('')

    const fetchCatalogs = async () => {
        try {
            const data = await apiService.get<any[]>('Parameters/CatalogYearsSelective')
            setCatalogYears(data)
        } catch (error) {
            console.error('Failed to fetch catalogs', error)
        }
    }

    const fetchPastDisciplines = useCallback(async (catalogId: string | number, search: string = '') => {
        try {
            const data = await apiService.get<any>(`Filter/add-disciplines-paged?CatalogYearId=${catalogId}&search=${encodeURIComponent(search)}`)
            const items = (data.items || []).map((item: any) => ({
                id: item.idAddDisciplines || item.id,
                name: item.nameAddDisciplines || item.name,
                code: item.codeAddDisciplines || item.code
            }))
            setPastDisciplines(items)
        } catch (error) {
            console.error('Failed to fetch past disciplines', error)
        }
    }, [])

    useEffect(() => {
        if (selectedCatalogId !== '') {
            fetchPastDisciplines(selectedCatalogId, pastSearchTerm)
        } else {
            setPastDisciplines([])
        }
    }, [selectedCatalogId, pastSearchTerm, fetchPastDisciplines])

    const fetchFilteredData = useCallback(
        async (page: number = currentPage) => {
            const studentRaw = getCookie(USER_PROFLE)
            if (!studentRaw) return

            try {
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

                if (archivedFilter === 'active') query.append('isArchived', 'false')
                else if (archivedFilter === 'archived') query.append('isArchived', 'true')

                const data = await apiService.get<any>(
                    `DisciplineTabAdmin/GetAllDisciplines?${query.toString()}`
                )

                const formatted = (data.items || []).map((d: Discipline) => ({
                    ...d,
                    studentCount: `${d.countOfPeople} / ${d.maxCountPeople}`,
                }))
                setDisciplines(formatted)
                setTotalPages(data.totalPages || 1)
            } catch (e) {
                console.error('Failed to fetch filtered data', e)
            }
        },
        [
            currentPage,
            searchTerm,
            pendingFaculties,
            pendingDegrees,
            pendingCourses,
            isEvenSemester,
            showOnlyAvailable,
            archivedFilter,
            selectedSorting,
            eduDegrees,
        ]
    )

    useEffect(() => {
        fetchFilteredData(1)
    }, [selectedSorting])

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [facData, eduData] = await Promise.all([
                    apiService.get<any[]>('Faculty'),
                    apiService.get<any[]>('EducationalDegree')
                ])

                setFaculties(facData)
                setEduDegrees(eduData)
            } catch (error) {
                console.error('Error fetching initial data', error)
            }
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
        setActionError(null)
        setIsModalOpen(true)
    }
    const columns: Column[] = [
        { header: 'Факультет', accessor: 'facultyAbbreviation' },
        { header: 'Код дисципліни', accessor: 'codeSelectiveDisciplines' },
        { header: 'Назва дисципліни', accessor: 'nameSelectiveDisciplines' },
        { header: 'Кількість студентів', accessor: 'studentCount' },
        { header: 'Рівень освіти', accessor: 'degreeLevelName' },
    ]

    return (
        <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
            <aside className="sm:w-1/5 w-full">
                <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4">
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Стан каталогу</label>
                        <select
                            value={archivedFilter}
                            onChange={(e) => {
                                setArchivedFilter(e.target.value as 'all' | 'active' | 'archived')
                                setCurrentPage(1)
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Усі</option>
                            <option value="active">Активні</option>
                            <option value="archived">Архівні</option>
                        </select>
                    </div>
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
                    <div className='flex gap-4'>
                        <div className='flex gap-2'>
                            <button 
                                onClick={() => {
                                    setIsAddMainModalOpen(true)
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 h-fit"
                            >
                                Додати
                            </button>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 h-fit">
                                Експорт
                            </button>
                            <FileUploadModal/>
                        </div>
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
                </div>

                <div className="overflow-x-auto">
                    <DataTable
                        onClick={(el)=>{
                          console.log(el)
                          window.open("/discipline/"+el.idSelectiveDisciplines) // НЕ ЧІПАТИ

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
                            {(selectedDiscipline as any).nameSelectiveDisciplines || selectedDiscipline.nameAddDisciplines}" (код:{' '}
                            {(selectedDiscipline as any).codeSelectiveDisciplines || selectedDiscipline.codeAddDisciplines})?
                        </p>
                        {actionError && (
                            <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{actionError}</div>
                        )}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                disabled={deleting}
                            >
                                Скасувати
                            </button>
                            <button
                                onClick={async () => {
                                    const id = (selectedDiscipline as any).idSelectiveDisciplines
                                    if (!id) { setIsModalOpen(false); return }
                                    setDeleting(true)
                                    setActionError(null)
                                    try {
                                        await adminCatalogService.deleteDiscipline(id)
                                        setIsModalOpen(false)
                                        fetchFilteredData(currentPage)
                                    } catch (e: any) {
                                        setActionError(e?.response?.data?.error || 'Не вдалося видалити дисципліну')
                                    } finally {
                                        setDeleting(false)
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300"
                                disabled={deleting}
                            >
                                {deleting ? 'Видалення…' : 'Видалити'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>{' '}
            
            <Modal isOpen={isAddMainModalOpen} onClose={() => setIsAddMainModalOpen(false)} classSize="max-w-sm">
                <div className="p-4 flex flex-col gap-3 text-center">
                    <button 
                        onClick={() => {
                            setIsAddMainModalOpen(false)
                            router.push('/discipline/new')
                        }}
                        className="w-full py-3 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Створити нову
                    </button>
                    <button 
                        onClick={() => {
                            setIsAddMainModalOpen(false)
                            setIsCopyPastModalOpen(true)
                            fetchCatalogs()
                        }}
                        className="w-full py-3 bg-white border border-gray-300 text-gray-800 rounded-md text-base font-medium hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Копіювати минулу
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isCopyPastModalOpen} onClose={() => setIsCopyPastModalOpen(false)} classSize="max-w-xl">
                <div className="p-5">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-3">Копіювати з минулого каталогу</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Виберіть каталог
                            </label>
                            <select 
                                value={selectedCatalogId}
                                onChange={(e) => {
                                    setSelectedCatalogId(e.target.value)
                                    setSelectedPastDisciplineId('')
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 transition-all"
                            >
                                <option value="">Оберіть рік...</option>
                                {catalogYears.map(cat => (
                                    <option key={cat.idCatalogYear || cat.id} value={cat.idCatalogYear || cat.id}>
                                        {cat.nameCatalog || cat.name || cat.year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedCatalogId !== '' && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Пошук за назвою або кодом
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            placeholder="Введіть назву або код для пошуку..."
                                            value={pastSearchTerm}
                                            onChange={(e) => setPastSearchTerm(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none pl-9 transition-all"
                                        />
                                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-white">
                                    {pastDisciplines.length > 0 ? (
                                        <div className="divide-y divide-gray-100">
                                            {pastDisciplines.map(disc => (
                                                <div 
                                                    key={disc.id}
                                                    onClick={() => setSelectedPastDisciplineId(disc.id)}
                                                    className={clsx(
                                                        "p-3 cursor-pointer hover:bg-blue-50 transition-colors flex justify-between items-center group text-sm",
                                                        selectedPastDisciplineId === disc.id ? "bg-blue-50 border-l-4 border-blue-600" : "border-l-4 border-transparent"
                                                    )}
                                                >
                                                    <div>
                                                        <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{disc.name}</div>
                                                        <div className="text-xs font-medium text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">{disc.code}</div>
                                                    </div>
                                                    <div className={clsx(
                                                        "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                                        selectedPastDisciplineId === disc.id ? "bg-blue-600 border-blue-600" : "border-gray-300"
                                                    )}>
                                                        {selectedPastDisciplineId === disc.id && (
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                                            {pastSearchTerm ? "Нічого не знайдено" : "Введіть назву для пошуку"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                        <button 
                            onClick={() => {
                                setIsCopyPastModalOpen(false)
                                setIsAddMainModalOpen(true)
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                            Назад
                        </button>
                        <button 
                            disabled={!selectedPastDisciplineId}
                            onClick={() => {
                                setIsCopyPastModalOpen(false)
                                router.push(`/discipline/new?copyFrom=${selectedPastDisciplineId}`)
                            }}
                            className={clsx(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                selectedPastDisciplineId 
                                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            Копіювати
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
})

export default AdminDisciplinesCatalogue