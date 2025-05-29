'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StudentProfile {
    idStudents: number
    roleId: number
    nameStudent: string
    nameFaculty: string
    speciality: string
    course: number
}

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('student018@example.com')
    const [password, setPassword] = useState('password123')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const url = `http://185.237.207.78:5000/api/LoginPage?Email=${encodeURIComponent(
                email
            )}&Password=${encodeURIComponent(password)}`
            const res = await fetch(url, { method: 'GET' })
            if (!res.ok) throw new Error('Невірний Email або пароль')

            // зберегти profile
            const profile = (await res.json()) as StudentProfile

            localStorage.setItem('studentId', profile.idStudents.toString())

            router.push('/cabinet')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-md"
            >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 text-center">
                    Студентський вхід
                </h2>

                {error && (
                    <div className="text-red-600 text-center mb-4 sm:mb-6">
                        {error}
                    </div>
                )}

                <label className="block mb-4">
                    <span className="text-sm sm:text-base font-medium">
                        Email
                    </span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full border rounded-md px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </label>

                <label className="block mb-2">
                    <span className="text-sm sm:text-base font-medium">
                        Пароль
                    </span>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full border rounded-md px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </label>

                <label className="flex items-center mb-6 mt-2">
                    <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword((v) => !v)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm sm:text-base text-gray-600">
                        Показати пароль
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Завантаження...' : 'Увійти'}
                </button>
            </form>
        </div>
    )
}
