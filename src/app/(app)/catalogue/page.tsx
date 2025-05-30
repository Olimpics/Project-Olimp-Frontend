'use client'
import { useEffect, useState } from 'react'
import React from 'react'
import DataTable from '@/components/ui/DataTable'

type Discipline = {
    idAddDisciplines: number
    nameAddDisciplines: string
    codeAddDisciplines: string
    faculty: string
    teacher: string
    degreeLevel: string
    countOfPeople: number
    maxCountPeople: number
    fullCount: string
}

interface Column {
    header: string;
    accessor: keyof Discipline | 'studentCount';
}

const Pagination: React.FC<{
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}> = ({ totalPages, currentPage, onPageChange }) => {
    const getPages = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 16) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        pages.push(1);

        if (currentPage > 4) {
            pages.push('...');
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 3) {
            pages.push('...');
        }

        pages.push(totalPages);

        return pages;
    };

    const pages = getPages();

    return (
        <nav className="flex justify-center mt-4 space-x-2">
            {pages.map((page, idx) =>
                page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-2">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
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
    );
}

const Page = () => {
    const [disciplines, setDisciplines] = useState<Discipline[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFaculties, setSelectedFaculties] = useState<string[]>([])
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [showOnlyAvaliable, setShowOnlyAvaliable] = useState(true)
    const [isFacultyOpen, setIsFacultyOpen] = useState(true);
    const [isOtherFiltersOpen, setIsOtherFiltersOpen] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const student_storage_raw = localStorage.getItem("studentProfile")
            if (!student_storage_raw) {
                console.error("No student profile found in localStorage")
                return
            }

            const student_storage = JSON.parse(student_storage_raw)

            const res = await fetch(
                `http://185.237.207.78:5000/api/DisciplineTab/GetAllDisciplinesWithAvailability?studentId=${student_storage.idStudents}&page=${currentPage}&pageSize=12&onlyAvailable=${showOnlyAvaliable}`
            )

            const data = await res.json()
            setDisciplines(data.disciplines || []) 
            setTotalPages(data.totalPages || 1)

            const fullDisciplinesNotAv = await fetch(
                `http://185.237.207.78:5000/api/DisciplineTab/GetAllDisciplinesWithAvailability?studentId=${student_storage.idStudents}&onlyAvailable=false`
            )
            const fullDisciplinesJson = (await fullDisciplinesNotAv.json()) as Discipline[]
            localStorage.setItem("allDisciplines", JSON.stringify(fullDisciplinesJson))
        }

        fetchData()
    }, [currentPage, showOnlyAvaliable]) 

    const handleSearch = async () => {
        const student_storage_raw = localStorage.getItem("studentProfile")
        if (!student_storage_raw) {
            console.error("No student profile found in localStorage")
            return
        }

        const student_storage = JSON.parse(student_storage_raw)

        try {
            setCurrentPage(1) 
            const res = await fetch(
                `http://185.237.207.78:5000/api/DisciplineTab/GetAllDisciplinesWithAvailability?studentId=${student_storage.idStudents}&pageSize=12&onlyAvailable=false&search=${encodeURIComponent(searchTerm)}`
            )

            const data = await res.json()
            setDisciplines(data.disciplines || [])
            setTotalPages(data.totalPages || 1)
        } catch (error) {
            console.error("Error fetching filtered disciplines:", error)
        }
    }

    const faculties = Array.from(new Set(disciplines?.map((d) => d.faculty))).filter(f => f)

    const handleFacultyChange = (faculty: string) => {
        setSelectedFaculties((prev) =>
            prev.includes(faculty)
                ? prev.filter((f) => f !== faculty)
                : [...prev, faculty]
        )
    }

    const filteredDisciplines = disciplines
        .filter((d) => {
            const matchesFaculty =
                selectedFaculties.length === 0 || selectedFaculties.includes(d.faculty);
            return matchesFaculty;
        })
        .map((d) => ({
            ...d,
            studentCount: `${d.countOfPeople} / ${d.maxCountPeople}` 
        }));

    const columns: Column[] = [
        { header: 'Факультет', accessor: 'faculty' },
        { header: 'Код дисципліни', accessor: 'codeAddDisciplines' },
        { header: 'Назва дисципліни', accessor: 'nameAddDisciplines' },
        { header: 'Кількість студентів', accessor: 'studentCount' }, 
        { header: 'Викладач', accessor: 'teacher' },
        { header: 'Рівень освіти', accessor: 'degreeLevel' },
    ];

    if (disciplines.length === 0) {
        return <h1 className="text-center mt-10 text-lg">Завантажується...</h1>
    }

    const handleAvailabilityToggle = () => {
        setShowOnlyAvaliable(prev => !prev);
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row justify-between gap-4">
            <aside className="sm:w-1/8 w-full">
                <div className="bg-white p-4 rounded-md shadow-md border border-gray-300">
                    <h2
                        className="text-lg font-semibold mb-2 cursor-pointer flex justify-between items-center"
                        onClick={() => setIsFacultyOpen(!isFacultyOpen)}
                    >
                        Факультет
                        <span>{isFacultyOpen ? '▲' : '▼'}</span>
                    </h2>
                    {isFacultyOpen && (
                        <div className="mb-4">
                            {faculties.map((faculty) => (
                                <div key={faculty} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        id={faculty}
                                        checked={selectedFaculties.includes(faculty)}
                                        onChange={() => handleFacultyChange(faculty)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={faculty} className="text-gray-700">
                                        {faculty}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}

                    <h2
                        className="text-lg font-semibold mb-2 cursor-pointer flex justify-between items-center"
                        onClick={() => setIsOtherFiltersOpen(!isOtherFiltersOpen)}
                    >
                        Інші фільтри
                        <span>{isOtherFiltersOpen ? '▲' : '▼'}</span>
                    </h2>
                    {isOtherFiltersOpen && (
                        <div className="mb-2">
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="available"
                                    checked={showOnlyAvaliable}
                                    onChange={handleAvailabilityToggle}
                                    className="mr-2"
                                />
                                <label htmlFor="available" className="text-gray-700">
                                    Показати лише доступні
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            <main className="sm:w-full">
                <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
                    <input
                        type="text"
                        placeholder="Пошук дисципліни..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-md sm:rounded-l-md sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="p-2 bg-blue-500 text-white rounded-md sm:rounded-l-none sm:rounded-r-md hover:bg-blue-600"
                    >
                        Пошук
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <DataTable columns={columns} data={filteredDisciplines} />
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </main>
        </div>
    )
}

export default Page