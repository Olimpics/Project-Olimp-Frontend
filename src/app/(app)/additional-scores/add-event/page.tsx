'use client'

import React from 'react'
import EventForm from '@/components/additional-scores/EventForm'


const AddEventPage = () => {
  // We re-declare mock data here because this is a standalone page
  const faculties = ['ФІТ', 'ФЕМ', 'ФЛК']
  const mockStudents = [
    { id: 1, fullName: 'Коваленко Ганна Олександрівна', group: 'КН-31', department: 'Кафедра комп’ютерних наук' },
    { id: 2, fullName: 'Петренко Олександр Миколайович', group: 'МЕН-21', department: 'Кафедра менеджменту' },
    { id: 3, fullName: 'Сидоренко Іван Васильович', group: 'ПІ-41', department: 'Кафедра програмної інженерії' },
  ]

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col">
      <main className="flex-grow flex flex-col overflow-hidden">
        <EventForm 
          departments={faculties}
          mockStudents={mockStudents}
        />
      </main>
    </div>
  )
}

export default AddEventPage
