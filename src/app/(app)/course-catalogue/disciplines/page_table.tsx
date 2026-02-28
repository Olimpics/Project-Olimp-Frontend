'use client'

import React, { useMemo, useState } from 'react'

/**
 * TABLE-ONLY PAGE (no slides view)
 * UI styled to match provided screenshot:
 * - Top navigation tabs
 * - Left sidebar filters card
 * - Search + Export / Import buttons
 * - Table with light gray header and bordered rows
 * - Ukrainian interface
 */

type Degree = 'Бакалавр' | 'Магістр'
type Status = 'Активна' | 'Неактивна'

interface Course {
  id: string
  faculty: string
  code: string
  name: string
  students: string
  degree: Degree
  status: Status
}

const mockData: Course[] = [
  {
    id: '1',
    faculty: 'БФФ',
    code: '2-014-5-1',
    name: 'Біосоціальний аналіз особливостей антропогенезу',
    students: '11 / 500',
    degree: 'Магістр',
    status: 'Активна',
  },
  {
    id: '2',
    faculty: 'ІФ',
    code: '2-014-5-2',
    name: 'Методологія профорієнтаційної роботи з учнівською молоддю',
    students: '9 / 60',
    degree: 'Магістр',
    status: 'Активна',
  },
  {
    id: '3',
    faculty: 'ФСНМВ',
    code: '2-014-5-3',
    name: 'Інтеграційні процеси в природничій освіті',
    students: '7 / 60',
    degree: 'Магістр',
    status: 'Активна',
  },
]

export default function DisciplinesTablePage() {
  const [search, setSearch] = useState('')
  const [facultyFilter, setFacultyFilter] = useState('Усі')
  const [degreeFilter, setDegreeFilter] = useState('Усі')

  const filtered = useMemo(() => {
    return mockData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase())

      const matchesFaculty =
        facultyFilter === 'Усі' || item.faculty === facultyFilter

      const matchesDegree =
        degreeFilter === 'Усі' || item.degree === degreeFilter

      return matchesSearch && matchesFaculty && matchesDegree
    })
  }, [search, facultyFilter, degreeFilter])

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Top Bar */}
      <div className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
        <div className="font-semibold text-lg">Project Olimp</div>
        <div className="flex gap-4">
          <div className="w-8 h-8 bg-white rounded-full" />
          <div className="w-6 h-6 bg-white rounded-sm" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 flex gap-8 text-sm">
          {[
            'Дисципліни',
            'Студенти',
            'Факультети',
            'Кафедра',
            'Спеціальності',
            'Групи',
            'Звʼязані групи',
          ].map((tab, i) => (
            <button
              key={tab}
              className={`py-4 border-b-2 ${
                i === 0
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">

        {/* LEFT FILTERS */}
        <div className="w-64">
          <div className="bg-white rounded shadow-sm border p-4 space-y-4">

            <div>
              <label className="text-sm font-medium">
                Тільки доступні дисципліни
              </label>
              <select className="mt-1 w-full border rounded px-3 py-2 text-sm">
                <option>Усі</option>
                <option>Так</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Факультет</label>
              <select
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              >
                <option>Усі</option>
                <option>БФФ</option>
                <option>ІФ</option>
                <option>ФСНМВ</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Рівень освіти</label>
              <select
                value={degreeFilter}
                onChange={(e) => setDegreeFilter(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              >
                <option>Усі</option>
                <option>Бакалавр</option>
                <option>Магістр</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Курс</label>
              <select className="mt-1 w-full border rounded px-3 py-2 text-sm">
                <option>Усі</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Парний семестр</label>
              <select className="mt-1 w-full border rounded px-3 py-2 text-sm">
                <option>Усі</option>
              </select>
            </div>

            <button className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">
              Застосувати фільтри
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="flex-1">

          {/* Top Controls */}
          <div className="flex items-center justify-between mb-4">

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Пошук дисципліни..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded px-3 py-2 w-80 text-sm"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                Пошук
              </button>
            </div>

            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                Експорт
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                Імпорт
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white border rounded shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left border-b">Факультет</th>
                  <th className="px-4 py-2 text-left border-b">Код дисципліни</th>
                  <th className="px-4 py-2 text-left border-b">Назва дисципліни</th>
                  <th className="px-4 py-2 text-left border-b">Кількість студентів</th>
                  <th className="px-4 py-2 text-left border-b">Рівень освіти</th>
                  <th className="px-4 py-2 text-left border-b">Дії</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{row.faculty}</td>
                    <td className="px-4 py-2 border-b">{row.code}</td>
                    <td className="px-4 py-2 border-b">{row.name}</td>
                    <td className="px-4 py-2 border-b">{row.students}</td>
                    <td className="px-4 py-2 border-b">{row.degree}</td>
                    <td className="px-4 py-2 border-b">
                      <button className="text-gray-600 hover:text-blue-600">
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-gray-500"
                    >
                      Нічого не знайдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}