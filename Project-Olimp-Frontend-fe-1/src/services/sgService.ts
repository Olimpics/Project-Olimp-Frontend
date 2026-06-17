import { apiService } from './axiosService'

// ---------- Types (mirror backend Sg DTOs) ----------
export interface SubDivisionUser {
  subDivisionId: string
  nameDivision: string
  facultyId?: string
  abbreviation?: string
}

export interface StudentSg {
  id: string
  groupName: string
  facultyName: string
  roleInSg: string
}

export interface EventDto {
  idEvent: string
  nameEvent: string
  date: string
  location: string
  format?: string
  creatorId: string
  subdivisionSgid: string
  regulationId: string
  avail: boolean
  facultyId: string
  catalogYearId: string
  isEven: boolean
}

export interface EventCreateUpdate {
  nameEvent: string
  date: string
  location: string
  format?: string
  subdivisionSgid: string
  regulationId: string
  avail: boolean
  facultyId: string
  catalogYearId: string
  isEven: boolean
}

export interface BindEventStudent {
  idBindEventStudent: string
  eventId: string
  studentId: string
  roleId: string
  point: number
  otherOption?: string
}

export interface BindEventStudentCreateUpdate {
  eventId: string
  studentId: string
  roleId: string
  point: number
  otherOption?: string
}

export interface InventorySg {
  idInventory: string
  inventoryName: string
  inventoryCode: string
  watchmanId: string
  avail: boolean
}

export interface InventorySgCreateUpdate {
  inventoryName: string
  inventoryCode: string
  watchmanId: string
  avail: boolean
}

export interface AccountingJournal {
  idAccountingJournal: string
  startDate: string
  endDate: string
  realBackTime?: string | null
  comment?: string
  studentId: string
  inventorySgid: string
  isBack: boolean
}

export interface AccountingJournalCreateUpdate {
  startDate: string
  endDate: string
  comment?: string
  studentId: string
  inventorySgid: string
}

export interface SgRefItem {
  id: string
  name: string
}

export interface RegulationStandard {
  id: string
  code: string
  type: string
  subType?: string
  amountMin: number
  amountMax: number
  notes?: string
}

export interface StudentPointItem {
  eventId: string
  eventName: string
  date: string
  point: number
  roleName: string
  activityType?: string
}

export interface StudentPoints {
  studentId: string
  total: number
  items: StudentPointItem[]
}

export const sgService = {
  // Subdivisions / students
  getUserSubDivisions: () => apiService.get<SubDivisionUser[]>('Sg/user-subdivisions'),

  // Reference data for event dropdowns
  getCatalogYears: () => apiService.get<SgRefItem[]>('Sg/catalog-years'),
  getRegulations: () => apiService.get<SgRefItem[]>('Sg/regulations'),
  getEventRoles: () => apiService.get<SgRefItem[]>('Sg/event-roles'),

  // Additional points
  getRegulationStandards: () => apiService.get<RegulationStandard[]>('Sg/regulation-standards'),
  getStudentPoints: (studentId: string) => apiService.get<StudentPoints>(`Sg/student/${studentId}/points`),

  getStudentsInSg: (subDivisionId: string, facultyId?: string, search?: string) => {
    const q = new URLSearchParams({ subDivisionId })
    if (facultyId) q.set('facultyId', facultyId)
    if (search?.trim()) q.set('search', search.trim())
    return apiService.get<StudentSg[]>(`Sg/students?${q.toString()}`)
  },

  // Events
  getEvents: (subDivisionId: string, catalogYearId: string, isEven: boolean, facultyId?: string, search?: string) => {
    const q = new URLSearchParams({ subDivisionId, catalogYearId, isEven: String(isEven) })
    if (facultyId) q.set('facultyId', facultyId)
    if (search?.trim()) q.set('search', search.trim())
    return apiService.get<EventDto[]>(`Sg/events?${q.toString()}`)
  },
  getEvent: (id: string) => apiService.get<EventDto>(`Sg/events/${id}`),
  createEvent: (dto: EventCreateUpdate) => apiService.post<EventDto>('Sg/events', dto),
  updateEvent: (id: string, dto: EventCreateUpdate) => apiService.put(`Sg/events/${id}`, dto),
  deleteEvent: (id: string) => apiService.delete(`Sg/events/${id}`),

  // Event participants
  getEventStudents: (eventId: string, search?: string) =>
    apiService.get<BindEventStudent[]>(`Sg/events/${eventId}/students${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  addStudentToEvent: (dto: BindEventStudentCreateUpdate) => apiService.post('Sg/event-students', dto),
  updateStudentInEvent: (id: string, dto: BindEventStudentCreateUpdate) => apiService.put(`Sg/event-students/${id}`, dto),
  deleteStudentFromEvent: (id: string) => apiService.delete(`Sg/event-students/${id}`),

  // Inventory
  getInventory: (search?: string) =>
    apiService.get<InventorySg[]>(`Sg/inventory${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  addInventory: (dto: InventorySgCreateUpdate) => apiService.post('Sg/inventory', dto),
  updateInventory: (id: string, dto: InventorySgCreateUpdate) => apiService.put(`Sg/inventory/${id}`, dto),
  deleteInventory: (id: string) => apiService.delete(`Sg/inventory/${id}`),

  // Journal
  getJournal: (inventoryId: string, search?: string) =>
    apiService.get<AccountingJournal[]>(`Sg/inventory/${inventoryId}/journal${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  addJournalEntry: (dto: AccountingJournalCreateUpdate) => apiService.post('Sg/journal', dto),
  updateJournalEntry: (id: string, dto: AccountingJournalCreateUpdate) => apiService.put(`Sg/journal/${id}`, dto),
  deleteJournalEntry: (id: string) => apiService.delete(`Sg/journal/${id}`),
  confirmReturn: (id: string) => apiService.post(`Sg/journal/${id}/confirm-return`),
}
