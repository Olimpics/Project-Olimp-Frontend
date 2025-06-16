'use client'

import React, { useState, useEffect } from 'react'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import { useRouter } from 'next/navigation'
import { apiService } from '@/services/axiosService' 

interface Discipline {
  id_disp: number
  name_disp: string
  semester_disp: boolean
}

const GoToPageButton = () => {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push('/catalogue')}
      className="mt-4 px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-xl transition duration-300"
    >
      Перейти до каталогу дисциплін
    </button>
  )
}

const SearchInput: React.FC<{
  index: number
  selectedItems: string[]
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
  setDisciplineData: React.Dispatch<React.SetStateAction<Discipline[]>>
}> = ({ index, selectedItems, setSelectedItems, setDisciplineData }) => {
  const [searchValue, setSearchValue] = useState('')
  const [allDisciplines, setAllDisciplines] = useState<Discipline[]>([])
  const [filteredItems, setFilteredItems] = useState<Discipline[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const studentDataRaw = getCookie(USER_PROFLE)
        if (!studentDataRaw) {
          console.error('No student profile found in cookies')
          return
        }

        const student = JSON.parse(studentDataRaw)
        const isEvenSemester = index >= 2

        const data = await apiService.get<any>(
          `DisciplineTab/GetDisciplinesBySemester?studentId=${student.id}&isEvenSemester=${isEvenSemester}`
        )

        const parsed = data.disciplines.map((d: any) => ({
          id_disp: d.idAddDisciplines,
          name_disp: `${d.codeAddDisciplines} ${d.nameAddDisciplines}`,
          semester_disp: isEvenSemester,
        }))

        setAllDisciplines(parsed)
        setFilteredItems(parsed)

        setDisciplineData((prev) => {
          const newIds = new Set(parsed.map((d) => d.id_disp))
          const filtered = prev.filter((d) => !newIds.has(d.id_disp))
          return [...filtered, ...parsed]
        })
      } catch (error) {
        console.error('Failed to fetch disciplines:', error)
      }
    }

    fetchDisciplines()
  }, [index, setDisciplineData])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchValue(query)

    const filtered = allDisciplines.filter(
      (disp) =>
        disp.name_disp.toLowerCase().includes(query) &&
        (!selectedItems.includes(disp.name_disp) || selectedItems[index] === disp.name_disp)
    )

    setFilteredItems(filtered)
    setShowDropdown(true)
  }

  const handleSelectItem = (name: string) => {
    setSearchValue(name)
    setSelectedItems((prev) => {
      const updated = [...prev]
      updated[index] = name
      return updated
    })
    setShowDropdown(false)
  }

  return (
    <div className="relative w-full max-w-md mb-4">
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Дисципліна"
          value={searchValue}
          onChange={handleSearch}
          onFocus={() => {
            const filtered = allDisciplines.filter(
              (disp) =>
                !selectedItems.includes(disp.name_disp) || selectedItems[index] === disp.name_disp
            )
            setFilteredItems(filtered)
            setShowDropdown(true)
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="w-full px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
        <button
          type="button"
          onClick={() => setShowDropdown((prev) => !prev)}
          className="px-3 py-2 bg-white border-t border-b border-r border-gray-300 rounded-r-md hover:bg-gray-300"
        >
          ▼
        </button>
      </div>
      {showDropdown && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredItems.map((item) => (
            <li
              key={item.id_disp}
              onClick={() => handleSelectItem(item.name_disp)}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
            >
              {item.name_disp}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const Page: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>(['', '', '', ''])
  const [disciplineData, setDisciplineData] = useState<Discipline[]>([])
  const [studentId, setStudentId] = useState<number | null>(null)

  useEffect(() => {
    const raw = getCookie(USER_PROFLE)
    if (!raw) {
      console.error('Student profile missing')
      return
    }
    try {
      const parsed = JSON.parse(raw)
      setStudentId(parsed.idStudents)
    } catch (error) {
      console.error('Invalid profile JSON:', error)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId) {
      alert('Student ID not found.')
      return
    }

    const selectedDisciplines = selectedItems
      .map((name) => disciplineData.find((d) => d.name_disp === name))
      .filter((d): d is Discipline => Boolean(d))

    for (const discipline of selectedDisciplines) {
      try {
        await apiService.post('DisciplineTab/AddDisciplineBind', {
          studentId: studentId,
          disciplineId: discipline.id_disp,
          semester: discipline.semester_disp ? 0 : 1,
        })
      } catch (error) {
        console.error(error)
        alert(`Помилка збереження: ${discipline.name_disp}`)
        return
      }
    }
  }

  if (studentId === null) {
    return <div className="text-center text-white">Завантаження профілю студента...</div>
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-center w-full max-w-xl p-6 bg-blue-600 rounded-3xl space-y-4 shadow-lg"
      >
        {selectedItems.map((_, index) => (
          <div key={index} className="w-full flex flex-col items-center">
            {index === 0 && (
              <h1 className="text-white font-bold text-lg mb-2 text-center">Осінні дисципліни</h1>
            )}
            {index === 2 && (
              <h1 className="text-white font-bold text-lg mb-2 text-center">Весняні дисципліни</h1>
            )}
            <SearchInput
              index={index}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              setDisciplineData={setDisciplineData}
            />
          </div>
        ))}
        <button
          type="submit"
          className="mt-4 px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-xl transition duration-300"
        >
          ЗБЕРЕГТИ
        </button>
        <GoToPageButton />
      </form>
    </div>
  )
}

export default Page