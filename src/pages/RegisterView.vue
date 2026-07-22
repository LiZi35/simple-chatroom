<template>
    <div style="background-color: #f5f7fa">
        <div class="registerPage">
            <h2 style="text-align: center">欢迎注册</h2>
            <br />
            <el-form ref="formRef" :model="form" label-width="80" :rules="rules">
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="form.nickname" :prefix-icon="User" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" :prefix-icon="Message" />
                </el-form-item>
                <el-form-item label="验证码" prop="verifyCode">
                    <el-input
                        v-model="form.verifyCode"
                        :prefix-icon="CircleCheck"
                        style="width: 70%"
                    />
                    <el-button
                        style="width: 30%"
                        @click="verifyButton"
                        :loading="sending"
                        :disabled="countdownNumber > 0"
                    >
                        {{ countdownNumber > 0 ? `${countdownNumber}s秒后重试` : '发送验证码' }}
                    </el-button>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" :prefix-icon="Lock" type="password" />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="form.confirmPassword" :prefix-icon="Lock" type="password" />
                </el-form-item>
            </el-form>
            <el-button
                type="primary"
                style="width: 100%; height: 3em"
                :loading="buttonLoading"
                @click="submitForm"
            >
                注册
            </el-button>
            <div
                style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 4px;
                    margin-top: 1em;
                "
            >
                <el-text> 拥有账号？</el-text>
                <el-link type="primary" @click="router.push('/login')"> 去登录 </el-link>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { ref } from 'vue'
    import { ElMessage } from 'element-plus'
    import type { FormInstance, FormItemRule } from 'element-plus'
    import { Lock, Message, User, CircleCheck } from '@element-plus/icons-vue'
    import { useUserStore } from '@/store/User.ts'
    import { useRouter } from 'vue-router'
    import { register, sendVerifyCode } from '@/api/auth.ts'
    import validator from 'validator'
    import { useCountdown } from '@/hooks/useCountdown.ts'

    const { start: startCount, countdown: countdownNumber } = useCountdown()

    const router = useRouter()
    const userStore = useUserStore()

    const buttonLoading = ref(false)
    const sending = ref(false)

    const form = ref({
        email: '',
        nickname: '',
        verifyCode: '',
        password: '',
        confirmPassword: '',
    })
    const formRef = ref<FormInstance | undefined>()

    const checkPassword = (
        rule: FormItemRule,
        value: string,
        callback: (error?: Error) => void,
    ) => {
        if (!value) {
            callback(new Error('请输入密码'))
            return
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
        verifyCode: [
            { required: true, message: '请输入验证码', trigger: 'blur' },
            {
                pattern: /^\d{6}$/,
                message: '请输入6位数字验证码',
                trigger: 'blur',
            },
        ],
    }
    const verifyButton = async () => {
        sending.value = true
        if (!form.value.email) {
            ElMessage.error({ message: '请输入邮箱' })
            sending.value = false
            return
        }
        if (!validator.isEmail(form.value.email)) {
            ElMessage.error({ message: '邮箱格式不正确' })
            sending.value = false
            return
        }
        const result = await sendVerifyCode(form.value.email)
        if (result.success) {
            ElMessage.success({ message: result.message })
            sending.value = false
            startCount()
        } else {
            ElMessage.error({ message: result.message })
            sending.value = false
        }
        return
    }
    const submitForm = async () => {
        if (!formRef.value) return
        buttonLoading.value = true
        formRef.value.validate(async (valid: boolean) => {
            if (valid) {
                console.log('验证成功')
                const res = await register(
                    form.value.email,
                    form.value.password,
                    form.value.nickname,
                    form.value.verifyCode,
                )
                if (res.success) {
                    userStore.login(res.id, res.email, res.nickname)
                    localStorage.setItem(
                        'user',
                        JSON.stringify({
                            id: res.id,
                            email: res.email,
                            nickname: res.nickname,
                        }),
                    )
                    ElMessage({
                        type: 'success',
                        message: res.message,
                    })
                    setTimeout(() => {
                        router.push({ name: 'ChatView' })
                    }, 500)
                } else {
                    ElMessage({
                        type: 'error',
                        message: res.message,
                    })
                }
            } else {
                console.log('验证失败')
            }
            buttonLoading.value = false
        })
    }
</script>
<style scoped>
    .registerPage {
        padding: 30px;
        width: 25em;
        height: auto;
        border: 1px solid var(--el-border-color);
        border-radius: var(--el-border-radius-round);
        box-shadow: var(--el-box-shadow-dark);
    }
</style>
