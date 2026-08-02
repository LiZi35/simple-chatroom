import axios, { isAxiosError } from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    timeout: 10000,
})

interface ErrorResponse {
    success: false
    status: string
    message: string
    issues?: ApiValidationError[]
    resData: unknown
}
export interface ApiValidationError {
    path: string[]
    code: string
    message: string
}

function errorHandler(error: unknown): ErrorResponse {
    if (isAxiosError(error)) {
        if (error.response && error.response.data && error.response.data.message) {
            if (error.response.data.issues) {
                return {
                    success: false,
                    status: 'InputError',
                    message: error.response.data.message,
                    issues: error.response.data.issues,
                    resData: error.response.data,
                }
            }
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

interface SendVerifyCodeSuccessResponse {
    success: true
    status: string
    message: string
    resData: unknown
}

export async function sendVerifyCode(
    email: string,
    type: string,
): Promise<SendVerifyCodeSuccessResponse | ErrorResponse> {
    try {
        const res = await http.post('/sendVerifyCode', { email: email, type: type })
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
        return errorHandler(error)
    }
}

interface ForgetPasswordSuccessResponse {
    success: true
    status: string
    message: string
    resData: unknown
}

export async function forgetPassword(
    email: string,
    verifyCode: string,
    newPassword: string,
): Promise<ForgetPasswordSuccessResponse | ErrorResponse> {
    try {
        const res = await http.post('/forgetPassword', {
            email: email,
            verifyCode: verifyCode,
            newPassword: newPassword,
        })
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
        return errorHandler(error)
    }
}

interface LoginSuccessResponse {
    success: true
    status: string
    message: string
    resData: unknown
    id: string
    email: string
    nickname: string
}

export async function login(
    email: string,
    password: string,
): Promise<LoginSuccessResponse | ErrorResponse> {
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
        return errorHandler(error)
    }
}

interface RegisterSuccessResponse {
    success: true
    status: string
    message: string
    resData: unknown
    id: string
    email: string
    nickname: string
}

export async function register(
    email: string,
    password: string,
    nickname: string,
    code: string,
): Promise<RegisterSuccessResponse | ErrorResponse> {
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
        return errorHandler(error)
    }
}
