<template>
    <div style="background-color: #f5f7fa">
        <div class="loginPage">
            <h2 style="text-align: center">欢迎登录</h2>
            <br />
            <el-form :model="form" label-width="auto">
                <el-form-item label="邮箱">
                    <el-input v-model="form.email" :prefix-icon="Message" />
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="form.password" :prefix-icon="Lock" type="password" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" style="width: 100%; height: 3em"> 登录 </el-button>
                </el-form-item>
            </el-form>
            <el-text style="display: block; text-align: center; margin-top: 1em">
                没有账号？<el-link type="primary">去注册</el-link>
            </el-text>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { ref } from 'vue'
    import { Lock, Message } from '@element-plus/icons-vue'

    const form = ref({
        email: '',
        password: '',
    })
</script>
<style scoped>
    .loginPage {
        padding: 30px;
        width: 25em;
        height: auto;
        border: 1px solid var(--el-border-color);
        border-radius: var(--el-border-radius-round);
        box-shadow: var(--el-box-shadow-dark);
    }
</style>
