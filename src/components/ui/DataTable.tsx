"use client";

import React from "react";

interface Column<T> {
  header: string;
  accessor: keyof T;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

const DataTable = <T extends Record<string, any>>({
                                                    columns,
                                                    data,
                                                    emptyMessage = "Нічого не знайдено",
                                                  }: DataTableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
        <tr className="bg-gray-200 text-gray-700">
          {columns.map((col) => (
            <th key={col.header} className="py-2 px-4 border-b">
              {col.header}
            </th>
          ))}
        </tr>
        </thead>
        <tbody>
        {data.length > 0 ? (
          data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={String(col.accessor)} className="py-2 px-4 border-b">
                  {String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="py-2 px-4 text-center text-gray-500">
              {emptyMessage}
            </td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
