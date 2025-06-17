'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { USER_PROFLE } from '@/constants/cookies'
import { setCookie, getCookie} from '@/services/cookie-servies'
import { apiService, setToken } from '@/services/axiosService'

interface Permission {
  idPermissions: number
  typePermission: string
  tableName: string
}

interface StudentProfile {
  id: number
  token: string
  name: string
  nameFaculty: string | null
  userId: number
  roleId: number
  speciality: string | null
  course: number | null
  permissions: Permission[]
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('user00008@example.com')
  const [password, setPassword] = useState('default_password')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result_auth = await apiService.post<StudentProfile>('/Auth/authorization', {
        email,
        password,
      })

      if (!result_auth.token) {
        throw new Error('Сервер не надіслав токен')
      }

      setToken(result_auth.token)

      const final = await apiService.get<StudentProfile>('/Auth/AuthChecker')

      localStorage.setItem(`${final.userId}_permissions`, JSON.stringify(final.permissions))

      const { permissions, ...finalWithoutPermissions } = final

      setCookie(USER_PROFLE, JSON.stringify(finalWithoutPermissions))
      console.log(getCookie(USER_PROFLE))

      window.dispatchEvent(new Event('student-auth-changed'))
      router.push('/cabinet')
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Помилка входу')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Студентський вхід
        </h2>

        {error && (
          <div className="text-red-600 text-center mb-4">{error}</div>
        )}

        <label className="block mb-4">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </label>

        <label className="block mb-2">
          <span className="text-sm font-medium">Пароль</span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </label>

        <label className="flex items-center mb-6">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword((v) => !v)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600">
            Показати пароль
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Завантаження...' : 'Увійти'}
        </button>
      </form>
    </div>
  )
}