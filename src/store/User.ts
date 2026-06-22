import { defineStore } from 'pinia'
export const useUserStore = defineStore('User', {
    state: () => ({
        id: JSON.parse(localStorage.getItem('user') || '{}').id,
        email: JSON.parse(localStorage.getItem('user') || '{}').email,
        nickname: JSON.parse(localStorage.getItem('user') || '{}').nickname,
    }),
})
