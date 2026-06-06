import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { getCookie } from './cookie-servies'
import { AUTH_TOKEN } from '@/constants/cookies'

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
  (config: any) => {
    const token = authToken || getCookie(AUTH_TOKEN)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      config.headers['Accept'] = '*/*'
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

export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.put<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(url, config).then((res) => res.data),
}
