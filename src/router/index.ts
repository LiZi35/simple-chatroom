import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/pages/LoginView.vue'
import RegisterView from '@/pages/RegisterView.vue'
import ChatView from '@/pages/ChatView.vue'
import { useUserStore } from '@/store/User'

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

router.beforeEach((to) => {
    const userStore = useUserStore()
    // whiteList
    if (to.name == 'LoginView' || to.name == 'RegisterView') {
        return true
    }

    if (to.name == 'ChatView' && userStore.isLoggedIn()) {
        return true
    } else {
        return { name: 'LoginView' }
    }
})

export default router
