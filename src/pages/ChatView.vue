<template>
    <div class="Box">
        <div class="header">
            <el-icon size="25">
                <ChatDotRound />
            </el-icon>
            <el-text style="color: black; font-size: large"><b>simple-chatroom</b></el-text>
            <el-button @click="changeConnect">{{ connectButtonText }}</el-button>
        </div>
        <div class="chatMain">
            <div class="messages">
                <!--消息列表-->
                <div class="isSelf">
                    <div>111</div>
                </div>
                <div class="isOther">
                    <div>222</div>
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
    import type { message } from '@/types'

    const socket = io('http://localhost:3000', { autoConnect: false })

    const connectButtonText = ref('断开')
    const messagesList = ref<message[]>([])
    const text = ref('')
    let timer: ReturnType<typeof setInterval> | null = null

    socket.on('messagesList', (reqMessagesList: message[]) => {
        messagesList.value = reqMessagesList
        console.log(messagesList.value)
    })

    socket.on('connect', () => {
        connectButtonText.value = '断开'
    })
    socket.on('disconnect', () => {
        connectButtonText.value = '连接'
    })

    onMounted(() => {
        socket.connect()
        timer = setInterval(() => {
            if (socket.connected) {
                socket.emit('getMessages')
            }
        }, 10000)
    })
    onUnmounted(() => {
        if (timer) clearInterval(timer)
        socket.disconnect()
        socket.removeAllListeners()
    })

    function sendMessage() {
        console.log('SendMessage', text.value)
        // todo:消息提交
        text.value = ''
    }
    function changeConnect() {
        if (socket.connected) {
            socket.disconnect()
        } else {
            socket.connect()
        }
    }
</script>
<style style>
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
    }

    .messages {
        display: flex;
        flex-direction: column;
        align-items: baseline;
        flex: 1;
        padding: 5px;
    }

    .input {
        padding: 5px;
        display: flex;
        height: 2em;
        /* min-height: 80px; */
        border-top: 1px solid var(--el-border-color);
    }
    .isSelf {
        margin-left: auto;
        margin-bottom: 1px;
        border-radius: 13px 0px 13px 13px;
        padding: 5px;
        background-color: rgb(35, 88, 168);
        color: white;
    }
    .isOther {
        margin-right: auto;
        margin-bottom: 1px;
        border-radius: 0px 13px 13px 13px;
        padding: 5px;
        background-color: rgb(207, 184, 184);
        color: black;
    }
</style>
