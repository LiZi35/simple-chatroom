import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/pages/LoginView.vue'
import RegisterView from '@/pages/RegisterView.vue'
import ChatView from '@/pages/ChatView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            name: 'LoginView',
            path: '/login',
            component: LoginView,
        },
        {
            name: 'RegisterView',
            path: '/register',
            component: RegisterView,
        },
        {
            name: 'ChatView',
            path: '/chat',
            component: ChatView,
        },
        {
            path: '/',
            redirect: '/login',
        }
    ],
})

export default router
