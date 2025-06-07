import Cookies from 'js-cookie'

export const getCookie = (key: any) => {
    return Cookies.get(key)
}

export const setCookie = (key: string, value: string) => {
    Cookies.set(key, JSON.stringify(value))
}

export const deleteCookie = (key: string) => {
    Cookies.remove(key)
}
