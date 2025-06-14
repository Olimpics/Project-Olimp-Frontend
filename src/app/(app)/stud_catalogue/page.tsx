'use client'
import { useEffect, useState, useCallback } from 'react'
import React from 'react'
import DataTable from '@/components/ui/DataTable'
import { FilterBox } from '@/components/ui/FilterBox'

type Student = {
  idStudents: number
  nameStudent: string
  facultyAbbreviation: string
  speciality: string
  degreeName: string
  groupName: string
  course: number
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

type Specialities = {
    id: number
    name: string
}

type Groupes = {
    id: number
    code: string
}

interface Column {
  header: string
  accessor: keyof Student
}

const sortingOptions = [
  { label: 'Алфавіт (А-Я)', value: 0 },
  { label: 'Алфавіт (Я-А)', value: 1 },
  { label: 'Факультет (↑)', value: 2 },
  { label: 'Факультет (↓)', value: 3 },
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
  const [students, setStudents] = useState<Student[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [eduDegrees, setEduDegrees] = useState<EduDegree[]>([])
  const [specialities, setSpecialities] = useState<Specialities[]>([])
  const [pendingSpecialities, setPendingSpecialities] = useState<string[]>([])
  const [groupes, setGroupes] = useState<Groupes[]>([])
  const [pendingGroupes, setPendingGroupes] = useState<string[]>([])
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
  const [selectedSorting, setSelectedSorting] = useState<number>(0)

  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchFilteredData = useCallback(async (page: number = currentPage) => {
    const query = new URLSearchParams({
        page: page.toString(),
        pageSize: "17",
        search: searchTerm,
        sortOrder: selectedSorting.toString()
    })

    if (pendingFaculties.length > 0) {
      query.append("faculties", pendingFaculties.join(","))
    }

    const degreeIds = eduDegrees
      .filter((d) => pendingDegrees.includes(d.nameEducationalDegreec))
      .map((d) => d.idEducationalDegree)

    if (degreeIds.length > 0) {
      query.append("degreeLevelIds", degreeIds.join(","))
    }

    if (pendingCourses.length > 0) {
      query.append("courses", pendingCourses.join(","))
    }

    if (pendingSpecialities.length > 0) {
        query.append("speciality", pendingSpecialities.join(","))
    }

    if (pendingGroupes.length > 0) {
        const selectedGroupIds = groupes
            .filter((g) => pendingGroupes.includes(g.code))
            .map((g) => g.id)

        if (selectedGroupIds.length > 0) {
            query.append("group", selectedGroupIds.join(","))
        }
    }


    const res = await fetch(
      `http://185.237.207.78:5000/api/Student?${query.toString()}`
    )
    const data = await res.json()

    const formatted = (data.students || []).map((d: Student) => ({ ...d }))

    setStudents(formatted)
    setTotalPages(data.totalPages || 1)
  }, [
    currentPage,
    searchTerm,
    pendingFaculties,
    pendingDegrees,
    pendingCourses,
    pendingSpecialities,
    selectedSorting,
    eduDegrees,
    pendingGroupes
  ])

  useEffect(() => {
    fetchFilteredData(1)
  }, [selectedSorting])

  useEffect(() => {
    const fetchInitialData = async () => {
      const facData = await (await fetch('http://185.237.207.78:5000/api/Faculty')).json()
      const eduData = await (await fetch('http://185.237.207.78:5000/api/EducationalDegree')).json()
      const specData = await (await fetch('http://185.237.207.78:5000/api/Filter/specialities')).json()
      const groupData = await (await fetch('http://185.237.207.78:5000/api/Filter/groups')).json()

      setFaculties(facData)
      setEduDegrees(eduData)
      setSpecialities(specData)
      setGroupes(groupData)

      fetchFilteredData(1)
    }

    fetchInitialData()
  }, [])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchFilteredData(1)
  }

  const columns: Column[] = [
    { header: 'ПІБ студента', accessor: 'nameStudent' },
    { header: 'Факультет', accessor: 'facultyAbbreviation' },
    { header: 'Cпеціальність', accessor: 'speciality' },
    { header: 'Рівень освіти', accessor: 'degreeName' },
    { header: 'Курс', accessor: 'course' },
  ]

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
      <aside className="sm:w-1/6 w-full">
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4">
          <FilterBox
            name="Спеціальність"
            options={specialities}
            accessor="name"
            selectedValues={pendingSpecialities}
            onChange={setPendingSpecialities}
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
            name="Групи"
            options={groupes}
            accessor="code"
            selectedValues={pendingGroupes}
            onChange={setPendingGroupes}
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
          <div className="w-300 flex gap-2">
            <input
              type="text"
              placeholder="Пошук студента..."
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
          <DataTable columns={columns} data={students} />
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
    </div>
  )
}

export default Page