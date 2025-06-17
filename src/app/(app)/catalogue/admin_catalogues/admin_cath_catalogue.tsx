'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'
import DataTable from '@/components/ui/DataTable'
import { FilterBox } from '@/components/ui/FilterBox'
import { Modal } from '@/components/ui/Modal'

type Department = {
  idDepartment: number
  nameDepartment: string
  abbreviation: string
  facultyName: string
  facultyAbbreviation: string
  facultyId: number
}

type Faculty = {
  idFaculty: number
  nameFaculty: string
  abbreviation: string
}

interface Column {
  header: string
  accessor: keyof Department
}

const sortingOptions = [
  { label: 'Алфавіт (А-Я)', value: 0 },
  { label: 'Алфавіт (Я-А)', value: 1 },
  { label: 'Факультет (А-Я)', value: 2 },
  { label: 'Факультет (Я-А)', value: 3 },
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

export const AdminDepartmentCatalogue = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingFaculties, setPendingFaculties] = useState<string[]>([])
  const [selectedSorting, setSelectedSorting] = useState<number>(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [newDepartment, setNewDepartment] = useState<Omit<Department, 'idDepartment' | 'facultyName' | 'facultyAbbreviation'>>({
    nameDepartment: '',
    abbreviation: '',
    facultyId: 0
  })

  const fetchDepartments = useCallback(async (page: number = currentPage) => {
    setIsLoading(true)
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        pageSize: "17",
        search: searchTerm,
        sortOrder: selectedSorting.toString()
      })

      if (pendingFaculties.length > 0) {
        query.append("facultyIds", pendingFaculties.join(","))
      }

      const res = await fetch(`http://185.237.207.78:5000/api/Department?${query.toString()}`)

      console.log(res)

      if (!res.ok) {
        throw new Error('Failed to fetch departments')
      }

      const data = await res.json()

      // Проверяем формат ответа и адаптируем его при необходимости
      let departmentsData = Array.isArray(data) ? data : (data.items || data)

      setDepartments(departmentsData)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, selectedSorting, pendingFaculties])

  useEffect(() => {
    fetchDepartments(1)
  }, [selectedSorting])

  useEffect(() => {
    const fetchInitialData = async () => {
      const facData = await (await fetch('http://185.237.207.78:5000/api/Faculty')).json()
      setFaculties(facData)
      fetchDepartments(1)
    }

    fetchInitialData()
  }, [])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchDepartments(1)
  }

  const handleAdd = () => {
    setNewDepartment({
      nameDepartment: '',
      abbreviation: '',
      facultyId: faculties[0]?.idFaculty || 0
    })
    setModalType('add')
    setIsModalOpen(true)
  }

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department)
    setModalType('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (department: Department) => {
    setSelectedDepartment(department)
    setModalType('delete')
    setIsModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedDepartment) return

    try {
      const response = await fetch(`http://185.237.207.78:5000/api/Department/${selectedDepartment.idDepartment}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchDepartments(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Помилка при видаленні кафедри')
      }
    } catch (error) {
      console.error('Помилка при видаленні кафедри:', error)
    }
  }

  const saveChanges = async () => {
    if (!selectedDepartment) return

    try {
      const response = await fetch(`http://185.237.207.78:5000/api/Department/${selectedDepartment.idDepartment}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facultyId: selectedDepartment.facultyId,
          nameDepartment: selectedDepartment.nameDepartment,
          abbreviation: selectedDepartment.abbreviation,
          idDepartment: selectedDepartment.idDepartment
        })
      })

      if (response.ok) {
        fetchDepartments(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Помилка при оновленні даних кафедри')
      }
    } catch (error) {
      console.error('Помилка при оновленні даних кафедри:', error)
    }
  }

  const addDepartment = async () => {
    try {
      const response = await fetch('http://185.237.207.78:5000/api/Department', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facultyId: newDepartment.facultyId,
          nameDepartment: newDepartment.nameDepartment,
          abbreviation: newDepartment.abbreviation
        })
      })

      if (response.ok) {
        fetchDepartments(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Помилка при додаванні кафедри')
      }
    } catch (error) {
      console.error('Помилка при додаванні кафедри:', error)
    }
  }

  const columns: Column[] = [
    { header: 'Назва кафедри', accessor: 'nameDepartment' },
    { header: 'Абревіатура', accessor: 'abbreviation' },
    { header: 'Факультет', accessor: 'facultyName' },
  ]

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
      <aside className="sm:w-1/5 w-full">
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4">
          <FilterBox
            name="Факультет"
            options={faculties}
            accessor="idFaculty"
            valueName="abbreviation"
            selectedValues={pendingFaculties}
            onChange={setPendingFaculties}
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
              placeholder="Пошук кафедри..."
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
          <div className="flex gap-2">
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
            <button
              onClick={handleAdd}
              className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Додати кафедру
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : departments.length > 0 ? (
            <>
              <DataTable
                onEdit={handleEdit}
                onDelete={handleDelete}
                isActionEnabled={true}
                columns={columns}
                data={departments}
              />
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={(page) => {
                  setCurrentPage(page)
                  fetchDepartments(page)
                }}
              />
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Не знайдено жодної кафедри</p>
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalType === 'edit' && selectedDepartment && (
          <div>
            <h2 className="text-xl font-bold mb-4">Редагування кафедри</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Назва кафедри</label>
                <input
                  type="text"
                  value={selectedDepartment.nameDepartment}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, nameDepartment: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Абревіатура</label>
                <input
                  type="text"
                  value={selectedDepartment.abbreviation}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, abbreviation: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Факультет</label>
                <select
                  value={selectedDepartment.facultyId}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, facultyId: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {faculties.map(faculty => (
                    <option key={faculty.idFaculty} value={faculty.idFaculty}>
                      {faculty.nameFaculty} ({faculty.abbreviation})
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

        {modalType === 'delete' && selectedDepartment && (
          <div>
            <h2 className="text-xl font-bold mb-4">Видалення кафедри</h2>
            <p>Ви впевнені, що хочете видалити кафедру {selectedDepartment.nameDepartment}?</p>
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

        {modalType === 'add' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Додати нову кафедру</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Назва кафедри</label>
                <input
                  type="text"
                  value={newDepartment.nameDepartment}
                  onChange={(e) => setNewDepartment({ ...newDepartment, nameDepartment: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Абревіатура</label>
                <input
                  type="text"
                  value={newDepartment.abbreviation}
                  onChange={(e) => setNewDepartment({ ...newDepartment, abbreviation: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Факультет</label>
                <select
                  value={newDepartment.facultyId}
                  onChange={(e) => setNewDepartment({ ...newDepartment, facultyId: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {faculties.map(faculty => (
                    <option key={faculty.idFaculty} value={faculty.idFaculty}>
                      {faculty.nameFaculty} ({faculty.abbreviation})
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
                  onClick={addDepartment}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Додати
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}