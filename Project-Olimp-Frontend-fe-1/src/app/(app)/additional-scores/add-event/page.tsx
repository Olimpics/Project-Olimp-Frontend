'use client'

import React, { useEffect, useState } from 'react'
import EventForm, { ParticipantInput } from '@/components/additional-scores/EventForm'
import {
  sgService,
  SubDivisionUser,
  StudentSg,
  SgRefItem,
  EventCreateUpdate,
} from '@/services/sgService'

const AddEventPage = () => {
  const [subdivisions, setSubdivisions] = useState<SubDivisionUser[]>([])
  const [catalogYears, setCatalogYears] = useState<SgRefItem[]>([])
  const [regulations, setRegulations] = useState<SgRefItem[]>([])
  const [roles, setRoles] = useState<SgRefItem[]>([])
  const [students, setStudents] = useState<StudentSg[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [subs, years, regs, evRoles] = await Promise.all([
          sgService.getUserSubDivisions(),
          sgService.getCatalogYears(),
          sgService.getRegulations(),
          sgService.getEventRoles(),
        ])
        setSubdivisions(subs)
        setCatalogYears(years)
        setRegulations(regs)
        setRoles(evRoles)
      } catch (e: any) {
        setLoadError(e?.message || 'Не вдалося завантажити довідкові дані')
      }
    }
    load()
  }, [])

  const handleSubdivisionChange = async (subDivisionId: string) => {
    if (!subDivisionId) {
      setStudents([])
      return
    }
    try {
      setStudents(await sgService.getStudentsInSg(subDivisionId))
    } catch {
      setStudents([])
    }
  }

  const handleSave = async (dto: EventCreateUpdate, participants: ParticipantInput[]) => {
    const created = await sgService.createEvent(dto)
    for (const p of participants) {
      await sgService.addStudentToEvent({
        eventId: created.idEvent,
        studentId: p.studentId,
        roleId: p.roleId,
        point: p.point,
        otherOption: p.otherOption,
      })
    }
    if (typeof window !== 'undefined') window.close()
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col">
      <main className="flex-grow flex flex-col overflow-hidden">
        {loadError && (
          <div className="m-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{loadError}</div>
        )}
        <EventForm
          subdivisions={subdivisions}
          catalogYears={catalogYears}
          regulations={regulations}
          roles={roles}
          students={students}
          onSubdivisionChange={handleSubdivisionChange}
          onSave={handleSave}
        />
      </main>
    </div>
  )
}

export default AddEventPage
