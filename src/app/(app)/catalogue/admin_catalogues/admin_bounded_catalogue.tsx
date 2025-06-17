'use client'
import { useEffect, useState, useCallback } from 'react'
import React from 'react'
import DataTable from '@/components/ui/DataTable'
import { FilterBox } from '@/components/ui/FilterBox'
import { Modal } from '@/components/ui/Modal'
import { getCookie } from '@/services/cookie-servies';

const USER_PROFILE = 'userProfile'

type BindLoan = {
  idBindLoan: number
  addDisciplinesId: number
  addDisciplinesName: string
  educationalProgramId: number
  educationalProgramName: string
}

type AddDiscipline = {
  id: number
  name: string
}

type Speciality = {
  id: number
  name: string
}

interface Column {
  header: string
  accessor: keyof BindLoan
}

const sortingOptions = [
  { label: 'Дисципліна (А-Я)', value: 0 },
  { label: 'Дисципліна (Я-А)', value: 1 },
  { label: 'Освітня програма (А-Я)', value: 2 },
  { label: 'Освітня програма (Я-А)', value: 3 },
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

export const AdminBindLoansPage = () => {
  const [bindLoans, setBindLoans] = useState<BindLoan[]>([])
  const [addDisciplines, setAddDisciplines] = useState<AddDiscipline[]>([])
  const [specialities, setSpecialities] = useState<Speciality[]>([])
  const [token, setToken] = useState<string>('')

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDisciplines, setSelectedDisciplines] = useState<number[]>([])
  const [selectedSpecialities, setSelectedSpecialities] = useState<number[]>([])
  const [selectedSorting, setSelectedSorting] = useState<number>(0)

  // Pagination
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selectedBindLoan, setSelectedBindLoan] = useState<Partial<BindLoan> | null>(null)

  useEffect(() => {
    const rawProfile = getCookie(USER_PROFILE)
    if (rawProfile) {
      const profile = JSON.parse(rawProfile)
      setToken(profile.token)
    }
  }, [])

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'accept': 'text/plain',
    }
    return fetch(url, { ...options, headers })
  }

  const fetchFilteredData = useCallback(async (page: number = currentPage) => {
    if (!token) return

    const query = new URLSearchParams({
      Page: page.toString(),
      PageSize: "50",
      Search: searchTerm,
      SortOrder: selectedSorting.toString()
    })

    if (selectedDisciplines.length > 0) {
      query.append("AddDisciplines", selectedDisciplines.join(","))
    }

    if (selectedSpecialities.length > 0) {
      query.append("Specialities", selectedSpecialities.join(","))
    }

    try {
      const res = await fetchWithAuth(
        `http://185.237.207.78:5000/api/BindLoansMain?${query.toString()}`
      )
      const data = await res.json()
      setBindLoans(data.items || [])
      setTotalPages(Math.ceil(data.totalCount / 50) || 1)
    } catch (error) {
      console.error('Error fetching bind loans:', error)
    }
  }, [token, currentPage, searchTerm, selectedDisciplines, selectedSpecialities, selectedSorting])

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return

      try {
        const [disciplinesRes, specialitiesRes] = await Promise.all([
          fetchWithAuth('http://185.237.207.78:5000/api/Filter/add-disciplines'),
          fetchWithAuth('http://185.237.207.78:5000/api/Filter/specialities')
        ])

        const disciplinesData = await disciplinesRes.json()
        const specialitiesData = await specialitiesRes.json()

        setAddDisciplines(disciplinesData || [])
        setSpecialities(specialitiesData || [])
        await fetchFilteredData(1)
      } catch (error) {
        console.error('Error fetching initial data:', error)
      }
    }

    fetchInitialData()
  }, [token])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchFilteredData(1)
  }

  const handleAdd = () => {
    setSelectedBindLoan({
      addDisciplinesId: 0,
      educationalProgramId: 0
    })
    setModalType('add')
    setIsModalOpen(true)
  }

  const handleEdit = (bindLoan: BindLoan) => {
    setSelectedBindLoan(bindLoan)
    setModalType('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (bindLoan: BindLoan) => {
    setSelectedBindLoan(bindLoan)
    setModalType('delete')
    setIsModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedBindLoan?.idBindLoan) return

    try {
      const response = await fetchWithAuth(
        `http://185.237.207.78:5000/api/BindLoansMain/${selectedBindLoan.idBindLoan}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        fetchFilteredData(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Error deleting bind loan')
      }
    } catch (error) {
      console.error('Error deleting bind loan:', error)
    }
  }

  const saveChanges = async () => {
    if (!selectedBindLoan) return

    try {
      let response
      if (modalType === 'add') {
        response = await fetchWithAuth('http://185.237.207.78:5000/api/BindLoansMain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addDisciplinesId: selectedBindLoan.addDisciplinesId,
            educationalProgramId: selectedBindLoan.educationalProgramId
          })
        })
      } else {
        response = await fetchWithAuth(
          `http://185.237.207.78:5000/api/BindLoansMain/${selectedBindLoan.idBindLoan}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              addDisciplinesId: selectedBindLoan.addDisciplinesId,
              educationalProgramId: selectedBindLoan.educationalProgramId,
              idBindLoan: selectedBindLoan.idBindLoan
            })
          }
        )
      }

      if (response.ok) {
        fetchFilteredData(currentPage)
        setIsModalOpen(false)
      } else {
        console.error('Error saving bind loan')
      }
    } catch (error) {
      console.error('Error saving bind loan:', error)
    }
  }

  const columns: Column[] = [
    { header: 'Назва дисціпліни', accessor: 'addDisciplineName' },
    { header: 'Назва програми', accessor: 'educationalProgramName' },
  ]
console.log(`bindLoans`,bindLoans)
  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
      <aside className="sm:w-1/5 w-full">
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4">
          <FilterBox
            name="Дисципліни"
            options={addDisciplines}
            accessor={"id"}
            valueName={"name"}
            searchName={"name"}
            selectedValues={selectedDisciplines}
            onChange={setSelectedDisciplines}
          />
          <FilterBox
            name="Спеціальності"
            accessor={"id"}
            valueName={"name"}
            options={specialities}
            selectedValues={selectedSpecialities}
            onChange={setSelectedSpecialities}
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
              placeholder="Пошук..."
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
              Додати
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            onEdit={handleEdit}
            onDelete={handleDelete}
            isActionEnabled={true}
            columns={columns}
            data={bindLoans}
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
        {modalType && ['add', 'edit'].includes(modalType) && selectedBindLoan && (
          <div>
            <h2 className="text-xl font-bold mb-4">
              {modalType === 'add' ? 'Додати прив\'язку' : 'Редагувати прив\'язку'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Дисципліна</label>
                <select
                  value={selectedBindLoan.addDisciplinesId || 0}
                  onChange={(e) => setSelectedBindLoan({
                    ...selectedBindLoan,
                    addDisciplinesId: Number(e.target.value)
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={0}>Оберіть дисципліну</option>
                  {addDisciplines.map(discipline => (
                    <option key={discipline.id} value={discipline.id}>
                      {discipline.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Освітня програма</label>
                <select
                  value={selectedBindLoan.educationalProgramId || 0}
                  onChange={(e) => setSelectedBindLoan({
                    ...selectedBindLoan,
                    educationalProgramId: Number(e.target.value)
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={0}>Оберіть освітню програму</option>
                  {specialities.map(speciality => (
                    <option key={speciality.id} value={speciality.id}>
                      {speciality.name}
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

        {modalType === 'delete' && selectedBindLoan && (
          <div>
            <h2 className="text-xl font-bold mb-4">Видалення прив'язки</h2>
            <p>Ви впевнені, що хочете видалити цю прив'язку?</p>
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