'use client'

import React, { useState, useEffect, useCallback } from 'react'
import DataTable from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { getCookie } from '@/services/cookie-servies'
import { USER_PROFLE } from '@/constants/cookies'
import {
  sgService,
  SubDivisionUser,
  SgRefItem,
  EventDto,
  InventorySg,
  AccountingJournal,
  StudentSg,
  RegulationStandard,
  StudentPoints,
} from '@/services/sgService'

type Tab = 'MyScores' | 'Events' | 'Inventory' | 'Journal' | 'Standards'

const AdditionalScoresPage = () => {
  const [tab, setTab] = useState<Tab>('MyScores')

  // My Scores / Standards
  const [studentId, setStudentId] = useState<string>('')
  const [points, setPoints] = useState<StudentPoints | null>(null)
  const [standards, setStandards] = useState<RegulationStandard[]>([])
  const [standardsSearch, setStandardsSearch] = useState('')

  const [subdivisions, setSubdivisions] = useState<SubDivisionUser[]>([])
  const [subdivisionId, setSubdivisionId] = useState<string>('')
  const [catalogYears, setCatalogYears] = useState<SgRefItem[]>([])
  const [catalogYearId, setCatalogYearId] = useState<string>('')
  const [isEven, setIsEven] = useState(false)

  const [students, setStudents] = useState<StudentSg[]>([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Events
  const [events, setEvents] = useState<EventDto[]>([])
  const [eventSearch, setEventSearch] = useState('')

  // Inventory
  const [inventory, setInventory] = useState<InventorySg[]>([])
  const [inventorySearch, setInventorySearch] = useState('')
  const [invModalOpen, setInvModalOpen] = useState(false)
  const [invEditId, setInvEditId] = useState<string | null>(null)
  const [invForm, setInvForm] = useState({ inventoryName: '', inventoryCode: '', watchmanId: '' })

  // Journal
  const [journalInventoryId, setJournalInventoryId] = useState<string>('')
  const [journal, setJournal] = useState<AccountingJournal[]>([])
  const [journalModalOpen, setJournalModalOpen] = useState(false)
  const [journalForm, setJournalForm] = useState({ studentId: '', startDate: '', endDate: '', comment: '' })

  const flash = (msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 4000)
  }

  useEffect(() => {
    const raw = getCookie(USER_PROFLE)
    if (raw) {
      try { setStudentId(String(JSON.parse(raw).id)) } catch { /* ignore */ }
    }
    const load = async () => {
      try {
        const [subs, years] = await Promise.all([
          sgService.getUserSubDivisions(),
          sgService.getCatalogYears(),
        ])
        setSubdivisions(subs)
        setCatalogYears(years)
        if (subs.length) setSubdivisionId(subs[0].subDivisionId)
        if (years.length) setCatalogYearId(years[0].id)
      } catch (e: any) {
        setError(e?.message || 'Не вдалося завантажити дані')
      }
    }
    load()
  }, [])

  const loadPoints = useCallback(async (id: string) => {
    if (!id) return
    setLoading(true)
    try {
      setPoints(await sgService.getStudentPoints(id))
    } catch {
      setPoints(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadStandards = useCallback(async () => {
    setLoading(true)
    try {
      setStandards(await sgService.getRegulationStandards())
    } catch {
      setStandards([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!subdivisionId) return
    sgService.getStudentsInSg(subdivisionId).then(setStudents).catch(() => setStudents([]))
  }, [subdivisionId])

  const loadEvents = useCallback(async () => {
    if (!subdivisionId || !catalogYearId) return
    setLoading(true)
    setError(null)
    try {
      setEvents(await sgService.getEvents(subdivisionId, catalogYearId, isEven, undefined, eventSearch))
    } catch (e: any) {
      setError(e?.message || 'Не вдалося завантажити заходи')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [subdivisionId, catalogYearId, isEven, eventSearch])

  const loadInventory = useCallback(async () => {
    setLoading(true)
    try {
      setInventory(await sgService.getInventory(inventorySearch))
    } catch {
      setInventory([])
    } finally {
      setLoading(false)
    }
  }, [inventorySearch])

  const loadJournal = useCallback(async (inventoryId: string) => {
    if (!inventoryId) { setJournal([]); return }
    setLoading(true)
    try {
      setJournal(await sgService.getJournal(inventoryId))
    } catch {
      setJournal([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'Events') loadEvents()
    else if (tab === 'Inventory' || tab === 'Journal') loadInventory()
    else if (tab === 'MyScores') loadPoints(studentId)
    else if (tab === 'Standards') loadStandards()
  }, [tab, studentId, loadEvents, loadInventory, loadPoints, loadStandards])

  const studentLabel = (id: string) => {
    const s = students.find((x) => x.id === id)
    return s ? `${s.groupName} · ${s.facultyName}` : id
  }

  // ----- Events handlers -----
  const deleteEvent = async (id: string) => {
    try {
      await sgService.deleteEvent(id)
      setEvents((prev) => prev.filter((e) => e.idEvent !== id))
      flash('Захід видалено')
    } catch (e: any) {
      flash(e?.response?.data || 'Не вдалося видалити захід')
    }
  }

  // ----- Inventory handlers -----
  const openAddInventory = () => {
    setInvEditId(null)
    setInvForm({ inventoryName: '', inventoryCode: '', watchmanId: students[0]?.id || '' })
    setInvModalOpen(true)
  }
  const openEditInventory = (item: InventorySg) => {
    setInvEditId(item.idInventory)
    setInvForm({ inventoryName: item.inventoryName, inventoryCode: item.inventoryCode, watchmanId: item.watchmanId })
    setInvModalOpen(true)
  }
  const saveInventory = async () => {
    try {
      const dto = { ...invForm, avail: true }
      if (invEditId) await sgService.updateInventory(invEditId, dto)
      else await sgService.addInventory(dto)
      setInvModalOpen(false)
      flash('Збережено')
      loadInventory()
    } catch (e: any) {
      flash(e?.response?.data || 'Не вдалося зберегти')
    }
  }
  const deleteInventory = async (id: string) => {
    try {
      await sgService.deleteInventory(id)
      setInventory((prev) => prev.filter((i) => i.idInventory !== id))
      flash('Видалено')
    } catch (e: any) {
      flash(e?.response?.data || 'Не вдалося видалити')
    }
  }

  // ----- Journal handlers -----
  const openAddJournal = () => {
    setJournalForm({ studentId: students[0]?.id || '', startDate: new Date().toISOString().slice(0, 10), endDate: '', comment: '' })
    setJournalModalOpen(true)
  }
  const saveJournal = async () => {
    if (!journalInventoryId) return
    try {
      await sgService.addJournalEntry({
        inventorySgid: journalInventoryId,
        studentId: journalForm.studentId,
        startDate: journalForm.startDate,
        endDate: journalForm.endDate,
        comment: journalForm.comment || undefined,
      })
      setJournalModalOpen(false)
      flash('Запис додано')
      loadJournal(journalInventoryId)
    } catch (e: any) {
      flash(e?.response?.data || 'Не вдалося додати запис')
    }
  }
  const confirmReturn = async (id: string) => {
    try {
      await sgService.confirmReturn(id)
      flash('Повернення підтверджено')
      loadJournal(journalInventoryId)
    } catch (e: any) {
      flash(e?.response?.data || 'Не вдалося підтвердити')
    }
  }

  const eventColumns = [
    { header: 'Назва заходу', accessor: 'nameEvent' as const },
    { header: 'Дата', accessor: 'date' as const },
    { header: 'Місце', accessor: 'location' as const },
    { header: 'Формат', accessor: 'format' as const },
  ]
  const inventoryColumns = [
    { header: 'Назва', accessor: 'inventoryName' as const },
    { header: 'Інв. номер', accessor: 'inventoryCode' as const },
    { header: 'Відповідальний', accessor: 'watchmanLabel' as const },
  ]

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#f4f6f8]">
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Додаткові бали</h2>
        </div>
        <nav className="p-4 space-y-1.5">
          {(['MyScores', 'Events', 'Inventory', 'Journal', 'Standards'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {t === 'MyScores' ? 'Мої бали' : t === 'Events' ? 'Заходи' : t === 'Inventory' ? 'Інвентар' : t === 'Journal' ? 'Журнал' : 'Нормативи'}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Підрозділ</label>
            <select
              value={subdivisionId}
              onChange={(e) => setSubdivisionId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            >
              {subdivisions.map((s) => (
                <option key={s.subDivisionId} value={s.subDivisionId}>{s.nameDivision}</option>
              ))}
            </select>
          </div>
        </div>
      </aside>

      <main className="flex-grow p-6 overflow-auto">
        {notice && <div className="mb-4 px-4 py-2 rounded bg-blue-50 text-blue-700 text-sm border border-blue-200">{notice}</div>}
        {error && <div className="mb-4 px-4 py-2 rounded bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

        {tab === 'MyScores' && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Додаткові бали</h3>
              <span className="text-xl font-extrabold text-blue-600">{points?.total ?? 0} балів</span>
            </div>
            {loading ? (
              <div className="p-6 text-gray-500 text-sm">Завантаження…</div>
            ) : !points || points.items.length === 0 ? (
              <div className="p-6 text-gray-500 italic text-sm">Немає нарахованих балів</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Захід</th>
                    <th className="px-4 py-2 text-left">Вид діяльності</th>
                    <th className="px-4 py-2 text-left">Роль</th>
                    <th className="px-4 py-2 text-left">Дата</th>
                    <th className="px-4 py-2 text-left">Бали</th>
                  </tr>
                </thead>
                <tbody>
                  {points.items.map((it) => (
                    <tr key={it.eventId + it.roleName} className="border-t hover:bg-blue-50/40">
                      <td className="px-4 py-2">{it.eventName}</td>
                      <td className="px-4 py-2">{it.activityType || '—'}</td>
                      <td className="px-4 py-2">{it.roleName}</td>
                      <td className="px-4 py-2">{it.date}</td>
                      <td className="px-4 py-2 font-bold text-blue-600">{it.point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'Standards' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <input
                type="text"
                placeholder="Пошук нормативу…"
                value={standardsSearch}
                onChange={(e) => setStandardsSearch(e.target.value)}
                className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-6 text-gray-500 text-sm">Завантаження…</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Код</th>
                      <th className="px-4 py-2 text-left">Вид діяльності</th>
                      <th className="px-4 py-2 text-left">Підкатегорія</th>
                      <th className="px-4 py-2 text-left">Мін.</th>
                      <th className="px-4 py-2 text-left">Макс.</th>
                      <th className="px-4 py-2 text-left">Примітки</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standards
                      .filter((s) =>
                        !standardsSearch ||
                        s.type.toLowerCase().includes(standardsSearch.toLowerCase()) ||
                        (s.subType || '').toLowerCase().includes(standardsSearch.toLowerCase()) ||
                        s.code.toLowerCase().includes(standardsSearch.toLowerCase()),
                      )
                      .map((s) => (
                        <tr key={s.id} className="border-t hover:bg-blue-50/40">
                          <td className="px-4 py-2 font-mono text-xs">{s.code}</td>
                          <td className="px-4 py-2">{s.type}</td>
                          <td className="px-4 py-2">{s.subType || '—'}</td>
                          <td className="px-4 py-2">{s.amountMin}</td>
                          <td className="px-4 py-2">{s.amountMax}</td>
                          <td className="px-4 py-2 text-gray-500">{s.notes || '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === 'Events' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-gray-600">Рік:</label>
                <select value={catalogYearId} onChange={(e) => setCatalogYearId(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                  {catalogYears.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <input type="checkbox" checked={isEven} onChange={(e) => setIsEven(e.target.checked)} className="h-4 w-4" />
                Парний семестр
              </label>
              <input
                type="text"
                placeholder="Пошук заходу…"
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadEvents()}
                className="flex-1 min-w-[200px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button onClick={loadEvents} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200">Оновити</button>
              <button onClick={() => window.open('/additional-scores/add-event', '_blank')} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 text-sm">+ Додати захід</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? <div className="p-6 text-gray-500 text-sm">Завантаження…</div> : (
                <DataTable
                  columns={eventColumns as any}
                  data={events}
                  isActionEnabled={true}
                  showDeleteAction={true}
                  onDelete={(item: any) => deleteEvent(item.idEvent)}
                />
              )}
            </div>
          </div>
        )}

        {tab === 'Inventory' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <input
                type="text"
                placeholder="Пошук інвентарю…"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadInventory()}
                className="flex-1 min-w-[200px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button onClick={loadInventory} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200">Оновити</button>
              <button onClick={openAddInventory} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 text-sm">+ Додати предмет</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? <div className="p-6 text-gray-500 text-sm">Завантаження…</div> : (
                <DataTable
                  columns={inventoryColumns as any}
                  data={inventory.map((i) => ({ ...i, watchmanLabel: studentLabel(i.watchmanId) }))}
                  isActionEnabled={true}
                  showDeleteAction={true}
                  onEdit={(item: any) => openEditInventory(item)}
                  onDelete={(item: any) => deleteInventory(item.idInventory)}
                />
              )}
            </div>
          </div>
        )}

        {tab === 'Journal' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 flex-1">
                <label className="text-sm font-bold text-gray-600">Предмет:</label>
                <select
                  value={journalInventoryId}
                  onChange={(e) => { setJournalInventoryId(e.target.value); loadJournal(e.target.value) }}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Оберіть предмет…</option>
                  {inventory.map((i) => <option key={i.idInventory} value={i.idInventory}>{i.inventoryName} ({i.inventoryCode})</option>)}
                </select>
              </div>
              <button onClick={openAddJournal} disabled={!journalInventoryId} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 text-sm disabled:opacity-50">+ Видати</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {!journalInventoryId ? (
                <div className="p-6 text-gray-500 text-sm italic">Оберіть предмет для перегляду журналу</div>
              ) : journal.length === 0 ? (
                <div className="p-6 text-gray-500 text-sm italic">Немає записів</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Студент</th>
                      <th className="px-4 py-2 text-left">Видано</th>
                      <th className="px-4 py-2 text-left">Повернути до</th>
                      <th className="px-4 py-2 text-left">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journal.map((j) => (
                      <tr key={j.idAccountingJournal} className="border-t hover:bg-blue-50/40">
                        <td className="px-4 py-2">{studentLabel(j.studentId)}</td>
                        <td className="px-4 py-2">{j.startDate}</td>
                        <td className="px-4 py-2">{j.endDate}</td>
                        <td className="px-4 py-2">
                          {j.isBack ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">Повернуто {j.realBackTime || ''}</span>
                          ) : (
                            <button onClick={() => confirmReturn(j.idAccountingJournal)} className="px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded text-xs font-bold">Підтвердити повернення</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Inventory modal */}
      <Modal isOpen={invModalOpen} onClose={() => setInvModalOpen(false)}>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">{invEditId ? 'Редагувати предмет' : 'Додати предмет'}</h3>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Назва:</label>
            <textarea value={invForm.inventoryName} onChange={(e) => setInvForm({ ...invForm, inventoryName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[80px]" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Інвентарний номер:</label>
            <input value={invForm.inventoryCode} onChange={(e) => setInvForm({ ...invForm, inventoryCode: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Відповідальна особа (студент підрозділу):</label>
            <select value={invForm.watchmanId} onChange={(e) => setInvForm({ ...invForm, watchmanId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm">
              <option value="">Оберіть…</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.groupName} · {s.facultyName}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setInvModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50">Скасувати</button>
            <button onClick={saveInventory} disabled={!invForm.inventoryName || !invForm.inventoryCode || !invForm.watchmanId} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 disabled:opacity-50">{invEditId ? 'Зберегти' : 'Додати'}</button>
          </div>
        </div>
      </Modal>

      {/* Journal modal */}
      <Modal isOpen={journalModalOpen} onClose={() => setJournalModalOpen(false)}>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Видача інвентарю</h3>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Студент:</label>
            <select value={journalForm.studentId} onChange={(e) => setJournalForm({ ...journalForm, studentId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm">
              <option value="">Оберіть…</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.groupName} · {s.facultyName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Дата видачі:</label>
              <input type="date" value={journalForm.startDate} onChange={(e) => setJournalForm({ ...journalForm, startDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Повернути до:</label>
              <input type="date" value={journalForm.endDate} onChange={(e) => setJournalForm({ ...journalForm, endDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Коментар:</label>
            <input value={journalForm.comment} onChange={(e) => setJournalForm({ ...journalForm, comment: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setJournalModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50">Скасувати</button>
            <button onClick={saveJournal} disabled={!journalForm.studentId || !journalForm.startDate || !journalForm.endDate} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 disabled:opacity-50">Видати</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdditionalScoresPage
