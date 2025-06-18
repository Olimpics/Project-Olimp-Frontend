'use client'
import { useEffect, useState, useCallback } from 'react'
import React from 'react'
import DataTable from '@/components/ui/DataTable'
import { FilterBox } from '@/components/ui/FilterBox'
import { Modal } from '@/components/ui/Modal'

type Group = {
  id: number
  code: string
  facultyName: string
  departmentName: string
  specialityName: string
  educationalDegree: string
  course: number
  studentsCount: number
}

type Faculty = {
  idFaculty: number
  nameFaculty: string
  abbreviation: string
}

type Department = {
  idDepartment: number
  nameDepartment: string
  abbreviation: string
  facultyName: string
}

type EduDegree = {
  idEducationalDegree: number
  nameEducationalDegreec: string
}

type Speciality = {
  id: number
  name: string
}

interface Column {
  header: string
  accessor: keyof Group
}

const sortingOptions = [
  { label: 'Код групи (А-Я)', value: 0 },
  { label: 'Код групи (Я-А)', value: 1 },
  { label: 'Факультет (А-Я)', value: 2 },
  { label: 'Факультет (Я-А)', value: 3 },
  { label: 'Курс (↑)', value: 4 },
  { label: 'Курс (↓)', value: 5 },
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

export const AdminGroupsCatalogue = () => {
  const [groups, setGroups] = useState<Group[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [eduDegrees, setEduDegrees] = useState<EduDegree[]>([])
  const [courses] = useState<number[]>([1, 2, 3, 4])

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFaculties, setSelectedFaculties] = useState<number[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([])
  const [selectedDegrees, setSelectedDegrees] = useState<number[]>([])
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [selectedSorting, setSelectedSorting] = useState<number>(0)

  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  const fetchFilteredData = useCallback(async (page: number = currentPage) => {
    const query = new URLSearchParams({
      page: page.toString(),
      pageSize: "17",
      search: searchTerm,
      sortOrder: selectedSorting.toString()
    })

    if (selectedFaculties.length > 0) {
      query.append("facultyIds", selectedFaculties.join(","))
    }

    if (selectedDepartments.length > 0) {
      query.append("departmentIds", selectedDepartments.join(","))
    }

    if (selectedDegrees.length > 0) {
      query.append("degreeLevelIds", selectedDegrees.join(","))
    }

    if (selectedCourses.length > 0) {
      query.append("courses", selectedCourses.join(","))
    }

    const res = await fetch(
      `http://185.237.207.78:5000/api/Group?${query.toString()}`
    )
    const data = await res.json()

    setGroups(data || []) // Изменено, так как API возвращает массив групп напрямую
    setTotalPages(Math.ceil(data.length / 17) || 1) // Простая пагинация
  }, [
    currentPage,
    searchTerm,
    selectedFaculties,
    selectedDepartments,
    selectedDegrees,
    selectedCourses,
    selectedSorting
  ])

  useEffect(() => {
    fetchFilteredData(1)
  }, [selectedSorting])

  useEffect(() => {
    const fetchInitialData = async () => {
      const facData = await (await fetch('http://185.237.207.78:5000/api/Faculty')).json()
      const deptData = await (await fetch('http://185.237.207.78:5000/api/Department?page=1&pageSize=50')).json()
      const eduData = await (await fetch('http://185.237.207.78:5000/api/EducationalDegree')).json()

      setFaculties(facData)
      setDepartments(deptData.items || [])
      setEduDegrees(eduData)

      fetchFilteredData(1)
    }

    fetchInitialData()
  }, [])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchFilteredData(1)
  }

  const handleEdit = (group: Group) => {
    setSelectedGroup(group)
    setModalType('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (group: Group) => {
    setSelectedGroup(group)
    setModalType('delete')
    setIsModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedGroup) return

    try {
      const response = await fetch(`http://185.237.207.78:5000/api/Group/${selectedGroup.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchFilteredData(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Помилка при видаленні групи')
      }
    } catch (error) {
      console.error('Помилка при видаленні групи:', error)
    }
  }

  const saveChanges = async () => {
    if (!selectedGroup) return

    try {
      const response = await fetch(`http://185.237.207.78:5000/api/Group/${selectedGroup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedGroup)
      })

      if (response.ok) {
        fetchFilteredData(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Помилка при оновленні даних групи')
      }
    } catch (error) {
      console.error('Помилка при оновленні даних групи:', error)
    }
  }

  const columns: Column[] = [
    { header: 'Код групи', accessor: 'code' },
    { header: 'Факультет', accessor: 'facultyName' },
    { header: 'Кафедра', accessor: 'departmentName' },
    { header: 'Рівень освіти', accessor: 'degreeName' },
    { header: 'Курс', accessor: 'course' },
    { header: 'Кількість студентів', accessor: 'studentsCount' },
  ]

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
      <aside className="sm:w-1/5 w-full">
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4">
          <FilterBox
            name="Факультет"
            options={faculties}
            accessor="idFaculty"
            valueName="nameFaculty"
            searchName="nameFaculty"
            selectedValues={selectedFaculties}
            onChange={setSelectedFaculties}
          />
          <FilterBox
            name="Кафедра"
            options={departments}
            accessor="idDepartment"
            valueName="nameDepartment"
            selectedValues={selectedDepartments}
            onChange={setSelectedDepartments}
          />
          <FilterBox
            name="Рівень освіти"
            options={eduDegrees}
            accessor="idEducationalDegree"
            valueName="nameEducationalDegreec"
            selectedValues={selectedDegrees}
            onChange={setSelectedDegrees}
          />
          <FilterBox
            name="Курс"
            options={courses.map(c => ({ id: c, name: c.toString() }))}
            accessor="id"
            valueName="name"
            selectedValues={selectedCourses}
            onChange={setSelectedCourses}
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
              placeholder="Пошук групи..."
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
          <DataTable
            onEdit={handleEdit}
            onDelete={handleDelete}
            isActionEnabled={true}
            columns={columns}
            data={groups}
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
        {modalType === 'edit' && selectedGroup && (
          <div>
            <h2 className="text-xl font-bold mb-4">Редагування групи</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Код групи</label>
                <input
                  type="text"
                  value={selectedGroup.code}
                  onChange={(e) => setSelectedGroup({...selectedGroup, code: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Факультет</label>
                <select
                  value={selectedGroup.facultyId}
                  onChange={(e) => setSelectedGroup({...selectedGroup, facultyId: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {faculties.map(faculty => (
                    <option key={faculty.idFaculty} value={faculty.idFaculty}>
                      {faculty.nameFaculty}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Скасувати
                </button>
                <button
                  onClick={saveChanges}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Зберегти
                </button>
              </div>
            </div>
          </div>
        )}

        {modalType === 'delete' && selectedGroup && (
          <div>
            <h2 className="text-xl font-bold mb-4">Видалення групи</h2>
            <p>Ви впевнені, що хочете видалити групу {selectedGroup.code}?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Скасувати
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Видалити
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}