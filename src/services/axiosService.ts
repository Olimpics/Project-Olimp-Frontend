import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { getCookie } from './cookie-servies'
import { AUTH_TOKEN, USER_PROFLE } from '@/constants/cookies'

const BASE_URL = 'http://localhost:5154/api/'

let authToken: string | null = null

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    let token = authToken || getCookie(AUTH_TOKEN)

    if (!token) {
      const profileStr = getCookie(USER_PROFLE)
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr)
          token = profile.token || profile.AuthToken
        } catch (e) {
          console.error('Failed to parse userProfile for token fallback', e)
        }
      }
    }

    if (token && config.headers) {
      // Use .set() for Axios 1.x headers or direct assignment for older versions/plain objects
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`)
        config.headers.set('Accept', '*/*')
      } else {
        config.headers['Authorization'] = `Bearer ${token}`
        config.headers['Accept'] = '*/*'
      }
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized — можливо, токен недійсний.')
    }
    return Promise.reject(error)
  }
)

export const setToken = (token: string) => {
  authToken = token
}

export const clearToken = () => {
  authToken = null
}

interface CacheEntry {
  data: any
  timestamp: number
}

const getCache = new Map<string, CacheEntry>()
const CACHE_TTL = 30000 // 30 seconds Cache TTL

export const clearApiCache = () => {
  getCache.clear()
}

export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    // Generate a cache key including request params
    const key = JSON.stringify({ url, params: config?.params })
    const cached = getCache.get(key)
    const now = Date.now()

    if (cached && now - cached.timestamp < CACHE_TTL) {
      return Promise.resolve(cached.data as T)
    }

    return axiosInstance.get<T>(url, config).then((res) => {
      getCache.set(key, { data: res.data, timestamp: Date.now() })
      return res.data
    })
  },

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    getCache.clear()
    return axiosInstance.post<T>(url, data, config).then((res) => res.data)
  },

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    getCache.clear()
    return axiosInstance.put<T>(url, data, config).then((res) => res.data)
  },

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    getCache.clear()
    return axiosInstance.delete<T>(url, config).then((res) => res.data)
  },
}
