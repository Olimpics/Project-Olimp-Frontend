import { apiService } from './axiosService'

// ----- Selected disciplines grouped by year -----
export interface SelectedDisciplineItem {
  bindId: string
  disciplineId: string
  name: string
  code?: string
  loans?: number
  semestr: number
  status: 'InProcess' | 'Confirmed' | 'Rejected'
  canCancel: boolean
}

export interface SelectedYearGroup {
  yearStart: number
  yearEnd: number
  yearLabel: string
  disciplines: SelectedDisciplineItem[]
}

export interface StudentSelectedByYear {
  studentId: string
  years: SelectedYearGroup[]
}

// ----- Favorites -----
export interface SimilarDiscipline {
  id: string
  name: string
  yearStart: number
  yearEnd: number
}

export interface FavoriteDiscipline {
  id: string
  disciplineId: string
  name: string
  code?: string
  departmentName?: string
  catalogYearStart: number
  catalogYearEnd: number
  similar: SimilarDiscipline[]
}

export const cabinetService = {
  getSelectedByYear: (studentId: string) =>
    apiService.get<StudentSelectedByYear>(`DisciplineTabStudent/GetSelectedByYear/${studentId}`),

  cancelChoice: (studentId: string, bindId: string) =>
    apiService.post(`DisciplineTabStudent/CancelChoice/${studentId}/${bindId}`),

  getFavorites: (studentId: string) =>
    apiService.get<FavoriteDiscipline[]>(`Favorite/ByStudent/${studentId}`),

  addFavorite: (studentId: string, disciplineId: string) =>
    apiService.post(`Favorite`, { studentId, disciplineId }),

  removeFavorite: (studentId: string, disciplineId: string) =>
    apiService.delete(`Favorite/${studentId}/${disciplineId}`),
}
