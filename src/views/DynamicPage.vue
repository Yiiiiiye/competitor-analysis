<template>
  <div class="dynamic-page">
    <h2 class="page-title">竞品动态列表</h2>
    <div class="filter-bar">
      <div class="filter-item">
        <label>选择竞品：</label>
        <select id="dynamicFilterCompetitor" v-model="filterCompetitorId">
          <option value="all">全部竞品</option>
          <option v-for="competitor in competitors" :key="competitor.id" :value="competitor.id">
            {{ competitor.name }}
          </option>
        </select>
      </div>
      <div class="filter-item">
        <label>发布时间：</label>
        <select id="dynamicFilterTime" v-model="filterTimeRange">
          <option value="all">全部时间</option>
          <option value="week">近一周</option>
          <option value="month">近一个月</option>
        </select>
      </div>
      <div class="filter-item">
        <button class="btn btn-primary" @click="filterDynamic">筛选</button>
        <button class="btn btn-default" @click="resetDynamicFilter">重置</button>
      </div>
      <div class="filter-item" style="margin-left: auto;">
        <button class="btn btn-success" @click="openAddModal">添加动态</button>
      </div>
    </div>
    
    <div v-if="loading" style="text-align:center; padding:20px;">加载中...</div>
    <div v-else-if="dynamics.length === 0" style="text-align:center; padding:20px;">暂无动态数据</div>
    <div v-else class="dynamic-list-container">
      <div class="dynamic-item" v-for="item in dynamics" :key="item.id">
        <div class="title">{{ item.title }}</div>
        <div class="info">
          竞品：{{ item.competitor?.name || '未知竞品' }} | 渠道：{{ item.channel }} | 发布时间：{{ formatDate(item.publishTime) }}
        </div>
        <div style="margin-top:8px; font-size:14px;">{{ item.content }}</div>
        <div style="margin-top:8px;">
          <button class="btn btn-primary operate-btn" style="font-size:12px;" @click="openEditModal(item)">编辑</button>
          <button class="btn btn-danger operate-btn" style="font-size:12px;" @click="openDeleteModal(item.id)">删除</button>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑弹窗 -->
    <div class="modal" v-if="showModal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <span class="modal-close" @click="closeModal">&times;</span>
        <h3 class="modal-title">{{ isEditing ? '编辑竞品动态' : '添加竞品动态' }}</h3>
        <div class="modal-body">
          <div class="form-item">
            <label for="dynamicCompetitor">所属竞品：</label>
            <select id="dynamicCompetitor" v-model="formData.competitorId" required>
              <option v-for="competitor in competitors" :key="competitor.id" :value="competitor.id">
                {{ competitor.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label for="dynamicTitle">动态标题：</label>
            <input type="text" id="dynamicTitle" v-model="formData.title" placeholder="请输入动态标题" required>
          </div>
          <div class="form-item">
            <label for="dynamicChannel">发布渠道：</label>
            <input type="text" id="dynamicChannel" v-model="formData.channel" placeholder="如：官网公告、公众号" required>
          </div>
          <div class="form-item">
            <label for="dynamicTime">发布时间：</label>
            <input type="date" id="dynamicTime" v-model="formData.publishTime" :max="today" required>
          </div>
          <div class="form-item">
            <label for="dynamicContent">核心内容：</label>
            <textarea id="dynamicContent" v-model="formData.content" placeholder="请输入动态核心内容" style="width:100%; min-height:80px; padding:8px;"></textarea>
          </div>
        </div>
        <div class="modal-btns">
          <button class="btn btn-default" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveDynamic" :disabled="saving">
            {{ saving ? '保存中...' : '确认' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 删除确认弹窗 -->
    <div class="modal" v-if="showDeleteModal" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <span class="modal-close" @click="closeDeleteModal">&times;</span>
        <h3 class="modal-title">删除确认</h3>
        <div class="modal-body">
          <p>确定要删除该动态吗？</p>
        </div>
        <div class="modal-btns">
          <button class="btn btn-default" @click="closeDeleteModal">取消</button>
          <button class="btn btn-danger" @click="deleteDynamic" :disabled="deleting">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="alert" :class="alertType" v-if="alertMessage" style="display: block;">{{ alertMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCompetitorStore, useDynamicStore } from '../stores';

const route = useRoute();
const competitorStore = useCompetitorStore();
const dynamicStore = useDynamicStore();

const competitors = ref<any[]>([]);
const dynamics = ref<any[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const currentDynamicId = ref('');
const alertMessage = ref('');
const alertType = ref('alert-success');

// 筛选条件
const filterCompetitorId = ref('all');
const filterTimeRange = ref('all');

// 今天的日期
const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const formData = ref({
  competitorId: '',
  title: '',
  channel: '',
  publishTime: today.value as string,
  content: ''
});

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// 显示添加弹窗
const openAddModal = () => {
  if (competitors.value.length === 0) {
    showAlert('请先添加竞品！', 'danger');
    return;
  }
  
  isEditing.value = false;
  currentDynamicId.value = '';
  formData.value = {
    competitorId: competitors.value[0].id,
    title: '',
    channel: '',
    publishTime: today.value as string,
    content: ''
  };
  showModal.value = true;
};

// 显示编辑弹窗
const openEditModal = (dynamic: any) => {
  isEditing.value = true;
  currentDynamicId.value = dynamic.id;
  formData.value = {
    competitorId: dynamic.competitorId,
    title: dynamic.title,
    channel: dynamic.channel,
    publishTime: formatDate(dynamic.publishTime) as string,
    content: dynamic.content
  };
  showModal.value = true;
};

// 关闭弹窗
const closeModal = () => {
  showModal.value = false;
};

// 显示删除弹窗
const openDeleteModal = (id: string) => {
  currentDynamicId.value = id;
  showDeleteModal.value = true;
};

// 关闭删除弹窗
const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

// 保存动态
const saveDynamic = async () => {
  if (!formData.value.title || !formData.value.channel || !formData.value.publishTime) {
    showAlert('标题、渠道、时间不能为空！', 'danger');
    return;
  }
  
  saving.value = true;
  
  try {
    let success;
    if (isEditing.value) {
      success = await dynamicStore.updateDynamic(currentDynamicId.value, formData.value);
    } else {
      success = await dynamicStore.addDynamic(formData.value);
    }
    
    if (success) {
      showAlert(isEditing.value ? '动态编辑成功！' : '动态添加成功！', 'success');
      closeModal();
      await loadDynamics();
    } else {
      showAlert('操作失败，请稍后重试', 'danger');
    }
  } catch (error) {
    console.error('保存动态失败:', error);
    showAlert('操作失败，请稍后重试', 'danger');
  } finally {
    saving.value = false;
  }
};

// 删除动态
const deleteDynamic = async () => {
  deleting.value = true;
  
  try {
    const success = await dynamicStore.deleteDynamic(currentDynamicId.value);
    if (success) {
      showAlert('动态删除成功！', 'success');
      closeDeleteModal();
      await loadDynamics();
    } else {
      showAlert('删除失败，请稍后重试', 'danger');
    }
  } catch (error) {
    console.error('删除动态失败:', error);
    showAlert('删除失败，请稍后重试', 'danger');
  } finally {
    deleting.value = false;
  }
};

// 筛选动态
const filterDynamic = async () => {
  await loadDynamics();
};

// 重置筛选
const resetDynamicFilter = () => {
  filterCompetitorId.value = 'all';
  filterTimeRange.value = 'all';
  loadDynamics();
};

// 加载动态列表
const loadDynamics = async () => {
  loading.value = true;
  try {
    const competitorId = filterCompetitorId.value === 'all' ? undefined : filterCompetitorId.value;
    const timeRange = filterTimeRange.value === 'all' ? undefined : filterTimeRange.value;
    
    await dynamicStore.getDynamics(competitorId, timeRange);
    dynamics.value = dynamicStore.dynamics;
  } catch (error) {
    console.error('获取动态列表失败:', error);
    showAlert('获取动态列表失败，请稍后重试', 'danger');
  } finally {
    loading.value = false;
  }
};

// 显示提示
const showAlert = (message: string, type: 'success' | 'danger') => {
  alertMessage.value = message;
  alertType.value = `alert-${type}`;
  setTimeout(() => {
    alertMessage.value = '';
  }, 3000);
};

// 初始化数据
const initData = async () => {
  loading.value = true;
  try {
    // 获取竞品列表
    await competitorStore.getCompetitors();
    competitors.value = competitorStore.competitors;
    
    // 检查URL参数
    const competitorId = route.query.competitorId as string;
    if (competitorId) {
      filterCompetitorId.value = competitorId;
    }
    
    // 加载动态列表
    await loadDynamics();
  } catch (error) {
    console.error('初始化数据失败:', error);
    showAlert('初始化数据失败，请稍后重试', 'danger');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  initData();
});
</script>

<style scoped>
.dynamic-page {
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

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-item select:focus {
  outline: none;
  border-color: #409eff;
}

.dynamic-list-container {
  margin-top: 20px;
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

.operate-btn {
  margin-right: 8px;
  padding: 4px 8px;
  font-size: 12px;
}

/* 弹窗样式 */
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  width: 500px;
  border-radius: 8px;
  padding: 25px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.modal-title {
  font-size: 18px;
  margin-bottom: 20px;
  color: #409eff;
}

.modal-body {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-item input,
.form-item select,
.form-item textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-item input:focus,
.form-item select:focus,
.form-item textarea:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.modal-btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.alert {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-success {
  background-color: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b7eb8f;
}

.alert-danger {
  background-color: #fff2f0;
  color: #f56c6c;
  border: 1px solid #ffccc7;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
