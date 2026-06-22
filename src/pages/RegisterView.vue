<template>
    <div style="background-color: #f5f7fa">
        <div class="loginPage">
            <h2 style="text-align: center">欢迎注册</h2>
            <br />
            <el-form ref="formRef" :model="form" label-width="auto" :rules="rules">
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" :prefix-icon="Message" />
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="form.nickname" :prefix-icon="User" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" :prefix-icon="Lock" type="password" />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="form.confirmPassword" :prefix-icon="Lock" type="password" />
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        style="width: 100%; height: 3em"
                        :loading="buttonLoading"
                        @click="submitForm"
                    >
                        注册
                    </el-button>
                </el-form-item>
            </el-form>
            <el-text style="display: block; text-align: center; margin-top: 1em">
                拥有账号？
                <router-link to="login"><el-link type="primary">去登录</el-link></router-link>
            </el-text>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { ref } from 'vue'
    import axios from 'axios'
    import { isAxiosError } from 'axios'
    import { ElMessage } from 'element-plus'
    import type { FormInstance, FormItemRule } from 'element-plus'
    import { Lock, Message, User } from '@element-plus/icons-vue'
    import { useUserStore } from '@/store/User.ts'
    import { useRouter } from 'vue-router'

    const router = useRouter()
    const userStore = useUserStore()

    const buttonLoading = ref(false)

    const form = ref({
        email: '',
        nickname: '',
        password: '',
        confirmPassword: '',
    })
    const formRef = ref<FormInstance>()

    const checkPassword = (
        rule: FormItemRule,
        value: string,
        callback: (error?: Error) => void,
    ) => {
        if (!value) {
            callback(new Error('请输入密码'))
        }
        if (value !== form.value.password) {
            callback(new Error('密码不匹配'))
        } else {
            callback()
        }
    }

    const rules = {
        email: [
            { required: true, message: '请输入邮箱地址', trigger: 'blur' },
            {
                type: 'email',
                message: '请输入正确的邮箱格式',
                trigger: ['blur'],
            },
        ],
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        confirmPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: checkPassword, trigger: 'blur' },
        ],
    }
    const submitForm = async () => {
        if (!formRef.value) return
        buttonLoading.value = true
        formRef.value.validate(async (valid: boolean) => {
            if (valid) {
                console.log('验证成功')
                try {
                    const res = await axios.post(
                        'http://localhost:3000/register',
                        {
                            email: form.value.email,
                            password: form.value.password,
                            nickname: form.value.nickname,
                        },
                        {
                            withCredentials: true,
                        },
                    )
                    if (res.data.id && res.data.email && res.data.nickname) {
                        userStore.$patch({
                            id: res.data.id,
                            email: res.data.email,
                            nickname: res.data.nickname,
                        })
                        localStorage.setItem(
                            'user',
                            JSON.stringify({
                                id: res.data.id,
                                email: res.data.email,
                                nickname: res.data.nickname,
                            }),
                        )
                        ElMessage({
                            message: res.data.message,
                            type: 'success',
                        })
                        setTimeout(() => {
                            router.push({ name: 'ChatView' })
                        }, 500)
                    } else {
                        ElMessage({
                            message: '未知错误',
                            type: 'error',
                        })
                    }
                } catch (error) {
                    if (isAxiosError(error)) {
                        if (error.response && error.response.data && error.response.data.message) {
                            ElMessage({
                                message: error.response.data.message,
                                type: 'error',
                            })
                        } else {
                            ElMessage({
                                message: '网络错误',
                                type: 'error',
                            })
                        }
                    } else {
                        ElMessage({
                            message: '未知错误',
                            type: 'error',
                        })
                    }
                }
            } else {
                console.log('验证失败')
            }
            buttonLoading.value = false
        })
    }
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
