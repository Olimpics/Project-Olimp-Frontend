'use client'
import { useEffect, useState } from 'react'
import DataTable from '@/components/ui/DataTable'

type Discipline = {
    idAddDisciplines: number
    nameAddDisciplines: string
    codeAddDisciplines: string
    faculty: string
    teacher: string
    degreeLevel: string
    countOfPeople: number
}

const Pagination: React.FC<{
    totalPages: number
    currentPage: number
    onPageChange: (page: number) => void
}> = ({ totalPages, currentPage, onPageChange }) => {
    return (
        <nav className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i + 1}
                    onClick={() => onPageChange(i + 1)}
                    className={`px-4 py-2 rounded ${
                        currentPage === i + 1
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-white text-blue-600 border border-gray-300 hover:bg-blue-100'
                    }`}
                >
                    {i + 1}
                </button>
            ))}
        </nav>
    )
}

const Page = () => {
    const [disciplines, setDisciplines] = useState<Discipline[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFaculties, setSelectedFaculties] = useState<string[]>([])
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        async function fetchData() {
            const student_storage_raw = localStorage.getItem("studentProfile")
            if (!student_storage_raw) {
                console.error("No student profile found in localStorage")
                return
            }

            const student_storage = JSON.parse(student_storage_raw)

            const res = await fetch(
                `http://185.237.207.78:5000/api/DisciplineTab/GetAllDisciplinesWithAvailability?studentId=${student_storage.idStudents}&page=${currentPage}&pageSize=12&onlyAvailable=true`
            )

            const data = await res.json()
            setDisciplines(data.disciplines || []) 
            setTotalPages(data.totalPages || 1)
        }

        fetchData()
    }, [currentPage])

    const faculties = Array.from(new Set(disciplines?.map((d) => d.faculty))).filter(f => f)

    const handleFacultyChange = (faculty: string) => {
        setSelectedFaculties((prev) =>
            prev.includes(faculty)
                ? prev.filter((f) => f !== faculty)
                : [...prev, faculty]
        )
    }

    const filteredDisciplines = disciplines.filter((d) => {
        const matchesFaculty =
            selectedFaculties.length === 0 || selectedFaculties.includes(d.faculty)
        const matchesSearch = d.nameAddDisciplines
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        return matchesFaculty && matchesSearch
    })

    const columns = [
        { header: 'Факультет', accessor: 'faculty' },
        { header: 'Код дисципліни', accessor: 'codeAddDisciplines' },
        { header: 'Назва дисципліни', accessor: 'nameAddDisciplines' },
        { header: 'Кількість студентів', accessor: 'countOfPeople' },
        { header: 'Викладач', accessor: 'teacher' },
        { header: 'Рівень освіти', accessor: 'degreeLevel' },
    ] as const

    if (disciplines.length === 0) {
        return <h1 className="text-center mt-10 text-lg">Завантажується...</h1>
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row justify-between max-w-5/6 gap-4">
            <aside className="sm:w-1/8 w-full">
                <div className="bg-white p-4 rounded-md shadow-md border border-gray-300">
                    <h2 className="text-lg font-semibold mb-2">Факультет</h2>
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
            </aside>

            <main className="sm:w-3/4 w-full">
                <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
                    <input
                        type="text"
                        placeholder="Пошук дисципліни..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-md sm:rounded-l-md sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => {}}
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
