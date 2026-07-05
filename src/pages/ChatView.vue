<template>
    <div class="Box">
        <div class="header">
            <el-icon size="25">
                <ChatDotRound />
            </el-icon>
            <el-text style="color: black; font-size: large">
                <b>simple-chatroom</b>
            </el-text>
            <div class="headerButtons" style="margin-left: auto">
                <el-button @click="changeConnect">{{ connectButtonText }}</el-button>
                <el-button @click="logoutButton">退出</el-button>
            </div>
        </div>
        <div class="chatMain" v-loading="notConnected">
            <div class="messages" ref="messagesView">
                <!--消息列表-->
                <div v-for="message in messagesList" :key="message.messageId" class="message">
                    <!-- 时间戳 -->
                    <div v-if="judgeDate(message.messageId)" class="time">
                        {{ showDate(message.date) }}
                    </div>
                    <div :class="judgeSender(message)">{{ message.content }}</div>
                </div>
            </div>
            <div class="input">
                <el-input v-model="text" @keyup.enter="sendMessage"></el-input>
                <el-button
                    style="margin-left: 5px"
                    type="primary"
                    circle
                    :icon="Promotion"
                    @click="sendMessage"
                ></el-button>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { ChatDotRound, Promotion } from '@element-plus/icons-vue'
    import { nextTick, onMounted, onUnmounted, ref, watch, computed } from 'vue'
    import io from 'socket.io-client'
    import type { Message, ResMessagesList } from '@/types'
    import { ElMessage } from 'element-plus'
    import { useRouter } from 'vue-router'
    import { useUserStore } from '@/store/User'
    import { logout } from '@/utils/logout'

    const userStore = useUserStore()
    const router = useRouter()
    const socket = io(import.meta.env.VITE_API_BASE_URL, {
        autoConnect: false,
        withCredentials: true,
    })

    const isConnected = ref(false)
    const connectButtonText = computed(() => (isConnected.value ? '断开' : '连接'))
    const notConnected = computed(() => !isConnected.value)
    const messagesList = ref<Message[]>([])
    const messagesView = ref<HTMLDivElement | null>(null)
    const text = ref('')
    const timer: ReturnType<typeof setInterval> | null = null

    socket.on('messagesList', (resMessagesList: ResMessagesList) => {
        if (resMessagesList.status === 200) {
            messagesList.value = resMessagesList.messagesList.map((message) => {
                message.date = new Date(message.date)
                return message
            })
            console.log(messagesList.value)
        } else {
            ElMessage({
                message: resMessagesList.message,
                type: 'error',
            })
        }
    })

    socket.on('connect', () => {
        // connectButtonText.value = '断开'
        isConnected.value = true
        socket.emit('getMessages')
    })
    socket.on('disconnect', () => {
        // connectButtonText.value = '连接'
        isConnected.value = false
    })
    socket.on('error', (message: string) => {
        ElMessage({
            message: message,
            type: 'error',
        })
        setTimeout(() => {
            router.push({ name: 'LoginView' })
        }, 1000)
    })
    socket.on('connect_error', (err) => {
        if (
            err.message === 'UNKNOWN_USER' ||
            err.message === 'ABNORMAL_USER' ||
            err.message === 'EXPIRED_USER' ||
            err.message === 'NOT_LOGGED_IN'
        ) {
            if (err.message === 'UNKNOWN_USER') {
                ElMessage.error({ message: '未知用户' })
            } else if (err.message === 'ABNORMAL_USER') {
                ElMessage.error({ message: '异常登陆' })
            } else if (err.message === 'EXPIRED_USER') {
                ElMessage.error({ message: '登陆已过期' })
            } else if (err.message === 'NOT_LOGGED_IN') {
                ElMessage.error({ message: '未登录' })
            }
            setTimeout(() => {
                router.push({ name: 'LoginView' })
            }, 1000)
        } else {
            ElMessage({
                type: 'error',
                message: '网络错误',
            })
        }
    })

    watch(messagesList, () => {
        nextTick(() => {
            if (messagesView.value) {
                const threshold = 25
                if (
                    messagesView.value.scrollHeight -
                        messagesView.value.scrollTop -
                        messagesView.value.clientHeight >
                    threshold
                ) {
                    messagesView.value.scrollTop = messagesView.value.scrollHeight
                }
            }
        })
    })

    // hooks
    onMounted(() => {
        socket.connect()
        // timer = setInterval(() => {
        //     if (socket.connected) {
        //         socket.emit('getMessages')
        //     }
        // }, 1000)
    })
    onUnmounted(() => {
        if (timer) clearInterval(timer)
        socket.disconnect()
        socket.removeAllListeners()
    })

    // methods
    function logoutButton() {
        router.push({ name: 'LoginView' })
        socket.disconnect()
        logout()
        ElMessage({
            message: '退出登录成功',
            type: 'success',
        })
    }
    function sendMessage() {
        console.log('SendMessage', text.value)
        const content: string = text.value
        text.value = ''
        socket.emit('sendMessage', content)
        // setTimeout(() => {
        //     socket.emit('getMessages')
        // }, 300)
    }
    function changeConnect() {
        if (socket.connected) {
            socket.disconnect()
        } else {
            socket.connect()
        }
    }
    function judgeDate(messageId: number) {
        if (messageId === 1) return true
        const current = messagesList.value[messageId - 1]
        const previous = messagesList.value[messageId - 2]
        if (current && previous) {
            return current.date.getTime() - previous.date.getTime() > 10 * 60 * 1000
        }
        return true
    }
    function showDate(date: Date) {
        if (date.getMinutes() < 10) {
            return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:0${date.getMinutes()}`
        } else {
            return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}`
        }
    }
    function judgeSender(message: Message) {
        if (message.senderId === userStore.id) {
            return 'isSelf'
        } else {
            return 'isOther'
        }
    }
</script>
<style scoped>
    .Box {
        display: flex;
        flex-direction: column;
        /* padding: 5px; */
        width: 80%;
        min-width: 25em;
        height: 70%;
        border: 1px solid var(--el-border-color);
        border-radius: 10px;
        box-shadow: var(--el-box-shadow-dark);
        min-height: 20em;
    }
    .header {
        display: flex;
        flex-direction: row;
        border-bottom: 1px solid var(--el-border-color);
        padding: 5px 5px 5px 5px;
    }
    .chatMain {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-width: 0;
        min-height: 0;
    }
    .messages {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        flex: 1;
        padding: 5px;
        overflow: auto;
    }
    .message {
        display: flex;
        flex-direction: column;
        margin-bottom: 1px;
    }
    .input {
        padding: 5px;
        display: flex;
        height: 2em;
        /* min-height: 80px; */
        border-top: 1px solid var(--el-border-color);
    }
    .isSelf {
        align-self: flex-end;
        border-radius: 13px 0 13px 13px;
        padding: 5px;
        background-color: rgb(35, 88, 168);
        color: white;
        max-width: 70%;
        min-width: 20px;
    }
    .isOther {
        align-self: flex-start;
        border-radius: 0 13px 13px 13px;
        padding: 5px;
        background-color: rgb(207, 184, 184);
        color: black;
        max-width: 70%;
        min-width: 20px;
    }
    .time {
        align-self: center;
        justify-self: baseline;
        background-color: rgba(107, 102, 102, 0.548);
        color: white;
        padding: 1px 2px;
        font-size: small;
        border-radius: 3px;
    }
</style>
