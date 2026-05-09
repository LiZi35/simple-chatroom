<template>
    <div style="background-color: #f5f7fa">
        <div class="loginPage">
            <h2 style="text-align: center">欢迎登录</h2>
            <br />
            <el-form ref="formRef" :model="form" label-width="auto" :rules="rules">
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" :prefix-icon="Message" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" :prefix-icon="Lock" type="password" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" style="width: 100%; height: 3em" @click="submitForm">
                        登录
                    </el-button>
                </el-form-item>
            </el-form>
            <el-text style="display: block; text-align: center; margin-top: 1em">
                没有账号？<el-link type="primary" @click="$router.push('/register')"
                    >去注册</el-link
                >
            </el-text>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { ref } from 'vue'
    import type { FormInstance } from 'element-plus'
    import { Lock, Message } from '@element-plus/icons-vue'

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
        // 确保表单实例已经挂载
        if (!formRef.value) return

        formRef.value.validate((valid, fields) => {
            if (valid) {
                console.log('表单验证通过，准备提交:', form.value)
                // todo:提交逻辑
            } else {
                console.log('表单验证未通过', fields)
            }
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
