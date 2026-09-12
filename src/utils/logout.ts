import { useUserStore } from '@/store/User'
import { http } from '@/api/auth.ts'

export function logout() {
    const userStore = useUserStore()
    localStorage.removeItem('user')
    userStore.logout()
    http.post('logout').then(() => {
        return
    })
}
