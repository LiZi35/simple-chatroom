<template>
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
            <el-text style="display: block; text-align: center; margin-top: 1em">
                没有账号？
                <router-link to="register"><el-link type="primary"> 去注册 </el-link></router-link>
            </el-text>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { ref } from 'vue'
    import { ElMessage, type FormInstance } from 'element-plus'
    import { Lock, Message } from '@element-plus/icons-vue'
    import { useUserStore } from '@/store/User.ts'
    import { useRouter } from 'vue-router'
    import { login } from '@/api/auth.ts'

    const router = useRouter()
    const userStore = useUserStore()
    const buttonLoading = ref(false)

    const formRef = ref<FormInstance>()

    const form = ref({
        email: '',
        password: '',
    })

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
