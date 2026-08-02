<template>
    <el-dialog style="min-width: 30em" title="忘记密码" v-model="forgetPasswordDialogVisible">
        <forgetPassword ref="forgetPasswordRef" v-model="forgetPasswordDialogVisible" />
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="forgetPasswordDialogVisible = false">取消</el-button>
                <el-button
                    :loading="forgetPasswordRef?.forgetPasswordButtonLoading"
                    type="primary"
                    @click="forgetPasswordRef?.forgetPasswordSubmitForm"
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
                <el-form-item label="邮箱" prop="email" :error="serverError.email">
                    <el-input
                        v-model="form.email"
                        :prefix-icon="Message"
                        @input="clearServerError('email')"
                    />
                </el-form-item>
                <el-form-item label="密码" prop="password" :error="serverError.password">
                    <el-input
                        v-model="form.password"
                        :prefix-icon="Lock"
                        type="password"
                        @input="clearServerError('password')"
                    />
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
    import { ElMessage, type FormInstance } from 'element-plus'
    import { Lock, Message } from '@element-plus/icons-vue'
    import { useUserStore } from '@/store/User.ts'
    import { useRouter } from 'vue-router'
    import forgetPassword from '@/components/forgetPassword.vue'
    import { type ApiValidationError, login } from '@/api/auth.ts'

    const router = useRouter()
    const userStore = useUserStore()
    const buttonLoading = ref(false)
    const formRef = ref<FormInstance | null>(null)

    const forgetPasswordDialogVisible = ref(false)
    const forgetPasswordRef = ref<InstanceType<typeof forgetPassword>>()

    const form = ref({
        email: '',
        password: '',
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
