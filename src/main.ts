import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
const app = createApp(App)

app.use(ElementPlus, {
    locale: zhCn,
})
app.use(pinia)
app.use(router)
app.mount('#app')
