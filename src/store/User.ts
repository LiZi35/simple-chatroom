import { defineStore } from 'pinia'
export const useUserStore = defineStore('User', {
    state: () => ({
        id: '',
        email: '',
        nickname: '',
    }),
})
