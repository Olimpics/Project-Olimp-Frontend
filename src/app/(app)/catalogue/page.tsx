'use client'
import { useEffect, useState } from 'react'
import DataTable from '@/components/ui/DataTable'

const disciplines = [
    {
        faculty: 'zxczxc',
        code: 'Iy-01-01',
        name: 'Оzxczxczxc',
        students: '0/15',
    },
    { faculty: 'zxczx1', code: 'Iy-01-02', name: 'zxczxczx', students: '0/15' },
]

const faculties = [...new Set(disciplines.map((d) => d.faculty))]

const Page = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFaculties, setSelectedFaculties] = useState<string[]>([])
    useEffect(() => {
        const fatchData = async () => {
            const asdasd = await fetch(
                'http://185.237.207.78:5000/api/DisciplineTab/GetDisciplinesBySemester?studentId=20162&isEvenSemester=false',
                {
                    method: 'GET',

                }
            )
        }
        fatchData()

    }, [])
    const handleFacultyChange = (faculty: string) => {
        setSelectedFaculties((prev) =>
            prev.includes(faculty)
                ? prev.filter((f) => f !== faculty)
                : [...prev, faculty]
        )
    }

    const filteredDisciplines = disciplines.filter((discipline) => {
        const matchesSearch = discipline.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        const matchesFaculty =
            selectedFaculties.length === 0 ||
            selectedFaculties.includes(discipline.faculty)
        return matchesSearch && matchesFaculty
    })

    const readonlyColumns = [
        { header: 'Факультет', accessor: 'faculty' },
        { header: 'Код дисципліни', accessor: 'code' },
        { header: 'Назва дисципліни', accessor: 'name' },
        { header: 'Кількість студентів', accessor: 'students' },
    ] as const

    const columns = [...readonlyColumns]

    return (
        <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/4 w-full">
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
            </div>

            <div className="sm:w-3/4 w-full">
                <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
                    <input
                        type="text"
                        placeholder="Пошук..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-md sm:rounded-l-md sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="p-2 bg-blue-500 text-white rounded-md sm:rounded-l-none sm:rounded-r-md hover:bg-blue-600">
                        Пошук
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <DataTable columns={columns} data={filteredDisciplines} />
                </div>
            </div>
        </div>
    )
}

export default Page
