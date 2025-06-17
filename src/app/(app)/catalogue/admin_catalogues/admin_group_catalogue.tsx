'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'
import DataTable from '@/components/ui/DataTable'
import { FilterBox } from '@/components/ui/FilterBox'
import { Modal } from '@/components/ui/Modal'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'

type EducationalProgram = {
  idEducationalProgram: number
  nameEducationalProgram: string
  degree: string
  speciality: string
  accreditation: number
  accreditationType: string
  studentsAmount: number
  countAddSemestr3: number
  countAddSemestr4: number
  countAddSemestr5: number
  countAddSemestr6: number
  countAddSemestr7: number
  countAddSemestr8: number
}

type EducationalDegree = {
  idEducationalDegree: number
  nameEducationalDegreec: string
}

interface Column {
  header: string
  accessor: keyof EducationalProgram
}

const sortingOptions = [
  { label: 'Алфавіт (А-Я)', value: 0 },
  { label: 'Алфавіт (Я-А)', value: 1 },
  { label: 'Кількість студентів (↑)', value: 2 },
  { label: 'Кількість студентів (↓)', value: 3 },
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

export const AdminEducationalProgramCatalogue = () => {
  const [programs, setPrograms] = useState<EducationalProgram[]>([])
  const [degrees, setDegrees] = useState<EducationalDegree[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingDegrees, setPendingDegrees] = useState<string[]>([])
  const [selectedSorting, setSelectedSorting] = useState<number>(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [token, setToken] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<EducationalProgram | null>(null)
  const [newProgram, setNewProgram] = useState<Omit<EducationalProgram, 'idEducationalProgram'>>({
    nameEducationalProgram: '',
    degree: '',
    speciality: '',
    accreditation: 0,
    accreditationType: '',
    studentsAmount: 0,
    countAddSemestr3: 0,
    countAddSemestr4: 0,
    countAddSemestr5: 0,
    countAddSemestr6: 0,
    countAddSemestr7: 0,
    countAddSemestr8: 0
  })

  useEffect(() => {
    const rawProfile = getCookie(USER_PROFLE)
    if (rawProfile) {
      const profile = JSON.parse(rawProfile)
      setToken(profile.token)
    }
    console.log(rawProfile)
  }, [])

  const fetchPrograms = useCallback(async (page: number = currentPage) => {
    if (!token) return

    setIsLoading(true)
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        pageSize: "17",
        search: searchTerm,
        sortOrder: selectedSorting.toString()
      })

      if (pendingDegrees.length > 0) {
        const degreeIds = degrees
          .filter(d => pendingDegrees.includes(d.nameEducationalDegreec))
          .map(d => d.idEducationalDegree)
        query.append("degreeLevelIds", degreeIds.join(","))
      }

      const res = await fetch(
        `http://185.237.207.78:5000/api/EducationalProgram?${query.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!res.ok) {
        throw new Error('Failed to fetch educational programs')
      }

      const data = await res.json()
      setPrograms(data.items || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching educational programs:', error)
      setPrograms([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, selectedSorting, pendingDegrees, token, degrees])

  useEffect(() => {
    fetchPrograms(1)
  }, [selectedSorting, token])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const degreesData = await (await fetch('http://185.237.207.78:5000/api/EducationalDegree')).json()
        setDegrees(degreesData)
        fetchPrograms(1)
      } catch (error) {
        console.error('Error initializing data:', error)
      }
    }

    fetchInitialData()
  }, [])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchPrograms(1)
  }

  const handleAdd = () => {
    setNewProgram({
      nameEducationalProgram: '',
      degree: degrees[0]?.nameEducationalDegreec || '',
      speciality: '',
      accreditation: 0,
      accreditationType: '',
      studentsAmount: 0,
      countAddSemestr3: 0,
      countAddSemestr4: 0,
      countAddSemestr5: 0,
      countAddSemestr6: 0,
      countAddSemestr7: 0,
      countAddSemestr8: 0
    })
    setModalType('add')
    setIsModalOpen(true)
  }

  const handleEdit = (program: EducationalProgram) => {
    setSelectedProgram(program)
    setModalType('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (program: EducationalProgram) => {
    setSelectedProgram(program)
    setModalType('delete')
    setIsModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProgram || !token) return

    try {
      const response = await fetch(
        `http://185.237.207.78:5000/api/EducationalProgram/${selectedProgram.idEducationalProgram}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        fetchPrograms(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Помилка при видаленні освітньої програми')
      }
    } catch (error) {
      console.error('Помилка при видаленні освітньої програми:', error)
    }
  }

  const saveChanges = async () => {
    if (!selectedProgram || !token) return

    try {
      const response = await fetch(
        `http://185.237.207.78:5000/api/EducationalProgram/${selectedProgram.idEducationalProgram}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(selectedProgram)
        }
      )

      if (response.ok) {
        fetchPrograms(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Помилка при оновленні освітньої програми')
      }
    } catch (error) {
      console.error('Помилка при оновленні освітньої програми:', error)
    }
  }

  const addProgram = async () => {
    if (!token) return

    try {
      const response = await fetch('http://185.237.207.78:5000/api/EducationalProgram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProgram)
      })

      if (response.ok) {
        fetchPrograms(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Помилка при додаванні освітньої програми')
      }
    } catch (error) {
      console.error('Помилка при додаванні освітньої програми:', error)
    }
  }

  const columns: Column[] = [
    { header: 'Назва програми', accessor: 'nameEducationalProgram' },
    { header: 'Рівень освіти', accessor: 'degree' },
    { header: 'Спеціальність', accessor: 'speciality' },
    { header: 'Кількість студентів', accessor: 'studentsAmount' },
  ]

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
      <aside className="sm:w-1/5 w-full">
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4">
          <FilterBox
            name="Рівень освіти"
            options={degrees}
            accessor="nameEducationalDegreec"
            selectedValues={pendingDegrees}
            onChange={setPendingDegrees}
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
              placeholder="Пошук освітньої програми..."
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
              Додати програму
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : programs.length > 0 ? (
            <>
              <DataTable
                onEdit={handleEdit}
                onDelete={handleDelete}
                isActionEnabled={true}
                columns={columns}
                data={programs}
              />
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={(page) => {
                  setCurrentPage(page)
                  fetchPrograms(page)
                }}
              />
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Не знайдено жодної освітньої програми</p>
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalType === 'edit' && selectedProgram && (
          <div className="p-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Редагування освітньої програми</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Назва програми</label>
                <input
                  type="text"
                  value={selectedProgram.nameEducationalProgram}
                  onChange={(e) => setSelectedProgram({ ...selectedProgram, nameEducationalProgram: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Рівень освіти</label>
                <select
                  value={selectedProgram.degree}
                  onChange={(e) => setSelectedProgram({ ...selectedProgram, degree: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {degrees.map(degree => (
                    <option key={degree.idEducationalDegree} value={degree.nameEducationalDegreec}>
                      {degree.nameEducationalDegreec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Спеціальність</label>
                <input
                  type="text"
                  value={selectedProgram.speciality}
                  onChange={(e) => setSelectedProgram({ ...selectedProgram, speciality: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Кількість студентів</label>
                <input
                  type="number"
                  value={selectedProgram.studentsAmount}
                  onChange={(e) => setSelectedProgram({ ...selectedProgram, studentsAmount: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Акредитація</label>
                <input
                  type="number"
                  value={selectedProgram.accreditation}
                  onChange={(e) => setSelectedProgram({ ...selectedProgram, accreditation: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Тип акредитації</label>
                <input
                  type="text"
                  value={selectedProgram.accreditationType}
                  onChange={(e) => setSelectedProgram({ ...selectedProgram, accreditationType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Семестр 3</label>
                  <input
                    type="number"
                    value={selectedProgram.countAddSemestr3}
                    onChange={(e) => setSelectedProgram({ ...selectedProgram, countAddSemestr3: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Семестр 4</label>
                  <input
                    type="number"
                    value={selectedProgram.countAddSemestr4}
                    onChange={(e) => setSelectedProgram({ ...selectedProgram, countAddSemestr4: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Семестр 5</label>
                  <input
                    type="number"
                    value={selectedProgram.countAddSemestr5}
                    onChange={(e) => setSelectedProgram({ ...selectedProgram, countAddSemestr5: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Семестр 6</label>
                  <input
                    type="number"
                    value={selectedProgram.countAddSemestr6}
                    onChange={(e) => setSelectedProgram({ ...selectedProgram, countAddSemestr6: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Семестр 7</label>
                  <input
                    type="number"
                    value={selectedProgram.countAddSemestr7}
                    onChange={(e) => setSelectedProgram({ ...selectedProgram, countAddSemestr7: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Семестр 8</label>
                  <input
                    type="number"
                    value={selectedProgram.countAddSemestr8}
                    onChange={(e) => setSelectedProgram({ ...selectedProgram, countAddSemestr8: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
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

        {modalType === 'delete' && selectedProgram && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Видалення освітньої програми</h2>
            <p className="mb-4">Ви впевнені, що хочете видалити програму "{selectedProgram.nameEducationalProgram}"?</p>
            <div className="flex justify-end space-x-2">
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
          <div className="p-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Додати нову освітню програму</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Назва програми</label>
                <input
                  type="text"
                  value={newProgram.nameEducationalProgram}
                  onChange={(e) => setNewProgram({ ...newProgram, nameEducationalProgram: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Рівень освіти</label>
                <select
                  value={newProgram.degree}
                  onChange={(e) => setNewProgram({ ...newProgram, degree: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {degrees.map(degree => (
                    <option key={degree.idEducationalDegree} value={degree.nameEducationalDegreec}>
                      {degree.nameEducationalDegreec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Спеціальність</label>
                <input
                  type="text"
                  value={newProgram.speciality}
                  onChange={(e) => setNewProgram({ ...newProgram, speciality: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Кількість студентів</label>
                <input
                  type="number"
                  value={newProgram.studentsAmount}
                  onChange={(e) => setNewProgram({ ...newProgram, studentsAmount: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Акредитація</label>
                <input
                  type="number"
                  value={newProgram.accreditation}
                  onChange={(e) => setNewProgram({ ...newProgram, accreditation: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Тип акредитації</label>
                <input
                  type="text"
                  value={newProgram.accreditationType}
                  onChange={(e) => setNewProgram({ ...newProgram, accreditationType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Семестр 3</label>
                  <input
                    type="number"
                    value={newProgram.countAddSemestr3}
                    onChange={(e) => setNewProgram({ ...newProgram, countAddSemestr3: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Семестр 4</label>
                  <input
                    type="number"
                    value={newProgram.countAddSemestr4}
                    onChange={(e) => setNewProgram({ ...newProgram, countAddSemestr4: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Семестр 5</label>
                  <input
                    type="number"
                    value={newProgram.countAddSemestr5}
                    onChange={(e) => setNewProgram({ ...newProgram, countAddSemestr5: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Семестр 6</label>
                  <input
                    type="number"
                    value={newProgram.countAddSemestr6}
                    onChange={(e) => setNewProgram({ ...newProgram, countAddSemestr6: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Семестр 7</label>
                  <input
                    type="number"
                    value={newProgram.countAddSemestr7}
                    onChange={(e) => setNewProgram({ ...newProgram, countAddSemestr7: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Семестр 8</label>
                  <input
                    type="number"
                    value={newProgram.countAddSemestr8}
                    onChange={(e) => setNewProgram({ ...newProgram, countAddSemestr8: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Скасувати
                </button>
                <button
                  onClick={addProgram}
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