import { apiService } from './axiosService'

export interface Paginated<T> {
  items: T[]
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface CampaignDiscipline {
  disciplineId: string
  name: string
  code?: string
  departmentName?: string
  facultyAbbreviation?: string
  facultyId: string
  minCountPeople?: number
  maxCountPeople?: number
  currentCount: number
}

export interface StudentBySelective {
  studentId: string
  firstName: string
  secondName: string
  thirdName: string
  studentName: string
  groupCode: string
  departmentName: string
  year: number
  educationLevel: string
  isShort: boolean
  faculty: string
}

export const adminCatalogService = {
  getCampaignDisciplines: (params: { page?: number; pageSize?: number; search?: string }) => {
    const q = new URLSearchParams()
    q.set('page', String(params.page ?? 1))
    q.set('pageSize', String(params.pageSize ?? 20))
    if (params.search?.trim()) q.set('search', params.search.trim())
    return apiService.get<Paginated<CampaignDiscipline>>(
      `DisciplineTabAdmin/GetCurrentCampaignDisciplines?${q.toString()}`,
    )
  },

  getStudentsByDiscipline: (disciplineId: string, page = 1, pageSize = 50) =>
    apiService.get<Paginated<StudentBySelective>>(
      `DisciplineTabAdmin/GetStudentsBySelectiveDiscipline?DisciplineId=${disciplineId}&page=${page}&pageSize=${pageSize}`,
    ),

  repealChoice: (studentId: string, disciplineId: string) =>
    apiService.delete(`DisciplineTabAdmin/RepealChoice/${studentId}/${disciplineId}`),

  // ----- General catalog (active/archived, delete, copy) -----
  deleteDiscipline: (id: string) =>
    apiService.delete(`DisciplineTabAdmin/DeleteDiscipline/${id}`),

  copyDiscipline: (sourceId: string, targetCatalogId: string) =>
    apiService.post(`DisciplineTabAdmin/CopyDiscipline?sourceId=${sourceId}&targetCatalogId=${targetCatalogId}`),
}
