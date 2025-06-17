import Cookies from 'js-cookie'

export const getCookie = (key: any) => {
    return Cookies.get(key)
}

export const setCookie = (key: string, value: string) => {
    const size = encodeURIComponent(`${key}=${value}`).length
    console.log(size)
    Cookies.set(key, value)
}

export const deleteCookie = (key: string) => {
    Cookies.remove(key)
}
