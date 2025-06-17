'use client'
import { useEffect, useState, useCallback } from 'react'
import React from 'react'
import DataTable from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'

type Faculty = {
  idFaculty: number
  nameFaculty: string
  abbreviation: string
}

interface Column {
  header: string
  accessor: keyof Faculty
}

const sortingOptions = [
  { label: 'Алфавіт (А-Я)', value: 0 },
  { label: 'Алфавіт (Я-А)', value: 1 },
  { label: 'Абревіатура (А-Я)', value: 2 },
  { label: 'Абревіатура (Я-А)', value: 3 },
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

export const AdminFacultyCatalogue = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSorting, setSelectedSorting] = useState<number>(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [newFaculty, setNewFaculty] = useState<Omit<Faculty, 'idFaculty'>>({
    nameFaculty: '',
    abbreviation: ''
  })

  const fetchFaculties = useCallback(async (page: number = currentPage) => {
    setIsLoading(true)
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        pageSize: "17",
        search: searchTerm,
        sortOrder: selectedSorting.toString()
      })

      const res = await fetch(`http://185.237.207.78:5000/api/Faculty?${query.toString()}`)

      if (!res.ok) {
        throw new Error('Failed to fetch faculties')
      }

      const data = await res.json()

      // Проверяем формат ответа и адаптируем его при необходимости
      let facultiesData = Array.isArray(data) ? data : (data.faculties || data)

      setFaculties(facultiesData)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching faculties:', error)
      setFaculties([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, selectedSorting])

  useEffect(() => {
    fetchFaculties(1)
  }, [selectedSorting])

  useEffect(() => {
    fetchFaculties(1)
  }, [])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchFaculties(1)
  }

  const handleAdd = () => {
    setNewFaculty({
      nameFaculty: '',
      abbreviation: ''
    })
    setModalType('add')
    setIsModalOpen(true)
  }

  const handleEdit = (faculty: Faculty) => {
    setSelectedFaculty(faculty)
    setModalType('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (faculty: Faculty) => {
    setSelectedFaculty(faculty)
    setModalType('delete')
    setIsModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedFaculty) return

    try {
      const response = await fetch(`http://185.237.207.78:5000/api/Faculty/${selectedFaculty.idFaculty}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchFaculties(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Помилка при видаленні факультету')
      }
    } catch (error) {
      console.error('Помилка при видаленні факультету:', error)
    }
  }

  const saveChanges = async () => {
    if (!selectedFaculty) return

    try {
      const response = await fetch(`http://185.237.207.78:5000/api/Faculty/${selectedFaculty.idFaculty}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedFaculty)
      })

      if (response.ok) {
        fetchFaculties(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Помилка при оновленні даних факультету')
      }
    } catch (error) {
      console.error('Помилка при оновленні даних факультету:', error)
    }
  }

  const addFaculty = async () => {
    try {
      const response = await fetch('http://185.237.207.78:5000/api/Faculty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idFaculty: 0,
          nameFaculty: newFaculty.nameFaculty,
          abbreviation: newFaculty.abbreviation
        })
      })

      if (response.ok) {
        fetchFaculties(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Помилка при додаванні факультету')
      }
    } catch (error) {
      console.error('Помилка при додаванні факультету:', error)
    }
  }

  const columns: Column[] = [
    { header: 'Назва факультету', accessor: 'nameFaculty' },
    { header: 'Абревіатура', accessor: 'abbreviation' },
  ]

  return (
    <div className="p-4 w-full bg-black sm:p-6 bg-gray-100 min-h-screen">
      <button
        onClick={handleAdd}
        className="mb-3 p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Додати факультет
      </button>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : faculties.length > 0 ? (
          <>
            <DataTable
              onEdit={handleEdit}
              onDelete={handleDelete}
              isActionEnabled={true}
              columns={columns}
              data={faculties}
            />
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={(page) => {
                setCurrentPage(page)
                fetchFaculties(page)
              }}
            />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Не знайдено жодного факультету</p>
          </div>
        )}
      </div>

      {/* Модальные окна остаются без изменений */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalType === 'edit' && selectedFaculty && (
          <div>
            <h2 className="text-xl font-bold mb-4">Редагування факультету</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Назва факультету</label>
                <input
                  type="text"
                  value={selectedFaculty.nameFaculty}
                  onChange={(e) => setSelectedFaculty({ ...selectedFaculty, nameFaculty: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Абревіатура</label>
                <input
                  type="text"
                  value={selectedFaculty.abbreviation}
                  onChange={(e) => setSelectedFaculty({ ...selectedFaculty, abbreviation: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
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

        {modalType === 'delete' && selectedFaculty && (
          <div>
            <h2 className="text-xl font-bold mb-4">Видалення факультету</h2>
            <p>Ви впевнені, що хочете видалити факультет {selectedFaculty.nameFaculty}?</p>
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
            <h2 className="text-xl font-bold mb-4">Додати новий факультет</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Назва факультету</label>
                <input
                  type="text"
                  value={newFaculty.nameFaculty}
                  onChange={(e) => setNewFaculty({ ...newFaculty, nameFaculty: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Абревіатура</label>
                <input
                  type="text"
                  value={newFaculty.abbreviation}
                  onChange={(e) => setNewFaculty({ ...newFaculty, abbreviation: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Скасувати
                </button>
                <button
                  onClick={addFaculty}
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