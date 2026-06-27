import { defineStore } from 'pinia'
export const useUserStore = defineStore('User', {
    state: () => ({
        id: JSON.parse(localStorage.getItem('user') || '{}').id,
        email: JSON.parse(localStorage.getItem('user') || '{}').email,
        nickname: JSON.parse(localStorage.getItem('user') || '{}').nickname,
    }),
    actions: {
        isLoggedIn() {
            if (this.id && this.email && this.nickname) {
                return true
            } else {
                return false
            }
        },
        login(id: string, email: string, nickname: string) {
            this.id = id
            this.email = email
            this.nickname = nickname
        },
        logout() {
            this.id = ''
            this.email = ''
            this.nickname = ''
        }
    }
})
