'use client'

import React, { useState, useEffect } from 'react'
import DataTable from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import EventForm from '@/components/additional-scores/EventForm'

interface ScoreEntry {
  id: number
  activityType: string
  date: string
  score: number
}

interface EventEntry {
  id: number
  title: string
  article: string
  type: 'Online' | 'Offline'
  date: string
}

interface ParticipantEntry {
  id: number
  fullName: string
  faculty: string
  group: string
  role: string
}

const AdditionalScoresPage = () => {
  const [activeTab, setActiveTab] = useState<'My Scores' | 'Structure' | 'Standards' | 'Inventory'>('My Scores')
  const [selectedCommittee, setSelectedCommittee] = useState('КМК РС ДНУ')
  const [structureSubTab, setStructureSubTab] = useState<'Events' | 'List'>('Events')
  const [inventorySubTab, setInventorySubTab] = useState<'Accounting' | 'Journal'>('Accounting')
  
  // Event adding state
  const [isAddingEvent, setIsAddingEvent] = useState(false)

  // Standards state
  const [standardsSearchQuery, setStandardsSearchQuery] = useState('')
  const [standardsCategoryFilter, setStandardsCategoryFilter] = useState('Всі')
  const [standardsPage, setStandardsPage] = useState(1)
  const itemsPerPage = 5

  const committees = ['КМК РС ДНУ', 'КМК РС ФПМІТ']
  
  // Inventory state
  const [inventorySearchQuery, setInventorySearchQuery] = useState('')
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [responsibleSearch, setResponsibleSearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Journal state
  const [journalSearchQuery, setJournalSearchQuery] = useState('')
  const [journalStartDate, setJournalStartDate] = useState('')
  const [journalEndDate, setJournalEndDate] = useState('')
  const [isJournalAddModalOpen, setIsJournalAddModalOpen] = useState(false)
  const [isReturnConfirmModalOpen, setIsReturnConfirmModalOpen] = useState(false)
  const [returnConfirmId, setReturnConfirmId] = useState<number | null>(null)
  const [returnTimer, setReturnTimer] = useState(0)
  
  const [journalForm, setJournalForm] = useState({
    inventoryId: null as number | null,
    studentId: null as number | null,
    startDate: '',
    endDate: ''
  })
  const [journalStudentSearch, setJournalStudentSearch] = useState('')
  const [isJournalStudentDropdownOpen, setIsJournalStudentDropdownOpen] = useState(false)

  // Form state for inventory
  const [inventoryForm, setInventoryForm] = useState({
    title: '',
    inventoryNumber: '',
    responsiblePersonId: null as number | null
  })

  // "My Scores" filters
  const [selectedCourse, setSelectedCourse] = useState<number>(1)
  const [selectedSemester, setSelectedSemester] = useState<number>(1)

  // "Structure" filters
  const [selectedYear, setSelectedYear] = useState('2023-2024')
  const [eventSemester, setEventSemester] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [facultyFilter, setFacultyFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteTimer, setDeleteTimer] = useState(0)
  
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantEntry | null>(null)
  const [newRole, setNewRole] = useState('')

  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false)
  const [addParticipantData, setAddParticipantData] = useState({ studentId: '', role: '' })

  // Mock data
  const mockStudents = [
    { id: 1, fullName: 'Коваленко Ганна Олександрівна', group: 'КН-31', department: 'Кафедра комп’ютерних наук' },
    { id: 2, fullName: 'Петренко Олександр Миколайович', group: 'МЕН-21', department: 'Кафедра менеджменту' },
    { id: 3, fullName: 'Сидоренко Іван Васильович', group: 'ПІ-41', department: 'Кафедра програмної інженерії' },
  ]

  const mockInventory = [
    { id: 1, title: 'Комплект звукового обладнання для проведення масових заходів у актовій залі', inventoryNumber: 'INV-001234', responsiblePerson: 'Коваленко Г.О.', responsiblePersonId: 1 },
    { id: 2, title: 'Проектор мультимедійний Epson EB-X06 високої чіткості для презентацій', inventoryNumber: 'INV-005678', responsiblePerson: 'Петренко О.М.', responsiblePersonId: 2 },
    { id: 3, title: 'Стіл розкладний для виїзних конференцій та студентських форумів', inventoryNumber: 'INV-009012', responsiblePerson: 'Сидоренко І.В.', responsiblePersonId: 3 },
  ]

  const [mockJournal, setMockJournal] = useState([
    { id: 1, inventoryName: 'Проектор мультимедійний Epson EB-X06', studentName: 'Коваленко Г.О.', startDate: '2025-04-10', endDate: '2025-04-12', returned: true, returnDate: '2025-04-12' },
    { id: 2, inventoryName: 'Стіл розкладний для конференцій', studentName: 'Петренко О.М.', startDate: '2025-04-20', endDate: '2025-04-25', returned: false, returnDate: null },
    { id: 3, inventoryName: 'Комплект звукового обладнання', studentName: 'Сидоренко І.В.', startDate: '2025-04-28', endDate: '2025-04-30', returned: false, returnDate: null },
  ])

  const inventoryColumns = [
    { header: '№', accessor: 'id' as const },
    { header: 'Назва', accessor: 'title' as const },
    { header: 'Інвентарний номер', accessor: 'inventoryNumber' as const },
    { header: 'ПІБ відповідальної особи', accessor: 'responsiblePerson' as const },
  ]

  const journalColumns = [
    { header: '№', accessor: 'id' as const },
    { header: 'Назва інвентарю', accessor: 'inventoryName' as const },
    { header: 'Студент, який взяв', accessor: 'studentName' as const },
    { header: 'Дата взяття', accessor: 'startDate' as const },
    { header: 'Дата повернення', accessor: 'endDate' as const },
    { 
      header: 'Повернуто', 
      accessor: 'returned' as const,
      cell: (item: any) => (
        item.returned ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Повернуто ({item.returnDate})
          </span>
        ) : (
          <button 
            onClick={() => handleReturnClick(item.id)}
            className="px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded text-xs font-bold transition-colors"
          >
            Підтвердити
          </button>
        )
      )
    },
  ]

  const mockScores: ScoreEntry[] = [
    { id: 1, activityType: 'Наукова робота', date: '12.10.2025', score: 10 },
    { id: 2, activityType: 'Участь у конференції', date: '15.11.2025', score: 5 },
    { id: 3, activityType: 'Спортивні досягнення', date: '20.12.2025', score: 8 },
  ]

  const mockEvents: EventEntry[] = [
    { id: 1, title: 'Всеукраїнська олімпіада', article: 'Ст. 12 п. 1', type: 'Offline', date: '10.05.2024' },
    { id: 2, title: 'Вебінар з ШІ', article: 'Ст. 5 п. 3', type: 'Online', date: '15.06.2024' },
    { id: 3, title: 'Студентська конференція', article: 'Ст. 8 п. 2', type: 'Offline', date: '20.09.2024' },
  ]

  const mockParticipants: ParticipantEntry[] = [
    { id: 1, fullName: 'Коваленко Ганна Олександрівна', faculty: 'ФІТ', group: 'КН-31', role: 'Організатор' },
    { id: 2, fullName: 'Петренко Олександр Миколайович', faculty: 'ФЕМ', group: 'МЕН-21', role: 'Учасник' },
    { id: 3, fullName: 'Сидоренко Іван Васильович', faculty: 'ФІТ', group: 'ПІ-41', role: 'Волонтер' },
  ]

  const mockStandardsData = [
    { id: 1, block: '1. ПЕРШОЧЕРГОВІ ДОСЯГНЕННЯ', category: 'Навчання', subcategory: 'Середній бал 5.0', min: 0, max: 10, confirmation: 'Витяг з реєстру' },
    { id: 2, block: '1. ПЕРШОЧЕРГОВІ ДОСЯГНЕННЯ', category: 'Навчання', subcategory: 'Середній бал 4.5-4.9', min: 0, max: 5, confirmation: 'Витяг з реєстру' },
    { id: 3, block: '2. НАУКОВІ, НАУКОВО-ТЕХНІЧНІ, ТВОРЧІ ДОСЯГНЕННЯ', category: 'Наука', subcategory: 'Публікація у фаховому виданні', min: 5, max: 15, confirmation: 'Копія статті' },
    { id: 4, block: '2. НАУКОВІ, НАУКОВО-ТЕХНІЧНІ, ТВОРЧІ ДОСЯГНЕННЯ', category: 'Мистецтво', subcategory: 'Перемога у творчому конкурсі', min: 3, max: 10, confirmation: 'Диплом' },
    { id: 5, block: '3. РОБОТА В ОРГАНАХ СТУДЕНТСЬКОГО САМОВРЯДУВАННЯ ТА ГУРТОЖИТКАХ УНІВЕРСИТЕТУ', category: 'Самоврядування', subcategory: 'Голова ради студентів', min: 10, max: 20, confirmation: 'Наказ' },
    { id: 6, block: '3. РОБОТА В ОРГАНАХ СТУДЕНТСЬКОГО САМОВРЯДУВАННЯ ТА ГУРТОЖИТКАХ УНІВЕРСИТЕТУ', category: 'Самоврядування', subcategory: 'Староста поверху', min: 2, max: 5, confirmation: 'Протокол' },
  ]

  const filteredStandards = mockStandardsData.filter(item => {
    const matchesSearch = item.subcategory.toLowerCase().includes(standardsSearchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(standardsSearchQuery.toLowerCase())
    const matchesCategory = standardsCategoryFilter === 'Всі' || item.category === standardsCategoryFilter
    return matchesSearch && matchesCategory
  })

  const totalScore = mockScores.reduce((acc, curr) => acc + curr.score, 0)

  const scoreColumns = [
    { header: '№', accessor: 'id' as const },
    { header: 'Вид діяльності', accessor: 'activityType' as const },
    { header: 'Дата', accessor: 'date' as const },
    { header: 'Бали', accessor: 'score' as const },
  ]

  const eventColumns = [
    { header: '№', accessor: 'id' as const },
    { header: 'Назва заходу', accessor: 'title' as const },
    { header: 'Стаття', accessor: 'article' as const },
    { header: 'Тип заходу', accessor: 'type' as const },
    { header: 'Дата', accessor: 'date' as const },
  ]

  const participantColumns = [
    { header: '№', accessor: 'id' as const },
    { header: 'ПІБ', accessor: 'fullName' as const },
    { header: 'Факультет', accessor: 'faculty' as const },
    { header: 'Група', accessor: 'group' as const },
    { header: 'Роль', accessor: 'role' as const },
  ]

  const standardColumns = [
    { header: '№', accessor: 'id' as const },
    { header: 'Категорія', accessor: 'category' as const },
    { header: 'Підкатегорія', accessor: 'subcategory' as const },
    { header: 'Мін. бал', accessor: 'min' as const },
    { header: 'Макс. бал', accessor: 'max' as const },
    { header: 'Підтвердження', accessor: 'confirmation' as const },
  ]

  const courses = [1, 2, 3, 4]
  const semesters = [1, 2]
  const years = ['2022-2023', '2023-2024', '2024-2025']
  const faculties = ['All', 'ФІТ', 'ФЕМ', 'ФЛК']
  const roles = ['All', 'Організатор', 'Учасник', 'Волонтер']
  const standardsCategories = ['Всі', ...Array.from(new Set(mockStandardsData.map(i => i.category)))]

  // Delete confirmation logic
  const handleDeleteClick = (id: number) => {
    setDeleteId(id)
    setDeleteTimer(5)
    setIsDeleteModalOpen(true)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isDeleteModalOpen && deleteTimer > 0) {
      interval = setInterval(() => {
        setDeleteTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isDeleteModalOpen, deleteTimer])

  const confirmDelete = () => {
    if (deleteTimer === 0) {
      console.log('Deleted item:', deleteId)
      setIsDeleteModalOpen(false)
    }
  }

  const handleEditParticipant = (participant: ParticipantEntry) => {
    setSelectedParticipant(participant)
    setNewRole(participant.role)
    setIsRoleModalOpen(true)
  }

  const handleAddInventory = () => {
    setIsEditMode(false)
    setInventoryForm({ title: '', inventoryNumber: '', responsiblePersonId: null })
    setResponsibleSearch('')
    setIsInventoryModalOpen(true)
  }

  const handleEditInventory = (item: any) => {
    setIsEditMode(true)
    setEditingItem(item)
    const student = mockStudents.find(s => s.id === item.responsiblePersonId)
    setInventoryForm({
      title: item.title,
      inventoryNumber: item.inventoryNumber,
      responsiblePersonId: item.responsiblePersonId
    })
    setResponsibleSearch(student?.fullName || '')
    setIsInventoryModalOpen(true)
  }

  const selectedStudent = mockStudents.find(s => s.id === inventoryForm.responsiblePersonId)

  // Journal handlers
  const handleReturnClick = (id: number) => {
    setReturnConfirmId(id)
    setReturnTimer(5)
    setIsReturnConfirmModalOpen(true)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isReturnConfirmModalOpen && returnTimer > 0) {
      interval = setInterval(() => {
        setReturnTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isReturnConfirmModalOpen, returnTimer])

  const confirmReturn = () => {
    if (returnTimer === 0 && returnConfirmId) {
      setMockJournal(prev => prev.map(item => 
        item.id === returnConfirmId 
          ? { ...item, returned: true, returnDate: new Date().toISOString().slice(0, 10) } 
          : item
      ))
      setIsReturnConfirmModalOpen(false)
    }
  }

  const handleAddJournalEntry = () => {
    setJournalForm({
      inventoryId: null,
      studentId: null,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: ''
    })
    setJournalStudentSearch('')
    setIsJournalAddModalOpen(true)
  }

  const saveJournalEntry = () => {
    const inventory = mockInventory.find(i => i.id === journalForm.inventoryId)
    const student = mockStudents.find(s => s.id === journalForm.studentId)
    
    if (inventory && student) {
      const newEntry = {
        id: mockJournal.length + 1,
        inventoryName: inventory.title,
        studentName: student.fullName,
        startDate: journalForm.startDate,
        endDate: journalForm.endDate,
        returned: false,
        returnDate: null
      }
      setMockJournal([newEntry, ...mockJournal])
      setIsJournalAddModalOpen(false)
    }
  }

  const filteredJournal = mockJournal.filter(item => {
    const matchesSearch = item.inventoryName.toLowerCase().includes(journalSearchQuery.toLowerCase())
    const matchesStartDate = !journalStartDate || item.startDate >= journalStartDate
    const matchesEndDate = !journalEndDate || item.startDate <= journalEndDate
    return matchesSearch && matchesStartDate && matchesEndDate
  })

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#f4f6f8] font-sans">
      {/* Left Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Додаткові бали</h2>
        </div>
        <nav className="flex-grow p-4 space-y-1.5">
          <button
            onClick={() => setActiveTab('My Scores')}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'My Scores' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            Мої бали
          </button>
          
          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Структура
          </div>
          {committees.map(committee => (
            <button
              key={committee}
              onClick={() => {
                setActiveTab('Structure')
                setSelectedCommittee(committee)
              }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'Structure' && selectedCommittee === committee ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {committee}
            </button>
          ))}

          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Нормативи
          </div>
          <button
            onClick={() => setActiveTab('Standards')}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'Standards' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            Таблиця нормативів
          </button>
          <button
            onClick={() => setActiveTab('Inventory')}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'Inventory' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            Інвентар
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {isAddingEvent ? (
          <EventForm 
            departments={faculties.filter(f => f !== 'All')}
            mockStudents={mockStudents}
            onCancel={() => setIsAddingEvent(false)}
            onSave={(data) => {
              console.log('Saved Event:', data)
              setIsAddingEvent(false)
            }}
          />
        ) : activeTab === 'My Scores' ? (
          <>
            {/* Top Selection Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                  {courses.map((course) => (
                    <button
                      key={course}
                      onClick={() => setSelectedCourse(course)}
                      className={`pb-1 px-4 text-sm font-semibold transition-colors duration-200 border-b-2 whitespace-nowrap ${
                        selectedCourse === course
                          ? 'text-blue-600 border-blue-600'
                          : 'text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {course} Курс
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg shrink-0">
                  {semesters.map((sem) => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`px-8 py-2 text-xs font-bold rounded-md transition-all ${
                        selectedSemester === sem
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {sem} СЕМЕСТР
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">Додаткові бали за семестр</h3>
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition active:scale-95 text-sm">
                    Сформувати рейтинговий список
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <DataTable
                    columns={scoreColumns as any}
                    data={mockScores}
                    isActionEnabled={false}
                  />
                  
                  {/* Total Row */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-700">Всього:</span>
                    <span className="text-xl font-extrabold text-blue-600">{totalScore} балів</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {activeTab === 'Structure' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Structure Top Bar (Tabs) */}
            <div className="bg-white border-b border-gray-200 px-6 pt-4 shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 pb-4">{selectedCommittee}</h2>
                <div className="flex space-x-8">
                  {['Events', 'List'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStructureSubTab(tab as any)}
                      className={`pb-4 text-sm font-semibold transition-all border-b-2 ${
                        structureSubTab === tab
                          ? 'text-blue-600 border-blue-600'
                          : 'text-gray-400 border-transparent hover:text-gray-600'
                      }`}
                    >
                      {tab === 'Events' ? 'Заходи' : 'Список'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-[1400px] mx-auto space-y-6">
                {structureSubTab === 'Events' ? (
                  <div className="space-y-4">
                    {/* Filters for Events */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-bold text-gray-600">Навчальний рік:</label>
                          <select 
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                          {semesters.map(s => (
                            <button
                              key={s}
                              onClick={() => setEventSemester(s)}
                              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                                eventSemester === s ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {s} СЕМЕСТР
                            </button>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsAddingEvent(true)}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition active:scale-95 text-sm"
                      >
                        + Додати захід
                      </button>
                    </div>

                    {/* Events Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <DataTable
                        columns={eventColumns as any}
                        data={mockEvents}
                        isActionEnabled={true}
                        onEdit={(item: any) => console.log('Edit event', item)}
                        onDelete={(item: any) => handleDeleteClick(item.id)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Filters and Search for List */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-grow max-w-md relative">
                          <input 
                            type="text" 
                            placeholder="Пошук учасників..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                          />
                          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-bold text-gray-600">Факультет:</label>
                          <select 
                            value={facultyFilter}
                            onChange={(e) => setFacultyFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm font-bold text-gray-600">Роль:</label>
                          <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                          <button 
                            onClick={() => setIsAddParticipantModalOpen(true)}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition active:scale-95 text-sm"
                          >
                            Додати учасника
                          </button>
                          <button className="p-2 bg-white text-gray-500 rounded-lg border border-gray-200 hover:bg-gray-50 transition shadow-sm" title="Експорт">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Participants Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <DataTable
                        columns={participantColumns as any}
                        data={mockParticipants}
                        isActionEnabled={true}
                        onEdit={(item: any) => handleEditParticipant(item as ParticipantEntry)}
                        onDelete={(item: any) => handleDeleteClick(item.id)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Standards' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Нормативи</h2>
            </div>
            
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-[1400px] mx-auto space-y-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
                  <div className="flex-grow max-w-md relative">
                    <input 
                      type="text" 
                      placeholder="Пошук нормативів..." 
                      value={standardsSearchQuery}
                      onChange={(e) => setStandardsSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-gray-600">Категорія:</label>
                    <select 
                      value={standardsCategoryFilter}
                      onChange={(e) => setStandardsCategoryFilter(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {standardsCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-8">
                  {(() => {
                    const paginatedStandards = filteredStandards.slice((standardsPage - 1) * itemsPerPage, standardsPage * itemsPerPage)
                    const blocksOnPage = Array.from(new Set(paginatedStandards.map(i => i.block)))
                    
                    if (paginatedStandards.length === 0) {
                      return (
                        <div className="bg-white p-10 text-center rounded-xl border border-gray-200 text-gray-500 font-medium">
                          За вашим запитом нічого не знайдено
                        </div>
                      )
                    }

                    return blocksOnPage.map(block => (
                      <div key={block} className="space-y-4">
                        <h3 className="text-lg font-bold text-blue-800 border-l-4 border-blue-600 pl-4 py-1 bg-blue-50 rounded-r-lg uppercase tracking-wide">
                          {block}
                        </h3>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <DataTable
                            columns={standardColumns as any}
                            data={paginatedStandards.filter(i => i.block === block)}
                            isActionEnabled={false}
                          />
                        </div>
                      </div>
                    ))
                  })()}
                  
                  {/* Pagination */}
                  {filteredStandards.length > 0 && (
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <span className="text-sm text-gray-500 font-medium">
                        Показано {Math.min(filteredStandards.length, (standardsPage - 1) * itemsPerPage + 1)} - {Math.min(filteredStandards.length, standardsPage * itemsPerPage)} із {filteredStandards.length}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setStandardsPage(p => Math.max(1, p - 1))}
                          disabled={standardsPage === 1}
                          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Назад
                        </button>
                        <button 
                          onClick={() => setStandardsPage(p => p + 1)}
                          disabled={standardsPage * itemsPerPage >= filteredStandards.length}
                          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Далі
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Inventory' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Inventory Top Bar (Tabs) */}
            <div className="bg-white border-b border-gray-200 px-6 pt-4 shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 pb-4">Інвентар</h2>
                <div className="flex space-x-8">
                  {['Accounting', 'Journal'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setInventorySubTab(tab as any)}
                      className={`pb-4 text-sm font-semibold transition-all border-b-2 ${
                        inventorySubTab === tab
                          ? 'text-blue-600 border-blue-600'
                          : 'text-gray-400 border-transparent hover:text-gray-600'
                      }`}
                    >
                      {tab === 'Accounting' ? 'Облік' : 'Журнал'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-[1400px] mx-auto space-y-6">
                {inventorySubTab === 'Accounting' ? (
                  <div className="space-y-4">
                    {/* Filters and Search for Inventory */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
                      <div className="flex-grow max-w-md relative">
                        <input 
                          type="text" 
                          placeholder="Пошук інвентарю за назвою чи номером..." 
                          value={inventorySearchQuery}
                          onChange={(e) => setInventorySearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <button 
                          onClick={handleAddInventory}
                          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition active:scale-95 text-sm"
                        >
                          + Додати предмет
                        </button>
                        <button className="p-2 bg-white text-gray-500 rounded-lg border border-gray-200 hover:bg-gray-50 transition shadow-sm" title="Експорт">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <DataTable
                        columns={inventoryColumns as any}
                        data={mockInventory.filter(i => 
                          i.title.toLowerCase().includes(inventorySearchQuery.toLowerCase()) || 
                          i.inventoryNumber.toLowerCase().includes(inventorySearchQuery.toLowerCase())
                        )}
                        isActionEnabled={true}
                        onEdit={(item: any) => handleEditInventory(item)}
                        onDelete={(item: any) => handleDeleteClick(item.id)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Filters and Search for Journal */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
                      <div className="flex-grow max-w-md relative">
                        <input 
                          type="text" 
                          placeholder="Пошук за назвою інвентарю..." 
                          value={journalSearchQuery}
                          onChange={(e) => setJournalSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-gray-600 whitespace-nowrap">Період з:</label>
                        <input 
                          type="date" 
                          value={journalStartDate}
                          onChange={(e) => setJournalStartDate(e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="text-sm font-bold text-gray-600 whitespace-nowrap ml-2">по:</label>
                        <input 
                          type="date" 
                          value={journalEndDate}
                          onChange={(e) => setJournalEndDate(e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <button 
                          onClick={handleAddJournalEntry}
                          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition active:scale-95 text-sm"
                        >
                          + Додати запис
                        </button>
                      </div>
                    </div>

                    {/* Journal Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <DataTable
                        columns={journalColumns as any}
                        data={filteredJournal}
                        isActionEnabled={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Inventory Add/Edit Modal */}
      <Modal isOpen={isInventoryModalOpen} onClose={() => setIsInventoryModalOpen(false)}>
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">{isEditMode ? 'Редагувати предмет' : 'Додати новий предмет'}</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Назва предмету:</label>
              <textarea 
                value={inventoryForm.title}
                onChange={(e) => setInventoryForm({...inventoryForm, title: e.target.value})}
                placeholder="Введіть повну назву предмету..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[100px] text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Інвентарний номер:</label>
              <input 
                type="text" 
                value={inventoryForm.inventoryNumber}
                onChange={(e) => setInventoryForm({...inventoryForm, inventoryNumber: e.target.value})}
                placeholder="Наприклад: INV-001234"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-gray-700">Відповідальна особа:</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={responsibleSearch}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setResponsibleSearch(e.target.value)
                    setIsDropdownOpen(true)
                  }}
                  placeholder="Пошук за ПІБ..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {mockStudents
                    .filter(s => s.fullName.toLowerCase().includes(responsibleSearch.toLowerCase()))
                    .map(student => (
                      <div 
                        key={student.id}
                        onClick={() => {
                          setInventoryForm({...inventoryForm, responsiblePersonId: student.id})
                          setResponsibleSearch(student.fullName)
                          setIsDropdownOpen(false)
                        }}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                      >
                        <div className="text-sm font-semibold text-gray-800">{student.fullName}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">{student.group}</div>
                      </div>
                    ))
                  }
                  {mockStudents.filter(s => s.fullName.toLowerCase().includes(responsibleSearch.toLowerCase())).length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">Нічого не знайдено</div>
                  )}
                </div>
              )}
              
              {selectedStudent && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {selectedStudent.fullName[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-900">{selectedStudent.fullName}</div>
                    <div className="text-[10px] text-blue-600">{selectedStudent.group}</div>
                  </div>
                  <button 
                    onClick={() => {
                      setInventoryForm({...inventoryForm, responsiblePersonId: null})
                      setResponsibleSearch('')
                    }}
                    className="ml-auto p-1 text-blue-400 hover:text-blue-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={() => {
                setIsInventoryModalOpen(false)
                setIsDropdownOpen(false)
              }} 
              className="px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Скасувати
            </button>
            <button 
              onClick={() => {
                console.log('Saved inventory item:', inventoryForm)
                setIsInventoryModalOpen(false)
                setIsDropdownOpen(false)
              }} 
              disabled={!inventoryForm.title || !inventoryForm.inventoryNumber || !inventoryForm.responsiblePersonId}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditMode ? 'Зберегти зміни' : 'Додати'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="p-6 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Підтвердження видалення</h3>
            <p className="text-gray-500">Ви впевнені, що хочете видалити цей запис? Цю дію неможливо буде скасувати.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Скасувати
            </button>
            <button 
              onClick={confirmDelete}
              disabled={deleteTimer > 0}
              className={`px-8 py-2.5 rounded-lg font-bold text-white shadow-md transition flex items-center gap-2 ${
                deleteTimer > 0 ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {deleteTimer > 0 ? `Зачекайте (${deleteTimer}с)` : 'Видалити'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)}>
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Редагування ролі</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm font-semibold text-blue-800">{selectedParticipant?.fullName}</p>
              <p className="text-xs text-blue-600">{selectedParticipant?.faculty}, {selectedParticipant?.group}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Оберіть нову роль:</label>
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                {roles.filter(r => r !== 'All').map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setIsRoleModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition">Скасувати</button>
            <button onClick={() => setIsRoleModalOpen(false)} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition">Зберегти</button>
          </div>
        </div>
      </Modal>

      {/* Add Participant Modal */}
      <Modal isOpen={isAddParticipantModalOpen} onClose={() => setIsAddParticipantModalOpen(false)}>
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Додати учасника</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Студент:</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Пошук студента за ПІБ..." 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition mt-2">
                <option value="">Оберіть зі списку результатів...</option>
                <option value="1">Іванов Іван (КН-31)</option>
                <option value="2">Петров Петро (МЕН-21)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Роль:</label>
              <select 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Оберіть роль...</option>
                {roles.filter(r => r !== 'All').map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setIsAddParticipantModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition">Скасувати</button>
            <button onClick={() => setIsAddParticipantModalOpen(false)} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition">Додати</button>
          </div>
        </div>
      </Modal>

      {/* Journal Add Modal */}
      <Modal isOpen={isJournalAddModalOpen} onClose={() => setIsJournalAddModalOpen(false)}>
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Видача інвентарю</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Оберіть предмет:</label>
              <select 
                value={journalForm.inventoryId || ''}
                onChange={(e) => setJournalForm({...journalForm, inventoryId: Number(e.target.value)})}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              >
                <option value="">Оберіть предмет...</option>
                {mockInventory.map(item => (
                  <option key={item.id} value={item.id}>{item.title} ({item.inventoryNumber})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-gray-700">Студент:</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={journalStudentSearch}
                  onFocus={() => setIsJournalStudentDropdownOpen(true)}
                  onChange={(e) => {
                    setJournalStudentSearch(e.target.value)
                    setIsJournalStudentDropdownOpen(true)
                  }}
                  placeholder="Пошук за ПІБ..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {isJournalStudentDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {mockStudents
                    .filter(s => s.fullName.toLowerCase().includes(journalStudentSearch.toLowerCase()))
                    .map(student => (
                      <div 
                        key={student.id}
                        onClick={() => {
                          setJournalForm({...journalForm, studentId: student.id})
                          setJournalStudentSearch(student.fullName)
                          setIsJournalStudentDropdownOpen(false)
                        }}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                      >
                        <div className="text-sm font-semibold text-gray-800">{student.fullName}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">{student.group}</div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Дата взяття:</label>
                <input 
                  type="date" 
                  value={journalForm.startDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setJournalForm({...journalForm, startDate: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Планова дата повернення:</label>
                <input 
                  type="date" 
                  value={journalForm.endDate}
                  min={journalForm.startDate || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setJournalForm({...journalForm, endDate: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setIsJournalAddModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition">Скасувати</button>
            <button 
              onClick={saveJournalEntry} 
              disabled={!journalForm.inventoryId || !journalForm.studentId || !journalForm.startDate || !journalForm.endDate}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Видати
            </button>
          </div>
        </div>
      </Modal>

      {/* Return Confirmation Modal */}
      <Modal isOpen={isReturnConfirmModalOpen} onClose={() => setIsReturnConfirmModalOpen(false)}>
        <div className="p-6 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Підтвердження повернення</h3>
            <p className="text-gray-500">Ви підтверджуєте, що інвентар був повернутий у належному стані?</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => setIsReturnConfirmModalOpen(false)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Ні
            </button>
            <button 
              onClick={confirmReturn}
              disabled={returnTimer > 0}
              className={`px-8 py-2.5 rounded-lg font-bold text-white shadow-md transition flex items-center gap-2 ${
                returnTimer > 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {returnTimer > 0 ? `Так (${returnTimer}с)` : 'Так'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdditionalScoresPage
