'use client'

import { createContext } from 'react'

export interface StudentProfile {
    idStudents: number
    roleId: number
    nameStudent: string
    nameFaculty: string
    speciality: string
    course: number
}

export interface StudentContextType {
    profile: StudentProfile | undefined
    setProfile: (profile: StudentProfile | undefined) => void
}

export const studentContext = createContext<StudentContextType | undefined>(undefined)
