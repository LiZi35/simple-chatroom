<template>
    <el-dialog style="min-width: 30em" title="忘记密码" v-model="forgetPasswordDialogVisible">
        <el-form
            ref="forgetPasswordFormRef"
            :model="forgetPasswordForm"
            label-width="80"
            :rules="forgetPasswordRules"
        >
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="forgetPasswordForm.email" :prefix-icon="Message" />
            </el-form-item>
            <el-form-item label="验证码" prop="verifyCode">
                <el-input
                    v-model="forgetPasswordForm.verifyCode"
                    :prefix-icon="CircleCheck"
                    style="width: 70%"
                />
                <el-button
                    style="width: 30%"
                    @click="forgetPasswordVerifyCodeButton"
                    :loading="forgetPasswordVerityCodeSending"
                    :disabled="forgetPasswordCountdownNumber > 0"
                >
                    {{
                        forgetPasswordCountdownNumber > 0
                            ? `${forgetPasswordCountdownNumber}s秒后重试`
                            : '发送验证码'
                    }}
                </el-button>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input
                    v-model="forgetPasswordForm.password"
                    :prefix-icon="Lock"
                    type="password"
                />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                    v-model="forgetPasswordForm.confirmPassword"
                    :prefix-icon="Lock"
                    type="password"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="forgetPasswordDialogVisible = false">取消</el-button>
                <el-button
                    :loading="forgetPasswordButtonLoading"
                    type="primary"
                    @click="forgetPasswordSubmitForm"
                >
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>
    <div style="background-color: #f5f7fa">
        <div class="loginPage">
            <h2 style="text-align: center">欢迎登录</h2>
            <br />
            <el-form ref="formRef" :model="form" :rules="rules">
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" :prefix-icon="Message" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" :prefix-icon="Lock" type="password" />
                </el-form-item>
            </el-form>
            <el-button
                type="primary"
                style="width: 100%; height: 3em"
                :loading="buttonLoading"
                @click="submitForm"
            >
                登录
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
                <el-text> 没有账号？</el-text>
                <el-link type="primary" @click="router.push('/register')"> 去注册 </el-link>
            </div>
            <div style="display: flex; justify-content: center; margin-top: 5px">
                <el-link
                    style="margin: auto"
                    type="primary"
                    @click="forgetPasswordDialogVisible = true"
                    >忘记密码？</el-link
                >
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { ref } from 'vue'
    import { ElMessage, type FormInstance, type FormItemRule } from 'element-plus'
    import { CircleCheck, Lock, Message } from '@element-plus/icons-vue'
    import { useUserStore } from '@/store/User.ts'
    import { useRouter } from 'vue-router'
    import { forgetPassword, login, sendVerifyCode } from '@/api/auth.ts'
    import { useCountdown } from '@/hooks/useCountdown.ts'
    import validator from 'validator'

    const router = useRouter()
    const userStore = useUserStore()
    const buttonLoading = ref(false)
    const formRef = ref<FormInstance | null>(null)

    const form = ref({
        email: '',
        password: '',
    })

    // forgetPassword - start

    const forgetPasswordDialogVisible = ref(false)
    const forgetPasswordFormRef = ref<FormInstance | null>(null)
    const forgetPasswordVerityCodeSending = ref(false)
    const forgetPasswordButtonLoading = ref(false)
    const { start: forgetPasswordStartCount, countdown: forgetPasswordCountdownNumber } =
        useCountdown()
    const forgetPasswordForm = ref({
        email: '',
        verifyCode: '',
        password: '',
        confirmPassword: '',
    })

    async function forgetPasswordVerifyCodeButton() {
        forgetPasswordVerityCodeSending.value = true
        if (!forgetPasswordForm.value.email) {
            ElMessage.error({ message: '请输入邮箱' })
            forgetPasswordVerityCodeSending.value = false
            return
        }
        if (!validator.isEmail(forgetPasswordForm.value.email)) {
            ElMessage.error({ message: '邮箱格式不正确' })
            forgetPasswordVerityCodeSending.value = false
            return
        }
        const result = await sendVerifyCode(forgetPasswordForm.value.email, 'forgetPassword')
        if (result.success) {
            ElMessage.success({ message: result.message })
            forgetPasswordVerityCodeSending.value = false
            forgetPasswordStartCount()
        } else {
            ElMessage.error({ message: result.message })
            forgetPasswordVerityCodeSending.value = false
        }
        return
    }
    function forgetPasswordSubmitForm() {
        if (!forgetPasswordFormRef.value) return
        forgetPasswordButtonLoading.value = true
        forgetPasswordFormRef.value.validate(async (valid: boolean) => {
            if (valid) {
                console.log('验证成功')
                const res = await forgetPassword(
                    forgetPasswordForm.value.email,
                    forgetPasswordForm.value.verifyCode,
                    forgetPasswordForm.value.password,
                )
                if (res.success) {
                    ElMessage({
                        type: 'success',
                        message: res.message,
                    })
                } else {
                    ElMessage({
                        type: 'error',
                        message: res.message,
                    })
                }
            } else {
                console.log('验证失败')
            }
            forgetPasswordButtonLoading.value = false
            setTimeout(() => {
                forgetPasswordDialogVisible.value = false
            }, 500)
        })
    }

    const forgetPasswordCheckPassword = (
        rule: FormItemRule,
        value: string,
        callback: (error?: Error) => void,
    ) => {
        if (!value) {
            callback(new Error('请输入密码'))
            return
        }
        if (value !== forgetPasswordForm.value.password) {
            callback(new Error('密码不匹配'))
        } else {
            callback()
        }
    }

    const forgetPasswordRules = {
        email: [
            { required: true, message: '请输入邮箱地址', trigger: 'blur' },
            {
                type: 'email',
                message: '请输入正确的邮箱格式',
                trigger: ['blur'],
            },
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        confirmPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: forgetPasswordCheckPassword, trigger: 'blur' },
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

    // forgetPassword - end

    const rules = {
        email: [
            { required: true, message: '请输入邮箱地址', trigger: 'blur' },
            {
                type: 'email',
                message: '请输入正确的邮箱格式',
                trigger: ['blur'],
            },
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    }

    const submitForm = async () => {
        if (!formRef.value) return
        buttonLoading.value = true
        formRef.value.validate(async (valid: boolean) => {
            if (valid) {
                console.log('验证成功')
                const res = await login(form.value.email, form.value.password)
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
    .loginPage {
        padding: 30px;
        width: 25em;
        height: auto;
        border: 1px solid var(--el-border-color);
        border-radius: var(--el-border-radius-round);
        box-shadow: var(--el-box-shadow-dark);
    }
</style>
