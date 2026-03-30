<template>
  <div class="dashboard-page">
    <h2 class="page-title">首页 / 仪表盘</h2>
    <div class="alert alert-danger" v-if="error" style="display: block;">{{ error }}</div>
    <div class="dashboard">
      <div class="overview-card">
        <h3>本周概览</h3>
        <div class="overview-item">• 本周新增功能：<span id="weekNewFunc">{{ weekNewFunc }}</span>个</div>
        <div class="overview-item">• 重大改动：<span id="weekMajorChange">{{ weekMajorChange }}</span>个</div>
        <div class="overview-item">• 关键机会/风险：<span id="weekRiskTip">{{ weekRiskTip }}</span></div>
      </div>
      <div class="dynamic-list">
        <h3>高优先级竞品动态</h3>
        <div v-if="loading" style="text-align:center; padding:20px;">加载中...</div>
        <div v-else-if="highPriorityDynamics.length === 0" style="text-align:center; padding:20px;">暂无高优先级竞品动态</div>
        <div v-else class="dynamic-item" v-for="item in highPriorityDynamics" :key="item.id">
          <div class="title">{{ item.title }}</div>
          <div class="info">渠道：{{ item.channel }} | 发布时间：{{ formatDate(item.publishTime) }} | 核心改动：{{ item.content }}</div>
        </div>
      </div>
    </div>
    <div class="generate-btn">
      <button class="btn btn-primary" style="font-size: 16px; padding: 10px 24px;" @click="goToReport">一键生成周报</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCompetitorStore, useDynamicStore } from '../stores';

const router = useRouter();
const competitorStore = useCompetitorStore();
const dynamicStore = useDynamicStore();

const loading = ref(false);
const error = ref('');

// 计算本周数据
const weekNewFunc = ref(0);
const weekMajorChange = ref(0);
const weekRiskTip = ref('暂无');

// 高优先级竞品动态
const highPriorityDynamics = ref<any[]>([]);

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// 跳转到周报生成页面
const goToReport = () => {
  router.push('/report');
};

// 初始化数据
const initData = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // 获取竞品列表
    await competitorStore.getCompetitors();
    // 获取动态列表
    await dynamicStore.getDynamics();
    
    // 计算本周数据
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weekDynamics = dynamicStore.dynamics.filter(item => {
      const publishDate = new Date(item.publishTime);
      return publishDate >= weekStart;
    });
    
    weekNewFunc.value = weekDynamics.length;
    weekMajorChange.value = weekDynamics.filter(item => item.content.includes('重大') || item.content.includes('迭代')).length;
    weekRiskTip.value = weekDynamics.length > 0 ? '竞品均有功能更新，建议重点关注' : '暂无';
    
    // 筛选高优先级竞品的动态
    const highPriorityCompetitorIds = competitorStore.competitors
      .filter(c => c.priority === '高')
      .map(c => c.id);
    
    highPriorityDynamics.value = dynamicStore.dynamics.filter(d => highPriorityCompetitorIds.includes(d.competitorId));
  } catch (err) {
    error.value = '数据加载失败，请稍后重试';
    console.error('初始化数据失败:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  initData();
});
</script>

<style scoped>
.dashboard-page {
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

.dashboard {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.overview-card {
  flex: 1;
  min-width: 300px;
  background-color: #e6f7ff;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.overview-card h3 {
  margin-bottom: 15px;
  color: #409eff;
}

.overview-item {
  margin-bottom: 10px;
  font-size: 14px;
}

.dynamic-list {
  flex: 2;
  min-width: 300px;
}

.dynamic-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.3s;
}

.dynamic-item:hover {
  background-color: #f8f9fa;
}

.dynamic-item .title {
  font-weight: 500;
  margin-bottom: 5px;
}

.dynamic-item .info {
  font-size: 12px;
  color: #666;
}

.generate-btn {
  text-align: center;
  margin-top: 30px;
}

.alert {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-danger {
  background-color: #fff2f0;
  color: #f56c6c;
  border: 1px solid #ffccc7;
}

@media (max-width: 768px) {
  .dashboard {
    flex-direction: column;
  }
}
</style>
