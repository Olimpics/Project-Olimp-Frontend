'use client'

import React, { useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import {
  SubDivisionUser,
  StudentSg,
  SgRefItem,
  EventCreateUpdate,
} from '@/services/sgService'

export interface ParticipantInput {
  rowId: number
  studentId: string
  studentLabel: string
  roleId: string
  roleLabel: string
  point: number
  otherOption?: string
}

interface EventFormProps {
  subdivisions: SubDivisionUser[]
  catalogYears: SgRefItem[]
  regulations: SgRefItem[]
  roles: SgRefItem[]
  students: StudentSg[]
  onSubdivisionChange: (subDivisionId: string) => void
  onSave: (dto: EventCreateUpdate, participants: ParticipantInput[]) => Promise<void>
  onCancel?: () => void
}

const EventForm: React.FC<EventFormProps> = ({
  subdivisions,
  catalogYears,
  regulations,
  roles,
  students,
  onSubdivisionChange,
  onSave,
  onCancel,
}) => {
  const [form, setForm] = useState({
    name: '',
    date: '',
    format: 'Offline',
    venue: '',
    subdivisionId: '',
    catalogYearId: '',
    regulationId: '',
    isEven: false,
  })

  const [participants, setParticipants] = useState<ParticipantInput[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false)
  const [participantForm, setParticipantForm] = useState({
    studentId: '',
    roleId: '',
    point: 0,
    otherOption: '',
  })
  const [studentSearch, setStudentSearch] = useState('')

  const participantColumns = [
    { header: '№', accessor: 'rowId' as const },
    { header: 'Студент', accessor: 'studentLabel' as const },
    { header: 'Роль', accessor: 'roleLabel' as const },
    { header: 'Бали', accessor: 'point' as const },
  ]

  const isFormValid =
    form.name.trim() !== '' &&
    form.date !== '' &&
    form.venue.trim() !== '' &&
    form.subdivisionId !== '' &&
    form.catalogYearId !== '' &&
    form.regulationId !== '' &&
    participants.length > 0

  const setSubdivision = (id: string) => {
    setForm((f) => ({ ...f, subdivisionId: id }))
    onSubdivisionChange(id)
  }

  const addParticipant = () => {
    const student = students.find((s) => s.id === participantForm.studentId)
    const role = roles.find((r) => r.id === participantForm.roleId)
    if (!student || !role) return
    setParticipants((prev) => [
      ...prev,
      {
        rowId: prev.length > 0 ? Math.max(...prev.map((p) => p.rowId)) + 1 : 1,
        studentId: student.id,
        studentLabel: `${student.groupName} · ${student.facultyName}`,
        roleId: role.id,
        roleLabel: role.name,
        point: Number(participantForm.point) || 0,
        otherOption: participantForm.otherOption || undefined,
      },
    ])
    setIsParticipantModalOpen(false)
  }

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      const subdivision = subdivisions.find((s) => s.subDivisionId === form.subdivisionId)
      const dto: EventCreateUpdate = {
        nameEvent: form.name.trim(),
        date: form.date,
        location: form.venue.trim(),
        format: form.format,
        subdivisionSgid: form.subdivisionId,
        regulationId: form.regulationId,
        avail: true,
        facultyId: subdivision?.facultyId || '00000000-0000-0000-0000-000000000000',
        catalogYearId: form.catalogYearId,
        isEven: form.isEven,
      }
      await onSave(dto, participants)
    } catch (e: any) {
      setError(e?.response?.data || e?.message || 'Не вдалося зберегти захід')
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.groupName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.facultyName.toLowerCase().includes(studentSearch.toLowerCase()),
  )

  return (
    <div className="flex-1 p-6 overflow-auto bg-[#f4f6f8]">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Інформація про захід</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">Назва заходу:</label>
              <textarea
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Введіть повну назву заходу..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Дата проведення:</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Формат:</label>
              <select
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="Offline">Офлайн</option>
                <option value="Online">Онлайн</option>
                <option value="Mixed">Змішаний</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">Місце проведення:</label>
              <textarea
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="Вкажіть місце проведення або посилання..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Підрозділ:</label>
              <select
                value={form.subdivisionId}
                onChange={(e) => setSubdivision(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Оберіть підрозділ...</option>
                {subdivisions.map((s) => (
                  <option key={s.subDivisionId} value={s.subDivisionId}>{s.nameDivision}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Навчальний рік:</label>
              <select
                value={form.catalogYearId}
                onChange={(e) => setForm({ ...form, catalogYearId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Оберіть рік...</option>
                {catalogYears.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Положення (норматив):</label>
              <select
                value={form.regulationId}
                onChange={(e) => setForm({ ...form, regulationId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Оберіть положення...</option>
                {regulations.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 mt-7">
              <input
                id="isEven"
                type="checkbox"
                checked={form.isEven}
                onChange={(e) => setForm({ ...form, isEven: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="isEven" className="text-sm font-medium text-gray-700">Парний (весняний) семестр</label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800">Список учасників</h3>
            <button
              onClick={() => {
                setParticipantForm({ studentId: '', roleId: '', point: 0, otherOption: '' })
                setStudentSearch('')
                setIsParticipantModalOpen(true)
              }}
              disabled={!form.subdivisionId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md text-sm font-bold disabled:opacity-50"
            >
              + Додати
            </button>
          </div>
          <DataTable
            columns={participantColumns as any}
            data={participants}
            emptyMessage="Список учасників порожній..."
            isActionEnabled={true}
            showDeleteAction={true}
            onDelete={(item: any) => setParticipants((prev) => prev.filter((p) => p.rowId !== item.rowId))}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{String(error)}</div>
        )}

        <div className="flex justify-end gap-4 pb-12">
          <button
            onClick={() => (onCancel ? onCancel() : window.close())}
            className="px-8 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 transition shadow-sm"
          >
            Скасувати
          </button>
          <button
            disabled={!isFormValid || saving}
            onClick={submit}
            className="px-12 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Збереження…' : 'Зберегти'}
          </button>
        </div>
      </div>

      <Modal isOpen={isParticipantModalOpen} onClose={() => setIsParticipantModalOpen(false)}>
        <div className="space-y-5 p-2">
          <h3 className="text-xl font-bold text-gray-900 text-center">Додати учасника</h3>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Студент (підрозділу):</label>
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Фільтр за групою / факультетом..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
            />
            <select
              value={participantForm.studentId}
              onChange={(e) => setParticipantForm({ ...participantForm, studentId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              size={5}
            >
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.groupName} · {s.facultyName} ({s.roleInSg})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Роль:</label>
              <select
                value={participantForm.roleId}
                onChange={(e) => setParticipantForm({ ...participantForm, roleId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              >
                <option value="">Оберіть роль...</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Бали:</label>
              <input
                type="number"
                value={participantForm.point}
                onChange={(e) => setParticipantForm({ ...participantForm, point: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>
          </div>

          <div className="flex w-full gap-4 pt-2">
            <button
              onClick={() => setIsParticipantModalOpen(false)}
              className="flex-1 px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Скасувати
            </button>
            <button
              disabled={!participantForm.studentId || !participantForm.roleId}
              onClick={addParticipant}
              className="flex-1 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              Підтвердити
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default EventForm
