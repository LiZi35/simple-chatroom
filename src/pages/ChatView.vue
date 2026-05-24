<template>
    <div class="Box">
        <div class="header">
            <el-icon size="25"><ChatDotRound /></el-icon>
            <el-text style="color: black; font-size: large"><b>simple-chatroom</b></el-text>
        </div>
        <div class="chatMain">
            <div class="messages">
                <!--todo:消息列表-->
            </div>
            <div class="input">
                <el-input v-model="text"></el-input>
                <el-button
                    style="margin-left: 5px"
                    type="primary"
                    circle
                    :icon="Promotion"
                    @click="SendMessage"
                ></el-button>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { ChatDotRound, Promotion } from '@element-plus/icons-vue'
    import { ref } from 'vue'

    const text = ref('')

    function SendMessage() {
        console.log('SendMessage', text.value)
        // todo:消息提交
        text.value = ''
    }
</script>
<style style>
    .Box {
        display: flex;
        flex-direction: column;
        //padding: 5px;
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
        flex: 1;
    }
    .input {
        padding: 5px;
        display: flex;
        height: 2em;
        //min-height: 80px;
        border-top: 1px solid var(--el-border-color);
    }
</style>
