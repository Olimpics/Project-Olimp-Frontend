'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import DataTable from '@/components/ui/DataTable'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import Pagination from '@/app/(app)/course-catalogue/disciplines/page'

// --- Types ---
type StudentSelectedDiscipline = {
  idBindAddDisciplines: number
  idAddDisciplines: number
  nameAddDisciplines: string
  codeAddDisciplines: string
  semestr: number
  inProcess: number
}

export type StudentRow = {
  id: number
  fullName: string
  faculty: string
  degreeLevelName: string
  year: number
  group: string
  disciplinesShort: string
  disciplinesAll: string[]
  rawChoices: StudentSelectedDiscipline[]
  selectionStatus: number
  confirmationStatus: number
  selectionLabel: string
  confirmationLabel: string
}

interface StudentDisciplinesTableProps {
  searchTerm: string
  faculties: string[]
  degrees: string[]
  courses: string[]
  groups: string[]
  selectionFilter: string
  confirmationFilter: string
  isNewFilter: string
  sortOrder: number
  onEdit: (row: StudentRow) => void
  refreshTrigger?: number // Used to force refresh from parent
}

const getFacultyIdFromCookie = (): number => {
  try {
    const raw = getCookie(USER_PROFLE)
    if (!raw) return 0
    const user = JSON.parse(raw) as { idFaculty?: number; facultyId?: number }
    return user?.idFaculty ?? user?.facultyId ?? 0
  } catch { return 0 }
}

export const StudentDisciplinesTable: React.FC<StudentDisciplinesTableProps> = ({
  searchTerm,
  faculties,
  degrees,
  courses,
  groups,
  selectionFilter,
  confirmationFilter,
  isNewFilter,
  sortOrder,
  onEdit,
  refreshTrigger
}) => {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async (page: number = currentPage) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('pageSize', '15')
      if (searchTerm.trim()) params.set('search', searchTerm.trim())
      if (faculties.length > 0) params.set('faculties', faculties.join(','))
      if (courses.length > 0) params.set('courses', courses.join(','))
      if (groups.length > 0) params.set('groups', groups.join(','))
      if (degrees.length > 0) params.set('degreeLevelIds', degrees.join(','))
      if (selectionFilter !== 'all') params.set('selectionStatus', selectionFilter)
      if (confirmationFilter !== 'all') params.set('confirmationStatus', confirmationFilter)
      
      params.set('sortOrder', String(sortOrder))
      params.set('isNew', isNewFilter)

      if (isNewFilter === '1') {
        const fId = getFacultyIdFromCookie()
        if (fId > 0) params.set('facultyId', String(fId))
      }

      const res = await fetch(`https://localhost:7011/api/DisciplineTabAdmin/GetStudentsWithDisciplineChoices?${params.toString()}`)
      if (!res.ok) throw new Error('Не вдалося завантажити дані')
      
      const data = await res.json()
      const mapped: StudentRow[] = (data.students || []).map((s: any) => ({
        id: s.studentId,
        fullName: s.fullName,
        faculty: s.faculty,
        degreeLevelName: s.degreeLevelName,
        year: s.year,
        group: s.group,
        disciplinesShort: s.selectedDisciplines.length === 0 ? 'Немає' : `${s.selectedDisciplines[0].codeAddDisciplines} – ${s.selectedDisciplines[0].nameAddDisciplines}`,
        disciplinesAll: s.selectedDisciplines.map((d: any) => `${d.codeAddDisciplines} – ${d.nameAddDisciplines}`),
        rawChoices: s.selectedDisciplines,
        selectionLabel: s.selectionStatus === 1 ? 'Набрано' : 'Не набрано',
        confirmationLabel: s.confirmationStatus === 1 ? 'Підтверджено' : 'Не підтверджено',
      }))

      setStudents(mapped)
      setTotalPages(data.totalPages || 1)
      setCurrentPage(data.currentPage || page)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, faculties, degrees, courses, groups, selectionFilter, confirmationFilter, isNewFilter, sortOrder, currentPage])

  useEffect(() => {
    fetchStudents(1)
  }, [searchTerm, faculties, degrees, courses, groups, selectionFilter, confirmationFilter, isNewFilter, sortOrder, refreshTrigger])

  const columns = useMemo(() => [
    { header: 'ПІБ студента', accessor: 'fullName' as keyof StudentRow },
    { header: 'Факультет', accessor: 'faculty' as keyof StudentRow },
    { header: 'Рівень освіти', accessor: 'degreeLevelName' as keyof StudentRow },
    { header: 'Курс', accessor: 'year' as keyof StudentRow },
    { header: 'Група', accessor: 'group' as keyof StudentRow },
    {
      header: 'Обрані дисципліни',
      accessor: 'disciplinesShort' as keyof StudentRow,
      render: (row: StudentRow) => (
        <span className="inline-flex items-center gap-2">
          <span>{row.disciplinesShort}</span>
          {row.disciplinesAll.length > 1 && (
             <MoreModalBadge rest={row.disciplinesAll.slice(1)} moreCount={row.disciplinesAll.length - 1} />
          )}
        </span>
      )
    },
    { header: 'Статус набору', accessor: 'selectionLabel' as keyof StudentRow },
    { header: 'Підтвердження', accessor: 'confirmationLabel' as keyof StudentRow },
  ], [])

  if (error) return <div className="p-4 text-red-600">{error}</div>

  return (
    <>
      {loading ? (
        <div className="p-8 text-gray-600">Завантаження...</div>
      ) : (
        <>
          <DataTable 
            columns={columns} 
            data={students} 
            isActionEnabled 
            onEdit={onEdit} 
            showDeleteAction={false} 
          />
          <div className="bg-slate-50/60 py-3">
            <Pagination 
                totalPages={totalPages} 
                currentPage={currentPage} 
                onPageChange={(p) => { setCurrentPage(p); fetchStudents(p); }} 
            />
          </div>
        </>
      )}
    </>
  )
}

export default StudentDisciplinesTable