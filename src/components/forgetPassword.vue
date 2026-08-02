<template>
    <el-form
        ref="forgetPasswordFormRef"
        :model="forgetPasswordForm"
        label-width="80"
        :rules="forgetPasswordRules"
    >
        <el-form-item label="邮箱" prop="email" :error="serverError.email">
            <el-input
                v-model="forgetPasswordForm.email"
                :prefix-icon="Message"
                @input="clearServerError('email')"
            />
        </el-form-item>
        <el-form-item label="验证码" prop="verifyCode" :error="serverError.verifyCode">
            <el-input
                v-model="forgetPasswordForm.verifyCode"
                :prefix-icon="CircleCheck"
                style="width: 70%"
                @input="clearServerError('verifyCode')"
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
        <el-form-item label="密码" prop="password" :error="serverError.newPassword">
            <el-input
                v-model="forgetPasswordForm.password"
                :prefix-icon="Lock"
                type="password"
                @input="clearServerError('newPassword')"
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
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { ElMessage, type FormInstance, type FormItemRule } from 'element-plus'
    import { useCountdown } from '@/hooks/useCountdown.ts'
    import { type ApiValidationError, forgetPassword, sendVerifyCode } from '@/api/auth.ts'
    import { CircleCheck, Lock, Message } from '@element-plus/icons-vue'
    import validator from 'validator'

    // const forgetPasswordDialogVisible = ref(false)
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

    const serverError = ref<Record<string, string>>({})

    function clearServerError(key?: string) {
        if (!key) {
            Object.keys(serverError).forEach((key) => {
                delete serverError.value[key]
            })
            return
        }
        delete serverError.value[key]
    }
    function applyServerError(issues: ApiValidationError[]) {
        clearServerError()
        const errors = issues.map((issue) => ({
            field: issue.path.map(String).join('.'),
            code: issue.code,
            message: issue.message,
        }))
        errors.forEach((error) => {
            if (error.field && !serverError.value[error.field]) {
                serverError.value[error.field] = error.message
            }
        })
    }

    defineProps({})
    defineExpose({
        forgetPasswordSubmitForm,
        forgetPasswordButtonLoading,
    })
    const forgetPasswordDialogVisible = defineModel<boolean>()

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
            if (result.issues) {
                applyServerError(result.issues)
            }
            if (!result.issues) {
                ElMessage({
                    type: 'error',
                    message: result.message,
                })
            }
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
                    setTimeout(() => {
                        forgetPasswordDialogVisible.value = false
                    }, 500)
                } else {
                    if (res.issues) {
                        applyServerError(res.issues)
                    }
                    if (!res.issues) {
                        ElMessage({
                            type: 'error',
                            message: res.message,
                        })
                    }
                }
                forgetPasswordButtonLoading.value = false
            } else {
                console.log('验证失败')
            }
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
</script>

<style scoped></style>
