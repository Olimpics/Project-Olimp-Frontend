'use client'
import { useEffect, useState } from 'react'
import React from 'react'
import DataTable from '@/components/ui/DataTable'
import { FilterBox } from '@/components/ui/FilterBox'

type Discipline = {
  idAddDisciplines: number
  nameAddDisciplines: string
  codeAddDisciplines: string
  faculty: string
  teacher: string
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

const Pagination: React.FC<{
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}> = ({ totalPages, currentPage, onPageChange }) => {
  const getPages = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 16) return Array.from({ length: totalPages }, (_, i) => i + 1)

    pages.push(1)
    if (currentPage > 4) pages.push('...')

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)

    if (currentPage < totalPages - 3) pages.push('...')
    pages.push(totalPages)

    return pages
  }

  const pages = getPages()

  return (
    <nav className="flex justify-center mt-4 space-x-2">
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2">...</span>
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
  )
}

const Page = () => {
<<<<<<< Updated upstream
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [eduDegrees, setEduDegrees] = useState<EduDegree[]>([])
  const [courses] = useState<Courses[]>([
    { courseNumber: 1 },
    { courseNumber: 2 },
    { courseNumber: 3 },
    { courseNumber: 4 }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingFaculties, setPendingFaculties] = useState<string[]>([])
  const [pendingDegrees, setPendingDegrees] = useState<string[]>([])
  const [pendingCourses, setPendingCourses] = useState<string[]>([])
  const [isEvenSemester, setIsEvenSemester] = useState<boolean | null>(null)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<string[]>([])

  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function fetchData() {
      const studentRaw = localStorage.getItem("studentProfile")
      if (!studentRaw) return
      const student = JSON.parse(studentRaw)

      const res = await fetch(
        `http://185.237.207.78:5000/api/DisciplineTab/GetAllDisciplinesWithAvailability?studentId=${student.idStudents}&page=${currentPage}&pageSize=12&onlyAvailable=false`
      )
      const data = await res.json()
      const formatted = (data.disciplines || []).map((d: Discipline) => ({
        ...d,
        studentCount: `${d.countOfPeople} / ${d.maxCountPeople}`
      }))
      setDisciplines(formatted)
      setTotalPages(data.totalPages || 1)

      const facRes = await fetch('http://185.237.207.78:5000/api/Faculty')
      const facData = await facRes.json()

      const eduRes = await fetch('http://185.237.207.78:5000/api/EducationalDegree')
      const eduData = await eduRes.json()

      setFaculties(facData)
      setEduDegrees(eduData)
=======
    const [disciplines, setDisciplines] = useState<Discipline[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFaculties, setSelectedFaculties] = useState<string[]>([])
    const [faculties, setFaculties] = useState([])

    useEffect(() => {
        async function fetchData() {
                const res = await fetch(
                  'http://185.237.207.78:5000/api/DisciplineTab/GetAllDisciplinesWithAvailability?studentId=20162'
                )
                const data = await res.json()
                setDisciplines(data)

                const fac_res = await fetch(
                    'http://185.237.207.78:5000/api/Faculty'
                )

                const fac_data = await fac_res.json()
                setFaculties(fac_data)
        }
        fetchData()
    }, [])

    const handleFacultyChange = (faculty: string) => {
        setSelectedFaculties((prev) =>
          prev.includes(faculty)
            ? prev.filter((f) => f !== faculty)
            : [...prev, faculty]
        )
>>>>>>> Stashed changes
    }

    fetchData()
  }, [currentPage])

  const handleSearch = async () => {
    const studentRaw = localStorage.getItem("studentProfile")
    if (!studentRaw) return
    const student = JSON.parse(studentRaw)

    try {
      setCurrentPage(1)

      const query = new URLSearchParams({
        studentId: student.idStudents,
        pageSize: "12",
        search: searchTerm || ""
      })

      if (pendingFaculties.length > 0) {
        query.append("faculties", pendingFaculties.join(","))
      }

      const degreeIds = eduDegrees
        .filter((d) => pendingDegrees.includes(d.nameEducationalDegreec))
        .map((d) => d.idEducationalDegree)

      if (degreeIds.length > 0) {
        query.append("degrees", degreeIds.join(","))
      }

      if (pendingCourses.length > 0) {
        query.append("courses", pendingCourses.join(","))
      }

      if (showOnlyAvailable.length > 0) {
        query.append("onlyAvailable", showOnlyAvailable.includes("Тільки доступні") ? "true" : "false")
      }

      if (isEvenSemester !== null) {
        query.append("isEvenSemester", isEvenSemester.toString())
      }


      const res = await fetch(
        `http://185.237.207.78:5000/api/DisciplineTab/GetAllDisciplinesWithAvailability?${query.toString()}`
      )
      const data = await res.json()

      const formatted = data.disciplines?.map((d: Discipline) => ({
        ...d,
        studentCount: `${d.countOfPeople} / ${d.maxCountPeople}`,
      })) || []

      setDisciplines(formatted)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  const columns: Column[] = [
    { header: 'Факультет', accessor: 'faculty' },
    { header: 'Код дисципліни', accessor: 'codeAddDisciplines' },
    { header: 'Назва дисципліни', accessor: 'nameAddDisciplines' },
    { header: 'Кількість студентів', accessor: 'studentCount' },
    { header: 'Викладач', accessor: 'teacher' },
    { header: 'Рівень освіти', accessor: 'degreeLevelName' },
  ]

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row justify-between gap-4">
      <aside className="sm:w-1/8 w-full flex flex-col gap-2">
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4">
          <FilterBox
            name="Факультет"
            options={faculties}
            accessor="abbreviation"
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
            name="Тільки доступні дисципліни"
            options={[{ name: "Тільки доступні" }]}
            accessor="name"
            selectedValues={showOnlyAvailable}
            onChange={setShowOnlyAvailable}
          />
          <FilterBox
            name="Парний семестр"
            options={[
                { label: 'Так', value: true },
                { label: 'Ні', value: false }
            ]}
            accessor="label"
            selectedValues={
                isEvenSemester === null ? [] : [isEvenSemester ? 'Так' : 'Ні']
            }
            onChange={(selected) => {
                if (selected.includes('Так')) setIsEvenSemester(true)
                else if (selected.includes('Ні')) setIsEvenSemester(false)
                else setIsEvenSemester(null)
            }}
           />

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
          <DataTable columns={columns} data={disciplines} />
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