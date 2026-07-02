import { defineStore } from 'pinia'
export const useUserStore = defineStore('User', {
    state: () => {
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        return {
            id: stored.id,
            email: stored.email,
            nickname: stored.nickname,
        }
    },
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
