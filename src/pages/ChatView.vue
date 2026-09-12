<template>
    <div class="Box">
        <div class="header">
            <el-icon size="25">
                <ChatDotRound />
            </el-icon>
            <el-text style="color: black; font-size: large" class="fonts">
                <b>simple-chatroom</b>
            </el-text>
            <div class="headerButtons" style="margin-left: auto">
                <el-button @click="changeConnect">{{ connectButtonText }}</el-button>
                <el-button @click="logoutButton">退出</el-button>
            </div>
        </div>
        <div class="chatMain" v-loading="notConnected">
            <el-scrollbar class="messages" ref="messagesView" @scroll="scrolling">
                <!--消息列表-->
                <div v-for="[, message] in messagesList" :key="message.messageId" class="message">
                    <!-- 时间戳 -->
                    <div v-if="judgeDate(message.messageId)" class="time fonts">
                        {{ showDate(message.date) }}
                    </div>
                    <div :class="judgeSender(message)" class="fonts">
                        {{ message.content }}
                    </div>
                </div>
            </el-scrollbar>
            <div class="input">
                <el-input
                    v-model="text"
                    @keyup.enter="sendMessage"
                    maxlength="300"
                    show-word-limit
                ></el-input>
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
    import type { Message, ResLimitMessagesList, ResMessagesList, socketError } from '@/types'
    import { ElMessage, type ScrollbarInstance } from 'element-plus'
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
    const messagesList = ref(new Map<number, Message>())
    const messagesView = ref<ScrollbarInstance | null>(null)
    const text = ref('')
    const timer: ReturnType<typeof setInterval> | null = null
    const lastestMessageId = ref<number>(0)
    const messagePulling = ref<{ before: boolean; after: boolean }>({
        before: false,
        after: false,
    })

    socket.on('LatestMessageId', (data: { status: number; latestMessageId: number }) => {
        lastestMessageId.value = data.latestMessageId
        socket.emit('getBeforeMessage', data.latestMessageId + 1, 50)
    })
    socket.on('BeforeMessagesList', (res: ResLimitMessagesList) => {
        const newMessagesList: Message[] = res.messageList.map(
            (message): Message => ({
                ...message,
                date: new Date(message.date),
            }),
        )
        messagesList.value = mergeMessage(messagesList.value, newMessagesList)
        messagePulling.value.before = false
    })

    socket.on('AfterMessagesList', (res: ResLimitMessagesList) => {
        const newMessagesList: Message[] = res.messageList.map(
            (message): Message => ({
                ...message,
                date: new Date(message.date),
            }),
        )
        messagesList.value = mergeMessage(messagesList.value, newMessagesList)
        lastestMessageId.value = Array.from(messagesList.value.keys()).at(-1) || 0
        messagePulling.value.after = false
    })

    socket.on('newMessage', (res: ResMessagesList) => {
        const serverMessage = res.newMessages
        if (lastestMessageId.value + 1 === serverMessage.messageId) {
            const message: Message = { ...serverMessage, date: new Date(serverMessage.date) }
            messagesList.value.set(message.messageId, message)
            lastestMessageId.value = message.messageId
        } else if (lastestMessageId.value + 1 < serverMessage.messageId) {
            if (messagePulling.value.after) return
            messagePulling.value.after = true
            socket.emit(
                'getAfterMessage',
                lastestMessageId.value,
                serverMessage.messageId - lastestMessageId.value + 1,
            )
        }
    })

    socket.on('connect', () => {
        isConnected.value = true
        messagePulling.value.before = false
        messagePulling.value.after = false
        socket.emit('getLatestMessageId')
    })
    socket.on('disconnect', () => {
        isConnected.value = false
    })
    socket.on('error', (data: socketError) => {
        if (data.on === 'getAfterMessage') {
            messagePulling.value.after = false
        } else if (data.on === 'getBeforeMessage') {
            messagePulling.value.before = true
        }
        ElMessage({
            message: data.message,
            type: 'error',
        })
        if (data.shouldOut) {
            setTimeout(() => {
                router.push({ name: 'LoginView' })
            }, 1000)
        }
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
            socket.disconnect()
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

    watch(
        () => messagesList.value.size,
        async () => {
            const messagesViewInstance = messagesView.value
            const wrapRef = messagesViewInstance?.wrapRef

            if (!messagesViewInstance || !wrapRef) {
                return
            }

            const threshold = 25
            const distanceToBottom = wrapRef.scrollHeight - wrapRef.scrollTop - wrapRef.clientHeight

            const shouldScrollToBottom = distanceToBottom <= threshold

            await nextTick()

            if (shouldScrollToBottom) {
                messagesViewInstance.setScrollTop(wrapRef.scrollHeight)
            }
        },
    )

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
    function mergeMessage(
        currentMessage: Map<number, Message>,
        fetchMessage: Message[],
    ): Map<number, Message> {
        const messageById = new Map<number, Message>()
        for (const [, message] of currentMessage) {
            messageById.set(message.messageId, message)
        }
        for (const message of fetchMessage) {
            messageById.set(message.messageId, message)
        }
        return new Map(Array.from(messageById.entries()).sort(([a], [b]) => a - b))
    }
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
        const current = messagesList.value.get(messageId)
        const previous = messagesList.value.get(messageId - 1)
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
    function scrolling(scroll: { scrollLeft: number; scrollTop: number }) {
        if (messagesView.value && messagesView.value.wrapRef) {
            if (scroll.scrollTop === 0) {
                if (messagePulling.value.before) return
                messagePulling.value.before = true
                socket.emit('getBeforeMessage', messagesList.value.keys().next().value, 20)
            }
        }
    }
</script>
<style scoped>
    .fonts {
        font-family:
            'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
            '微软雅黑', 'Noto Sans CJK SC', 'Noto Sans SC', Arial, sans-serif;
    }
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
        margin-right: 7px;
        background-color: rgb(35, 88, 168);
        color: white;
        max-width: 70%;
        min-width: 20px;
    }
    .isOther {
        align-self: flex-start;
        border-radius: 0 13px 13px 13px;
        padding: 5px;
        margin-left: 7px;
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
