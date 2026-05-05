import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../pages/LoginView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            name: 'LoginView',
            path: '/login',
            component: LoginView,
        },
    ],
})

export default router
