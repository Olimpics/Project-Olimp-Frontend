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

const sortingOptions = [
  { label: 'Алфавіт (А-Я)', value: 0 },
  { label: 'Алфавіт (Я-А)', value: 1 },
  { label: 'Учасники (↑)', value: 2 },
  { label: 'Учасники (↓)', value: 3 },
]

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

  return (
    <nav className="flex justify-center mt-4 space-x-2">
      {getPages().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(Number(page))}
            className={`px-4 py-2 rounded ${currentPage === page
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
  const [pendingFaculties, setPendingFaculties] = useState<string[]>([])
  const [pendingDegrees, setPendingDegrees] = useState<string[]>([])
  const [pendingCourses, setPendingCourses] = useState<string[]>([])
  const [isEvenSemester, setIsEvenSemester] = useState<boolean | null>(null)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<string[]>([])
  const [selectedSorting, setSelectedSorting] = useState<number>(0)

  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function fetchData() {
      const studentRaw = localStorage.getItem("studentProfile")
      if (!studentRaw) return
      const student = JSON.parse(studentRaw)

      const res = await fetch(
        `http://185.237.207.78:5000/api/DisciplineTab/GetAllDisciplinesWithAvailability?studentId=${student.idStudents}&page=${currentPage}&pageSize=17&onlyAvailable=false`
      )
      const data = await res.json()
      const formatted = (data.disciplines || []).map((d: Discipline) => ({
        ...d,
        studentCount: `${d.countOfPeople} / ${d.maxCountPeople}`
      }))
      setDisciplines(formatted)
      setTotalPages(data.totalPages || 1)

      const facData = await (await fetch('http://185.237.207.78:5000/api/Faculty')).json()
      const eduData = await (await fetch('http://185.237.207.78:5000/api/EducationalDegree')).json()

      setFaculties(facData)
      setEduDegrees(eduData)
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
        pageSize: "17",
        search: searchTerm || "",
        sorting: selectedSorting.toString()
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

      if (showOnlyAvailable.includes("Тільки доступні")) {
        query.append("onlyAvailable", "true")
      }

      if (isEvenSemester !== null) {
        query.append("isEvenSemester", isEvenSemester.toString())
      }

      const res = await fetch(
        `http://185.237.207.78:5000/api/DisciplineTab/GetAllDisciplinesWithAvailability?page=1&${query.toString()}`
      )
      const data = await res.json()

      const formatted = (data.disciplines || []).map((d: Discipline) => ({
        ...d,
        studentCount: `${d.countOfPeople} / ${d.maxCountPeople}`
      }))
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
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
      <aside className="sm:w-1/5 w-full">
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4">
          <FilterBox
            name="Тільки доступні дисципліни"
            options={[{ name: "Тільки доступні" }]}
            accessor="name"
            selectedValues={showOnlyAvailable}
            onChange={setShowOnlyAvailable}
          />
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
            name="Парний семестр"
            options={[
              { label: 'Так', value: true },
              { label: 'Ні', value: false }
            ]}
            accessor="label"
            selectedValues={isEvenSemester === null ? [] : [isEvenSemester ? 'Так' : 'Ні']}
            onChange={(selected) => {
              if (selected.includes('Так')) setIsEvenSemester(true)
              else if (selected.includes('Ні')) setIsEvenSemester(false)
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
          <div className="w-300">
            <input
            type="text"
            placeholder="Пошук дисципліни..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Пошук
          </button>
          </div>
          <select
            value={selectedSorting}
            onChange={(e) => setSelectedSorting(Number(e.target.value))}
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