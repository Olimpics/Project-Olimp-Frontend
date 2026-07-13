'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface Column<T> {
  header: string
  accessor: keyof T
  href?: (row: T) => string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  isActionEnabled?: boolean
  showDeleteAction?: boolean
  onDelete?: (el: T) => void
  onEdit?: (el: T) => void
  onManagePermissions?: (el: T) => void
  onClick?: (el: T) => void
  sortField?: keyof T | string | null
  sortDirection?: 'asc' | 'desc'
  onSort?: (field: any) => void
}

const DataTable = <T extends { id?: string | number } & Record<string, any>>({
  columns,
  data,
  emptyMessage = 'Нічого не знайдено',
  isActionEnabled,
  showDeleteAction = true,
  onDelete,
  onEdit,
  onManagePermissions,
  onClick,
  sortField,
  sortDirection,
  onSort,
}: DataTableProps<T>) => {
  const router = useRouter()

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            {columns.map((col) => {
              const isSorted = sortField === col.accessor
              return (
                <th
                  key={`${col.header}-${String(col.accessor)}`}
                  className={`py-2 px-4 border-b text-left ${col.sortable && onSort ? 'cursor-pointer select-none hover:bg-gray-300' : ''}`}
                  onClick={col.sortable && onSort ? () => onSort(col.accessor) : undefined}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && onSort && (
                      <span className="text-gray-400 text-xs">
                        {isSorted ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                      </span>
                    )}
                  </div>
                </th>
              )
            })}
            {isActionEnabled && (
              <th className="py-2 px-4 border-b text-center">Дії</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={row.id ?? `row-${rowIndex}`}
                className={`${
                  onClick ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                }`}
                onClick={onClick ? () => onClick(row) : undefined}
              >
                {columns.map((col) => {
                  const content = col.render ? col.render(row) : String(row[col.accessor])
                  const href = col.href?.(row)

                  return (
                    <td
                      key={`${row.id ?? rowIndex}-${String(col.accessor)}`}
                      className="py-2 px-4 border-b"
                    >
                      {href ? (
                        <span
                          className="text-blue-600 hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(href)
                          }}
                        >
                          {content}
                        </span>
                      ) : (
                        content
                      )}
                    </td>
                  )
                })}

                {isActionEnabled && (
                  <td className="py-2 px-4 border-b text-center">
                    <div className="flex justify-center gap-2">
                      {onManagePermissions && (
                        <button
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
                          title="Керувати дозволами"
                          onClick={(e) => {
                            e.stopPropagation()
                            onManagePermissions(row)
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          </svg>
                        </button>
                      )}
                      {onEdit && (
                        <button
                          className="p-1 hover:bg-gray-100 rounded text-blue-600 transition-colors"
                          title="Редагувати"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent row onClick from firing
                            onEdit(row)
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      )}
                      
                      {showDeleteAction && onDelete && (
                        <button
                          className="p-1 hover:bg-gray-100 rounded text-red-600 transition-colors"
                          title="Видалити"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent row onClick from firing
                            onDelete(row)
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (isActionEnabled ? 1 : 0)}
                className="py-10 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable