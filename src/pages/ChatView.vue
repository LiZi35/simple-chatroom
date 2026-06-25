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
                <el-button @click="logout">退出</el-button>
            </div>
        </div>
        <div class="chatMain">
            <div class="messages">
                <!--消息列表-->
                <div
                    v-for="message in messagesList"
                    :key="message.messageId"
                    :class="judgeSender(message)"
                >
                    {{ message.content }}
                </div>
            </div>
            <div class="input">
                <el-input v-model="text"></el-input>
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
    import { onMounted, onUnmounted, ref } from 'vue'
    import io from 'socket.io-client'
    import type { message, reqMessagesList } from '@/types'
    import { ElMessage } from 'element-plus'
    import { useRouter } from 'vue-router'
    import { useUserStore } from '@/store/User'

    const userStore = useUserStore()
    const router = useRouter()
    const socket = io(import.meta.env.VITE_API_URL, {
        autoConnect: false,
        withCredentials: true,
    })

    const connectButtonText = ref('断开')
    // const connectButtonText = computed(() => (socket.connected ? '断开' : '连接'))
    const messagesList = ref<message[]>([])
    const text = ref('')
    let timer: ReturnType<typeof setInterval> | null = null

    socket.on('messagesList', (reqMessagesList: reqMessagesList) => {
        if (reqMessagesList.status == 200) {
            messagesList.value = reqMessagesList.messagesList
            console.log(messagesList.value)
        } else {
            ElMessage({
                message: reqMessagesList.message,
                type: 'error',
            })
            setTimeout(() => {
                router.push({ name: 'LoginView' })
            }, 1000)
        }
    })

    socket.on('connect', () => {
        connectButtonText.value = '断开'
        socket.emit('getMessages')
    })
    socket.on('disconnect', () => {
        connectButtonText.value = '连接'
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

    onMounted(() => {
        socket.connect()
        timer = setInterval(() => {
            if (socket.connected) {
                socket.emit('getMessages')
            }
        }, 1000)
    })
    onUnmounted(() => {
        if (timer) clearInterval(timer)
        socket.disconnect()
        socket.removeAllListeners()
    })

    function logout() {
        router.push({ name: 'LoginView' })
        socket.disconnect()
        localStorage.removeItem('user')
        userStore.$reset()
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
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
        setTimeout(() => {
            socket.emit('getMessages')
        }, 300)
    }
    function changeConnect() {
        if (socket.connected) {
            socket.disconnect()
        } else {
            socket.connect()
        }
    }
    function judgeSender(message: message) {
        if (message.senderId == userStore.id) {
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
        align-items: baseline;
        flex: 1;
        padding: 5px;
        overflow: auto;
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
        margin-bottom: 1px;
        border-radius: 13px 0px 13px 13px;
        padding: 5px;
        background-color: rgb(35, 88, 168);
        color: white;
        max-width: 70%;
        min-width: 20px;
    }
    .isOther {
        align-self: flex-start;
        margin-bottom: 1px;
        border-radius: 0px 13px 13px 13px;
        padding: 5px;
        background-color: rgb(207, 184, 184);
        color: black;
        max-width: 70%;
        min-width: 20px;
    }
</style>
