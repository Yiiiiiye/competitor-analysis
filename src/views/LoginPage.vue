<template>
  <div class="login-page">
    <h2 class="page-title">登录 / 注册</h2>
    <div class="login-form">
      <div class="form-item">
        <label for="username">账号</label>
        <input type="text" id="username" v-model="username" placeholder="请输入账号">
      </div>
      <div class="form-item">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="password" placeholder="请输入密码">
      </div>
      <div class="login-btns">
        <button class="btn btn-primary" @click="login" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <button class="btn btn-default" @click="register" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </div>
    </div>
    <div class="wechat-login">
      <button class="btn btn-success" @click="wechatLogin" :disabled="loading">
        {{ loading ? '登录中...' : '微信快捷登录' }}
      </button>
    </div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const login = async () => {
  if (!username.value || !password.value) {
    error.value = '账号和密码不能为空！';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  const success = await userStore.login(username.value, password.value);
  if (success) {
    router.push('/dashboard');
  } else {
    error.value = '登录失败，请检查账号和密码';
  }
  
  loading.value = false;
};

const register = async () => {
  if (!username.value || !password.value) {
    error.value = '账号和密码不能为空！';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  const success = await userStore.register(username.value, password.value);
  if (success) {
    error.value = '注册成功，请登录';
  } else {
    error.value = '注册失败，请稍后重试';
  }
  
  loading.value = false;
};

const wechatLogin = async () => {
  loading.value = true;
  error.value = '';
  
  const success = await userStore.wechatLogin();
  if (success) {
    router.push('/dashboard');
  } else {
    error.value = '微信登录失败，请稍后重试';
  }
  
  loading.value = false;
};
</script>

<style scoped>
.login-page {
  text-align: center;
  padding: 50px 0;
  max-width: 500px;
  margin: 50px auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  padding: 40px;
}

.login-form {
  margin-top: 30px;
  text-align: left;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-item input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-item input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.login-btns {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.wechat-login {
  margin-top: 20px;
  text-align: center;
}

.alert {
  padding: 10px;
  border-radius: 4px;
  margin-top: 20px;
  font-size: 14px;
}

.alert-danger {
  background-color: #fff2f0;
  color: #f56c6c;
  border: 1px solid #ffccc7;
}
</style>
