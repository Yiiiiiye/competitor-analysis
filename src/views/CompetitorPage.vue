<template>
  <div class="competitor-page">
    <h2 class="page-title">竞品管理</h2>
    <div class="add-btn-container">
      <button class="btn btn-success" @click="openAddModal">添加竞品</button>
    </div>
    <div v-if="loading" style="text-align:center; padding:20px;">加载中...</div>
    <div v-else-if="competitors.length === 0" style="text-align:center; padding:20px;">暂无竞品数据</div>
    <div v-else class="table-container">
      <div class="batch-actions">
        <button class="btn btn-primary" @click="fetchAllCompetitors" :disabled="fetching">
          {{ fetching ? '抓取中...' : '一键抓取所有竞品' }}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>竞品名称</th>
            <th>核心业务</th>
            <th>监测渠道</th>
            <th>优先级</th>
            <th>自动抓取</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="competitor in competitors" :key="competitor.id">
            <td>{{ competitor.name }}</td>
            <td>{{ competitor.business }}</td>
            <td>{{ competitor.channels }}</td>
            <td>{{ competitor.priority }}</td>
            <td>
              <span v-if="competitor.autoFetchEnabled" class="badge badge-success">已启用</span>
              <span v-else class="badge badge-default">未启用</span>
            </td>
            <td>
              <button class="btn btn-success operate-btn" @click="fetchCompetitor(competitor.id)" :disabled="fetching">
                抓取
              </button>
              <button class="btn btn-primary operate-btn" @click="openEditModal(competitor)">编辑</button>
              <button class="btn btn-danger operate-btn" @click="openDeleteModal(competitor.id)">删除</button>
              <button class="btn btn-default operate-btn" @click="goToDynamic(competitor.id)">查看动态</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 添加/编辑弹窗 -->
    <div class="modal" v-if="showModal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <span class="modal-close" @click="closeModal">&times;</span>
        <h3 class="modal-title">{{ isEditing ? '编辑竞品' : '添加竞品' }}</h3>
        <div class="modal-body">
          <div class="form-item">
            <label for="competitorName">竞品名称：</label>
            <input type="text" id="competitorName" v-model="formData.name" placeholder="请输入竞品名称" required>
          </div>
          <div class="form-item">
            <label for="competitorBusiness">核心业务：</label>
            <input type="text" id="competitorBusiness" v-model="formData.business" placeholder="请输入核心业务描述">
          </div>
          <div class="form-item">
            <label for="competitorChannels">监测渠道：</label>
            <input type="text" id="competitorChannels" v-model="formData.channels" placeholder="多个渠道用逗号分隔">
          </div>
          <div class="form-item">
            <label for="competitorPriority">优先级：</label>
            <select id="competitorPriority" v-model="formData.priority">
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </select>
          </div>
          <div class="form-item">
            <label>
              <input type="checkbox" v-model="formData.autoFetchEnabled">
              启用自动抓取
            </label>
          </div>
          <div v-if="formData.autoFetchEnabled" class="social-accounts-section">
            <h4>社交媒体账号配置</h4>
            <div class="social-account-item">
              <label>微博</label>
              <div class="social-account-config">
                <input type="checkbox" v-model="formData.socialAccounts.weibo.enabled">
                <input type="text" v-model="formData.socialAccounts.weibo.accountId" placeholder="微博账号ID">
              </div>
            </div>
            <div class="social-account-item">
              <label>抖音</label>
              <div class="social-account-config">
                <input type="checkbox" v-model="formData.socialAccounts.douyin.enabled">
                <input type="text" v-model="formData.socialAccounts.douyin.accountId" placeholder="抖音账号ID">
              </div>
            </div>
            <div class="social-account-item">
              <label>小红书</label>
              <div class="social-account-config">
                <input type="checkbox" v-model="formData.socialAccounts.xiaohongshu.enabled">
                <input type="text" v-model="formData.socialAccounts.xiaohongshu.accountId" placeholder="小红书账号ID">
              </div>
            </div>
            <div class="social-account-item">
              <label>B站</label>
              <div class="social-account-config">
                <input type="checkbox" v-model="formData.socialAccounts.bilibili.enabled">
                <input type="text" v-model="formData.socialAccounts.bilibili.accountId" placeholder="B站账号ID">
              </div>
            </div>
          </div>
        </div>
        <div class="modal-btns">
          <button class="btn btn-default" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveCompetitor" :disabled="saving">
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
          <p>确定要删除该竞品吗？删除后相关动态也会被移除！</p>
        </div>
        <div class="modal-btns">
          <button class="btn btn-default" @click="closeDeleteModal">取消</button>
          <button class="btn btn-danger" @click="deleteCompetitor" :disabled="deleting">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="alert" :class="alertType" v-if="alertMessage" style="display: block;">{{ alertMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCompetitorStore } from '../stores';
import axios from 'axios';

const router = useRouter();
const competitorStore = useCompetitorStore();

const competitors = ref<any[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const fetching = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const currentCompetitorId = ref('');
const alertMessage = ref('');
const alertType = ref('alert-success');

const formData = ref({
  name: '',
  business: '',
  channels: '官网,公众号,小红书',
  priority: '中',
  autoFetchEnabled: false,
  socialAccounts: {
    weibo: { enabled: false, accountId: '' },
    douyin: { enabled: false, accountId: '' },
    xiaohongshu: { enabled: false, accountId: '' },
    bilibili: { enabled: false, accountId: '' }
  }
});

// 显示添加弹窗
const openAddModal = () => {
  isEditing.value = false;
  currentCompetitorId.value = '';
  formData.value = {
    name: '',
    business: '',
    channels: '官网,公众号,小红书',
    priority: '中',
    autoFetchEnabled: false,
    socialAccounts: {
      weibo: { enabled: false, accountId: '' },
      douyin: { enabled: false, accountId: '' },
      xiaohongshu: { enabled: false, accountId: '' },
      bilibili: { enabled: false, accountId: '' }
    }
  };
  showModal.value = true;
};

// 显示编辑弹窗
const openEditModal = (competitor: any) => {
  isEditing.value = true;
  currentCompetitorId.value = competitor.id;
  formData.value = {
    name: competitor.name,
    business: competitor.business,
    channels: competitor.channels,
    priority: competitor.priority,
    autoFetchEnabled: competitor.autoFetchEnabled || false,
    socialAccounts: competitor.socialAccounts || {
      weibo: { enabled: false, accountId: '' },
      douyin: { enabled: false, accountId: '' },
      xiaohongshu: { enabled: false, accountId: '' },
      bilibili: { enabled: false, accountId: '' }
    }
  };
  showModal.value = true;
};

// 关闭弹窗
const closeModal = () => {
  showModal.value = false;
};

// 显示删除弹窗
const openDeleteModal = (id: string) => {
  currentCompetitorId.value = id;
  showDeleteModal.value = true;
};

// 关闭删除弹窗
const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

// 保存竞品
const saveCompetitor = async () => {
  if (!formData.value.name) {
    showAlert('竞品名称不能为空！', 'danger');
    return;
  }
  
  saving.value = true;
  
  try {
    let success;
    if (isEditing.value) {
      success = await competitorStore.updateCompetitor(currentCompetitorId.value, formData.value);
    } else {
      success = await competitorStore.addCompetitor(formData.value);
    }
    
    if (success) {
      showAlert(isEditing.value ? '竞品编辑成功！' : '竞品添加成功！', 'success');
      closeModal();
      await competitorStore.getCompetitors();
    } else {
      showAlert('操作失败，请稍后重试', 'danger');
    }
  } catch (error) {
    console.error('保存竞品失败:', error);
    showAlert('操作失败，请稍后重试', 'danger');
  } finally {
    saving.value = false;
  }
};

// 删除竞品
const deleteCompetitor = async () => {
  deleting.value = true;
  
  try {
    const success = await competitorStore.deleteCompetitor(currentCompetitorId.value);
    if (success) {
      showAlert('竞品删除成功！', 'success');
      closeDeleteModal();
      await competitorStore.getCompetitors();
    } else {
      showAlert('删除失败，请稍后重试', 'danger');
    }
  } catch (error) {
    console.error('删除竞品失败:', error);
    showAlert('删除失败，请稍后重试', 'danger');
  } finally {
    deleting.value = false;
  }
};

// 跳转到动态页面
const goToDynamic = (competitorId: string) => {
  router.push({ path: '/dynamic', query: { competitorId } });
};

// 抓取单个竞品
const fetchCompetitor = async (competitorId: string) => {
  fetching.value = true;
  try {
    const response = await axios.post(`http://localhost:5000/api/crawler/fetch/${competitorId}`);
    if (response.data.success) {
      showAlert(response.data.message, 'success');
    } else {
      showAlert('抓取失败，请稍后重试', 'danger');
    }
  } catch (error) {
    console.error('抓取失败:', error);
    showAlert('抓取失败，请稍后重试', 'danger');
  } finally {
    fetching.value = false;
  }
};

// 批量抓取所有竞品
const fetchAllCompetitors = async () => {
  fetching.value = true;
  try {
    const response = await axios.post('http://localhost:5000/api/crawler/fetch-all');
    if (response.data.success) {
      showAlert(response.data.message, 'success');
    } else {
      showAlert('批量抓取失败，请稍后重试', 'danger');
    }
  } catch (error) {
    console.error('批量抓取失败:', error);
    showAlert('批量抓取失败，请稍后重试', 'danger');
  } finally {
    fetching.value = false;
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
    await competitorStore.getCompetitors();
    competitors.value = competitorStore.competitors;
  } catch (error) {
    console.error('获取竞品列表失败:', error);
    showAlert('获取竞品列表失败，请稍后重试', 'danger');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  initData();
});
</script>

<style scoped>
.competitor-page {
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

.add-btn-container {
  text-align: right;
  margin-bottom: 20px;
}

.table-container {
  margin-top: 20px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th,
td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 500;
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
.form-item select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-item input:focus,
.form-item select:focus {
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

.batch-actions {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.badge-success {
  background-color: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b7eb8f;
}

.badge-default {
  background-color: #f5f5f5;
  color: #909399;
  border: 1px solid #dcdfe6;
}

.social-accounts-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.social-accounts-section h4 {
  margin-bottom: 15px;
  color: #409eff;
}

.social-account-item {
  margin-bottom: 15px;
}

.social-account-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.social-account-config {
  display: flex;
  align-items: center;
  gap: 10px;
}

.social-account-config input[type="checkbox"] {
  width: auto;
}

.social-account-config input[type="text"] {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
</style>
