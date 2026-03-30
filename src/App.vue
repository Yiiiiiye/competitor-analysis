<template>
  <div class="app">
    <!-- 顶部导航栏 -->
    <nav class="navbar" v-if="isLoggedIn">
      <div class="container">
        <div class="navbar-logo">竞品更新轻量聚合周报</div>
        <ul class="navbar-menu">
          <li><router-link to="/dashboard">首页</router-link></li>
          <li><router-link to="/competitor">竞品管理</router-link></li>
          <li><router-link to="/dynamic">动态列表</router-link></li>
          <li><router-link to="/report">周报生成</router-link></li>
          <li><router-link to="/history">历史周报</router-link></li>
          <li><router-link to="/setting">设置</router-link></li>
          <li><a href="javascript:void(0)" @click="logout">退出登录</a></li>
        </ul>
      </div>
    </nav>

    <!-- 路由视图 -->
    <div class="container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores';

const router = useRouter();
const userStore = useUserStore();

const isLoggedIn = computed(() => userStore.isLogin);

const logout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", Arial, sans-serif;
}

body {
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
}

.container {
  width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 顶部导航栏样式 */
.navbar {
  background-color: #409eff;
  color: #fff;
  padding: 15px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-logo {
  font-size: 20px;
  font-weight: bold;
}

.navbar-menu {
  display: flex;
  list-style: none;
}

.navbar-menu li {
  margin-left: 30px;
}

.navbar-menu a {
  color: #fff;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s;
}

.navbar-menu a:hover {
  color: #e6f7ff;
  text-decoration: underline;
}

/* 通用按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #409eff;
  color: #fff;
}

.btn-primary:hover {
  background-color: #3088e0;
}

.btn-success {
  background-color: #67c23a;
  color: #fff;
}

.btn-success:hover {
  background-color: #5aa72f;
}

.btn-danger {
  background-color: #f56c6c;
  color: #fff;
}

.btn-danger:hover {
  background-color: #e45656;
}

.btn-default {
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
}

.btn-default:hover {
  background-color: #f5f5f5;
}

/* 页面通用样式 */
.page {
  background-color: #fff;
  border-radius: 8px;
  padding: 25px;
  margin-top: 20px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 22px;
  margin-bottom: 20px;
  color: #409eff;
  border-bottom: 2px solid #e6f7ff;
  padding-bottom: 10px;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .container {
    width: 100%;
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .navbar-menu {
    overflow-x: auto;
    padding-bottom: 5px;
  }

  .navbar-menu li {
    margin-left: 15px;
    white-space: nowrap;
  }
}
</style>
