import axios, { isAxiosError } from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    timeout: 10000,
})

export async function sendVerifyCode(email: string) {
    try {
        const res = await http.post('/sendVerifyCode', { email: email })
        if (res.data.code === 200) {
            return {
                success: true,
                status: 'success',
                message: res.data.message,
                resData: res.data,
            }
        } else {
            return {
                success: false,
                status: 'error',
                message: res.data.message,
                resData: res.data,
            }
        }
    } catch (error) {
        if (isAxiosError(error)) {
            if (error.response && error.response.data && error.response.data.message) {
                return {
                    success: false,
                    status: 'error',
                    message: error.response.data.message,
                    resData: error.response.data,
                }
            } else {
                return {
                    success: false,
                    status: 'error',
                    message: '网络错误',
                    resData: error,
                }
            }
        } else {
            return {
                success: false,
                status: 'error',
                message: '未知错误',
                resData: error,
            }
        }
    }
}

export async function login(email: string, password: string) {
    try {
        const res = await http.post('/login', {
            email: email,
            password: password,
        })
        if (res.data.code === 200 && res.data.id && res.data.email && res.data.nickname) {
            return {
                success: true,
                status: 'success',
                message: res.data.message,
                resData: res.data,
                id: res.data.id,
                email: res.data.email,
                nickname: res.data.nickname,
            }
        } else {
            return {
                success: false,
                status: 'error',
                message: res.data.message,
                resData: res.data,
            }
        }
    } catch (error) {
        if (isAxiosError(error)) {
            if (error.response && error.response.data && error.response.data.message) {
                return {
                    success: false,
                    status: 'error',
                    message: error.response.data.message,
                    resData: error.response.data,
                }
            } else {
                return {
                    success: false,
                    status: 'error',
                    message: '网络错误',
                    resData: error,
                }
            }
        } else {
            return {
                success: false,
                status: 'error',
                message: '未知错误',
                resData: error,
            }
        }
    }
}

export async function register(email: string, password: string, nickname: string, code: string) {
    try {
        const res = await http.post('/register', {
            email: email,
            password: password,
            code: code,
            nickname: nickname,
        })
        if (res.data.code === 201 && res.data.id && res.data.email && res.data.nickname) {
            return {
                success: true,
                status: 'success',
                message: res.data.message,
                resData: res.data,
                id: res.data.id,
                email: res.data.email,
                nickname: res.data.nickname,
            }
        } else {
            return {
                success: false,
                status: 'error',
                message: res.data.message,
                resData: res.data,
            }
        }
    } catch (error) {
        if (isAxiosError(error)) {
            if (error.response && error.response.data && error.response.data.message) {
                return {
                    success: false,
                    status: 'error',
                    message: error.response.data.message,
                    resData: error.response.data,
                }
            } else {
                return {
                    success: false,
                    status: 'error',
                    message: '网络错误',
                    resData: error,
                }
            }
        } else {
            return {
                success: false,
                status: 'error',
                message: '未知错误',
                resData: error,
            }
        }
    }
}
