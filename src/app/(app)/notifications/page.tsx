'use client'
import { useEffect, useState, useCallback } from 'react'
import React from 'react'
import DataTable from '@/components/ui/DataTable'
import { FilterBox } from '@/components/ui/FilterBox'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'

type Notification = {
  idNotification: number
  userId: number
  templateId: number
  title: string
  message: string
  isRead: boolean
  createdAt: string
  notificationType: string
  status?: string
}

interface Column {
  header: string
  accessor: keyof Notification | 'status'
}

const sortingOptions = [
  { label: 'Нещодавні', value: 2 },
  { label: 'Старіші', value: 1 },
]

const pageSize = 10

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filtered, setFiltered] = useState<Notification[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [readFilter, setReadFilter] = useState<string[]>([])
  const [sorting, setSorting] = useState<number>(2)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [pendingSearchTerm, setPendingSearchTerm] = useState('')
  const [pendingReadFilter, setPendingReadFilter] = useState<string[]>([])
  const [pendingSorting, setPendingSorting] = useState<number>(2)

  const fetchNotifications = useCallback(async () => {
    try {
      const studentRaw = getCookie(USER_PROFLE)
      if (!studentRaw) return
      const student = JSON.parse(studentRaw)

      const query = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        sortOrder: pendingSorting.toString(),
        search: searchTerm,
      })

      if (readFilter.includes('Прочитані')) query.append('isRead', 'true')
      if (readFilter.includes('Непрочитані')) query.append('isRead', 'false')

      const res = await fetch(`http://185.237.207.78:5000/api/Notification/user/${student.userId}?${query.toString()}`)
      const data = await res.json()

      const updated = data.notifications.map((n: Notification) => ({
        ...n,
        status: n.isRead ? 'Прочитано' : 'Непрочитано',
      }))

      setNotifications(updated)
      setFiltered(updated)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Error loading notifications', err)
    }
  }, [currentPage, searchTerm, readFilter, pendingSorting])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleApplyFilters = () => {
    setSearchTerm(pendingSearchTerm)
    setReadFilter(pendingReadFilter)
    setSorting(pendingSorting)
    setCurrentPage(1)
  }

  const columns: Column[] = [
    { header: 'Заголовок', accessor: 'title' },
    { header: 'Текст', accessor: 'message' },
    { header: 'Створено о', accessor: 'createdAt' },
    { header: 'Статус', accessor: 'status' },
  ]

  const Pagination = ({
    totalPages,
    currentPage,
    onPageChange,
  }: {
    totalPages: number
    currentPage: number
    onPageChange: (page: number) => void
  }) => {
    const getPages = () => {
      const pages: (number | string)[] = []
      if (totalPages <= 16) return Array.from({ length: totalPages }, (_, i) => i + 1)
      pages.push(1)
      if (currentPage > 4) pages.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 3) pages.push('...')
      pages.push(totalPages)
      return pages
    }

    return (
      <nav className="flex justify-center mt-4 space-x-2">
        {getPages().map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 py-2">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(Number(page))}
              className={`px-4 py-2 rounded ${currentPage === page
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white text-blue-600 border border-gray-300 hover:bg-blue-100'}`}
            >
              {page}
            </button>
          )
        )}
      </nav>
    )
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col sm:flex-row gap-4">
      <aside className="sm:w-1/5 w-full">
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 mb-4">
          <FilterBox
            name="Статус"
            options={[{ name: 'Прочитані' }, { name: 'Непрочитані' }]}
            accessor="name"
            selectedValues={pendingReadFilter}
            onChange={setPendingReadFilter}
          />
        </div>
        <button
          onClick={handleApplyFilters}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Застосувати фільтри
        </button>
      </aside>

      <main className="sm:w-4/5 w-full">
        <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 justify-between">
          <div className="w-xl sm:w-auto flex gap-2">
            <input
              type="text"
              placeholder="Пошук повідомлення..."
              value={pendingSearchTerm}
              onChange={(e) => setPendingSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleApplyFilters}
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Пошук
            </button>
          </div>

          <select
            value={pendingSorting}
            onChange={(e) => setPendingSorting(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortingOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <DataTable columns={columns} data={filtered} />
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </main>
    </div>
  )
}