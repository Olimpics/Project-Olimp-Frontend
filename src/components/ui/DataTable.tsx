'use client'

import React, { useState } from 'react'

interface Column<T> {
    header: string
    accessor: keyof T
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    emptyMessage?: string
    isActionEnabled?: boolean
    onDelete?: (el: T) => void
    onEdit?: (el: T) => void
    onClick?: (el: T) => void
}

const DataTable = <T extends Record<string, any>>({
    columns,
    data,
    isActionEnabled,
    onClick,
    emptyMessage = 'Нічого не знайдено',
    onDelete,
    onEdit,
}: DataTableProps<T>) => {
    const [openRowIndex, setOpenRowIndex] = useState<number | null>(null)

    const toggleDropdown = (index: number) => {
        setOpenRowIndex((prev) => (prev === index ? null : index))
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 relative">
                <thead>
                    <tr className="bg-gray-200 text-gray-700">
                        {columns.map((col) => (
                            <th key={col.header} className="py-2 px-4 border-b">
                                {col.header}
                            </th>
                        ))}
                        {isActionEnabled && (
                            <th key="action" className="py-2 px-4 border-b">
                                Дії
                            </th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr
                                onClick={() => {
                                    onClick(row)
                                }}
                                key={rowIndex}
                                className="hover:bg-gray-50 relative"
                            >
                                {columns.map((col) => (
                                    <td
                                        key={String(col.accessor)}
                                        className="py-2 px-4 border-b"
                                    >
                                        {String(row[col.accessor])}
                                    </td>
                                ))}

                                {isActionEnabled && (
                                    <td className="py-2 px-4 border-b relative">
                                        <div
                                            className="w-4 h-4 bg-black cursor-pointer"
                                            onClick={() =>
                                                toggleDropdown(rowIndex)
                                            }
                                        ></div>

                                        {openRowIndex === rowIndex && (
                                            <div className="absolute z-10 mt-2 ml-[-130px] bg-white border border-gray-300 shadow-md rounded-md py-1 w-32">
                                                <button
                                                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                                    onClick={() => {
                                                        onEdit?.(data[rowIndex])
                                                        toggleDropdown(rowIndex)
                                                    }}
                                                >
                                                    Редагувати
                                                </button>
                                                <button
                                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                                                    onClick={() => {
                                                        onDelete?.(
                                                            data[rowIndex]
                                                        )
                                                        toggleDropdown(rowIndex)
                                                    }}
                                                >
                                                    Видалити
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={
                                    columns.length + (isActionEnabled ? 1 : 0)
                                }
                                className="py-2 px-4 text-center text-gray-500"
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
