'use client'

import { useState, ReactNode } from 'react'
import { studentContext, StudentProfile } from './context'

export default function StudentProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<StudentProfile | undefined>(undefined)

    return (
        <studentContext.Provider value={{ profile, setProfile }}>
            {children}
        </studentContext.Provider>
    )
}
