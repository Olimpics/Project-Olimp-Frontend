'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'
import DataTable from '@/components/ui/DataTable'
import { FilterBox } from '@/components/ui/FilterBox'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { apiService } from '@/services/axiosService'

type Discipline = {
  idAddDisciplines: number
  nameAddDisciplines: string
  codeAddDisciplines: string
  facultyAbbreviation: string
  degreeLevelName: string
  countOfPeople: number
  maxCountPeople: number
  fullCount: string
  courseNumber: number
  addSemestr: any
  studentCount?: string
  isEvenSemesterParsed?: string
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
  accessor: keyof Discipline
  sortable?: boolean
}



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

const GoToPageButton = () => {
  const router = useRouter()

  const handleClick = () => {
    router.push('/disciplines')
  }

  return (
    <button
      onClick={handleClick}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Перейти до вибору дисциплін
    </button>
  )
}

export const StudentDisciplinesCatalogue = React.memo(() => {
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
  const [selectedSorting, setSelectedSorting] = useState<number>(1) // Default to 1 (Alphabet A-Z)

  const [catalogYears, setCatalogYears] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [sortField, setSortField] = useState<string | null>('nameAddDisciplines')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isInitialMount, setIsInitialMount] = useState(true)

  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchFilteredData = useCallback(
    async (page: number = currentPage) => {
      const studentRaw = getCookie(USER_PROFLE)
      if (!studentRaw) return

      try {
        const student = JSON.parse(studentRaw)

        const query = new URLSearchParams({
          studentId: student.id,
          pageSize: '17',
          page: page.toString(),
          search: searchTerm,
          sortOrder: selectedSorting.toString(),
        })

        if (selectedYear) {
          query.append('catalogYearId', selectedYear)
          query.append('CatalogYearId', selectedYear)
        }

        if (pendingFaculties.length > 0) {
          query.append('faculties', pendingFaculties.join(','))
        }

        const degreeIds = eduDegrees
          .filter((d) =>
            pendingDegrees.includes(d.nameEducationalDegreec)
          )
          .map((d) => d.idEducationalDegree)

        if (degreeIds.length > 0) {
          query.append("degreeLevelIds", degreeIds.join(","))
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

        const data = await apiService.get<any>(
          `DisciplineTabStudent/GetAllDisciplinesWithAvailability?${query.toString()}`
        )

        const formatted = (data.items || []).map((d: any) => ({
          ...d,
          studentCount: `${d.countOfPeople} / ${d.maxCountPeople}`,
          isEvenSemesterParsed: new Map<any, string>([
            [1, "Парний"],
            [0, "Непарний"],
            [null, "Для всіх"],
            [undefined, "Для всіх"]
          ]).get(d.isEven) ?? "Невідомо",
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
      selectedSorting,
      eduDegrees,
      selectedYear,
    ]
  )

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [facData, eduData, yearData] = await Promise.all([
          apiService.get<any[]>('Faculty'),
          apiService.get<any[]>('EducationalDegree'),
          apiService.get<any[]>('Parameters/CatalogYearsSelective').catch(() => [])
        ])

        setFaculties(facData)
        setEduDegrees(eduData)
        setCatalogYears(yearData)
        setIsInitialMount(false)
      } catch (error) {
        console.error('Error fetching initial data:', error)
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    if (!isInitialMount) {
      fetchFilteredData(1)
    }
  }, [selectedSorting, selectedYear, isInitialMount, fetchFilteredData])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchFilteredData(1)
  }

  const handleSort = (field: string) => {
    let nextDirection: 'asc' | 'desc' = 'asc'
    if (sortField === field) {
      nextDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    }
    setSortField(field)
    setSortDirection(nextDirection)

    if (field === 'nameAddDisciplines' || field === 'studentCount') {
      let apiSortOrder = 1
      if (field === 'nameAddDisciplines') {
        apiSortOrder = nextDirection === 'asc' ? 1 : 0
      } else if (field === 'studentCount') {
        apiSortOrder = nextDirection === 'asc' ? 3 : 2
      }
      setSelectedSorting(apiSortOrder)
      setCurrentPage(1)
    } else {
      setDisciplines((prev) => {
        const sorted = [...prev].sort((a, b) => {
          const aVal = a[field as keyof Discipline]
          const bVal = b[field as keyof Discipline]
          if (typeof aVal === 'string') {
            return nextDirection === 'asc'
              ? aVal.localeCompare(bVal as string)
              : (bVal as string).localeCompare(aVal)
          } else {
            return nextDirection === 'asc'
              ? Number(aVal) - Number(bVal)
              : Number(bVal) - Number(aVal)
          }
        })
        return sorted
      })
    }
  }

  const columns: Column[] = [
    { header: 'Факультет', accessor: 'facultyAbbreviation', sortable: true },
    { header: 'Код дисципліни', accessor: 'codeAddDisciplines', sortable: true },
    { header: 'Назва дисципліни', accessor: 'nameAddDisciplines', sortable: true },
    { header: 'Кількість студентів', accessor: 'studentCount', sortable: true },
    { header: 'Рівень освіти', accessor: 'degreeLevelName', sortable: true },
    { header: 'Cеместр', accessor: 'isEvenSemesterParsed', sortable: true }
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
            name="Семестр"
            options={[
              { label: 'Парний', value: false },   
              { label: 'Непарний', value: true }, 
              { label: 'Для всіх', value: null },
            ]}
            accessor="label"
            selectedValues={
              isEvenSemester === false ? ['Парний'] : 
              isEvenSemester === true ? ['Непарний'] : 
              ['Для всіх'] 
            }
            onChange={(selected) => {
              const lastSelected = selected[selected.length - 1];

              if (lastSelected === 'Для всіх') {
                setIsEvenSemester(null);
              } else if (lastSelected === 'Парний') {
                setIsEvenSemester(false);
              } else if (lastSelected === 'Непарний') {
                setIsEvenSemester(true);
              } else {
                setIsEvenSemester(null);
              }
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
          <GoToPageButton/>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value)
              setCurrentPage(1)
            }}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Усі навчальні роки</option>
            {catalogYears.map((year) => (
              <option key={year.idCatalogYear || year.id} value={year.idCatalogYear || year.id}>
                {year.nameCatalog || year.name || year.year}
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
              columns={columns}
              data={disciplines}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
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
    </div>
  )
})


