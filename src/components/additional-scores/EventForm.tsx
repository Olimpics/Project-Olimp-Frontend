'use client'

import React, { useState, useEffect } from 'react'
import DataTable from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'

interface Participant {
  id: number
  fullName: string
  department: string
  group: string
  role: string
}

interface EventFormProps {
  onSave: (data: any) => void
  onCancel: () => void
  departments: string[]
  mockStudents: { id: number; fullName: string; group: string; department: string }[]
}

const EventForm: React.FC<EventFormProps> = ({ onSave, onCancel, departments, mockStudents }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    format: 'Offline',
    venue: '',
    department: departments[0] || ''
  })

  const [participants, setParticipants] = useState<Participant[]>([])
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false)
  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false)
  const [saveTimer, setSaveTimer] = useState(0)

  // Add Participant Form State
  const [newParticipant, setNewParticipant] = useState({
    studentId: null as number | null,
    role: 'Participant',
    customRole: ''
  })
  const [studentSearch, setStudentSearch] = useState('')
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false)

  const participantColumns = [
    { header: '№', accessor: 'id' as const },
    { header: 'ПІБ', accessor: 'fullName' as const },
    { header: 'Факультет/Кафедра', accessor: 'department' as const },
    { header: 'Роль на заході', accessor: 'role' as const },
  ]

  const isFormValid = 
    formData.name.trim() !== '' && 
    formData.startDate !== '' && 
    formData.format !== '' && 
    formData.venue.trim() !== '' && 
    participants.length > 0

  const handleAddParticipant = () => {
    const student = mockStudents.find(s => s.id === newParticipant.studentId)
    if (student) {
      const role = newParticipant.role === 'Other' ? newParticipant.customRole : newParticipant.role
      const p: Participant = {
        id: participants.length + 1,
        fullName: student.fullName,
        department: student.department,
        group: student.group,
        role: role
      }
      setParticipants([...participants, p])
      setIsAddParticipantModalOpen(false)
      setNewParticipant({ studentId: null, role: 'Participant', customRole: '' })
      setStudentSearch('')
    }
  }

  const handleSaveClick = () => {
    setSaveTimer(5)
    setIsSaveConfirmModalOpen(true)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSaveConfirmModalOpen && saveTimer > 0) {
      interval = setInterval(() => {
        setSaveTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isSaveConfirmModalOpen, saveTimer])

  const confirmSave = () => {
    if (saveTimer === 0) {
      onSave({ ...formData, participants })
    }
  }

  const selectedStudent = mockStudents.find(s => s.id === newParticipant.studentId)

  return (
    <div className="flex-1 p-6 overflow-auto bg-[#f4f6f8]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Block */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Інформація про захід</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">Назва заходу:</label>
              <textarea 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Введіть повну назву заходу..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Дата або період проведення:</label>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <span className="text-gray-400">—</span>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Формат:</label>
              <select 
                value={formData.format}
                onChange={(e) => setFormData({...formData, format: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="Offline">Офлайн (Offline)</option>
                <option value="Online">Онлайн (Online)</option>
                <option value="Mixed">Змішаний (Mixed)</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">Місце проведення:</label>
              <textarea 
                value={formData.venue}
                onChange={(e) => setFormData({...formData, venue: e.target.value})}
                placeholder="Вкажіть місце проведення або посилання..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Підрозділ:</label>
              <select 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800">Список учасників</h3>
            <button 
              onClick={() => setIsAddParticipantModalOpen(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md flex items-center gap-2 px-4"
            >
              <span className="text-xl leading-none">+</span>
              <span className="text-sm font-bold">Додати</span>
            </button>
          </div>
          <DataTable
            columns={participantColumns as any}
            data={participants}
            isActionEnabled={true}
            onDelete={(item: any) => setParticipants(participants.filter(p => p.id !== item.id))}
          />
          {participants.length === 0 && (
            <div className="p-12 text-center text-gray-400 italic">
              Список учасників порожній. Будь ласка, додайте хоча б одного учасника.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pb-12">
          <button 
            onClick={onCancel}
            className="px-8 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 transition shadow-sm"
          >
            Скасувати
          </button>
          <button 
            disabled={!isFormValid}
            onClick={handleSaveClick}
            className="px-12 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            Зберегти
          </button>
        </div>
      </div>

      {/* Add Participant Modal */}
      <Modal isOpen={isAddParticipantModalOpen} onClose={() => setIsAddParticipantModalOpen(false)}>
        <div className="space-y-6 p-2">
          <h3 className="text-xl font-bold text-gray-900 text-center">Додати учасника</h3>
          
          <div className="space-y-4">
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-gray-700">Студент:</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={studentSearch}
                  onFocus={() => setIsStudentDropdownOpen(true)}
                  onChange={(e) => {
                    setStudentSearch(e.target.value)
                    setIsStudentDropdownOpen(true)
                  }}
                  placeholder="Пошук студента за ПІБ..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {isStudentDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {mockStudents
                    .filter(s => s.fullName.toLowerCase().includes(studentSearch.toLowerCase()))
                    .map(student => (
                      <div 
                        key={student.id}
                        onClick={() => {
                          setNewParticipant({...newParticipant, studentId: student.id})
                          setStudentSearch(student.fullName)
                          setIsStudentDropdownOpen(false)
                        }}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                      >
                        <div className="text-sm font-semibold text-gray-800">{student.fullName}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">{student.group} • {student.department}</div>
                      </div>
                    ))
                  }
                </div>
              )}

              {selectedStudent && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-bold text-blue-800">{selectedStudent.fullName}</p>
                  <p className="text-[10px] text-blue-600 uppercase">{selectedStudent.group} • {selectedStudent.department}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Роль на заході:</label>
              <select 
                value={newParticipant.role}
                onChange={(e) => setNewParticipant({...newParticipant, role: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              >
                <option value="Organizer">Організатор</option>
                <option value="Co-organizer">Співорганізатор</option>
                <option value="Participant">Учасник</option>
                <option value="Other">Інше</option>
              </select>
            </div>

            {newParticipant.role === 'Other' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-bold text-gray-700">Вкажіть свою роль:</label>
                <input 
                  type="text" 
                  value={newParticipant.customRole}
                  onChange={(e) => setNewParticipant({...newParticipant, customRole: e.target.value})}
                  placeholder="Наприклад: Волонтер, Суддя..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex w-full gap-4 pt-4">
            <button 
              onClick={() => setIsAddParticipantModalOpen(false)}
              className="flex-1 px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Скасувати
            </button>
            <button 
              disabled={!newParticipant.studentId || (newParticipant.role === 'Other' && !newParticipant.customRole)}
              onClick={handleAddParticipant}
              className="flex-1 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Підтвердити
            </button>
          </div>
        </div>
      </Modal>

      {/* Save Confirmation Modal */}
      <Modal isOpen={isSaveConfirmModalOpen} onClose={() => setIsSaveConfirmModalOpen(false)}>
        <div className="p-6 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Підтвердження збереження</h3>
            <p className="text-gray-500">Ви впевнені, що хочете зберегти цей захід з усіма учасниками?</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => setIsSaveConfirmModalOpen(false)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Скасувати
            </button>
            <button 
              onClick={confirmSave}
              disabled={saveTimer > 0}
              className={`px-8 py-2.5 rounded-lg font-bold text-white shadow-md transition flex items-center gap-2 ${
                saveTimer > 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saveTimer > 0 ? `Зберегти (${saveTimer}с)` : 'Зберегти'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default EventForm
