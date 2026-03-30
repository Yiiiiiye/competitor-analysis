<template>
  <div class="history-page">
    <h2 class="page-title">历史周报管理</h2>
    <div class="filter-bar">
      <div class="filter-item">
        <label>时间筛选：</label>
        <select id="historyFilterTime" v-model="filterTimeRange">
          <option value="all">全部</option>
          <option value="month">近一个月</option>
          <option value="quarter">近三个月</option>
        </select>
      </div>
      <div class="filter-item">
        <button class="btn btn-primary" @click="filterHistoryReport">筛选</button>
      </div>
    </div>
    
    <div v-if="loading" style="text-align:center; padding:20px;">加载中...</div>
    <div v-else-if="reports.length === 0" style="text-align:center; padding:20px;">暂无历史周报</div>
    <div v-else class="history-list" id="historyReportList">
      <div class="history-item" v-for="report in reports" :key="report.id">
        <div>
          <div class="name">{{ report.title }}</div>
          <div class="time">创建时间：{{ formatDate(report.createTime) }}</div>
        </div>
        <div>
          <button class="btn btn-primary operate-btn" @click="editReport(report)">编辑</button>
          <button class="btn btn-danger operate-btn" @click="openDeleteModal(report.id)">删除</button>
          <button class="btn btn-default operate-btn" @click="exportReport(report)">导出</button>
        </div>
      </div>
    </div>
    
    <!-- 编辑弹窗 -->
    <div class="modal" v-if="showEditModal" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <span class="modal-close" @click="closeEditModal">&times;</span>
        <h3 class="modal-title">编辑周报</h3>
        <div class="modal-body">
          <div class="form-item">
            <label for="editReportTitle">周报标题：</label>
            <input type="text" id="editReportTitle" v-model="editFormData.title" required>
          </div>
          <div class="form-item">
            <label for="editReportSummary">本周核心总结：</label>
            <textarea id="editReportSummary" v-model="editFormData.content.summary" placeholder="请输入本周竞品动态核心总结..."></textarea>
          </div>
          <div class="form-item">
            <label for="editReportCompetitorDynamic">各竞品关键动态：</label>
            <textarea id="editReportCompetitorDynamic" v-model="editFormData.content.competitorDynamic" placeholder="按竞品分类梳理关键动态..."></textarea>
          </div>
          <div class="form-item">
            <label for="editReportRiskAnalysis">机会与风险分析：</label>
            <textarea id="editReportRiskAnalysis" v-model="editFormData.content.riskAnalysis" placeholder="分析竞品动态带来的机会与风险..."></textarea>
          </div>
          <div class="form-item">
            <label for="editReportSuggestion">后续建议：</label>
            <textarea id="editReportSuggestion" v-model="editFormData.content.suggestion" placeholder="基于竞品动态给出后续行动建议..."></textarea>
          </div>
        </div>
        <div class="modal-btns">
          <button class="btn btn-default" @click="closeEditModal">取消</button>
          <button class="btn btn-primary" @click="saveEditedReport" :disabled="saving">
            {{ saving ? '保存中...' : '保存' }}
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
          <p>确定要删除该周报吗？</p>
        </div>
        <div class="modal-btns">
          <button class="btn btn-default" @click="closeDeleteModal">取消</button>
          <button class="btn btn-danger" @click="deleteReport" :disabled="deleting">
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
import { useReportStore } from '../stores';

const reportStore = useReportStore();

const reports = ref<any[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const currentReportId = ref('');
const alertMessage = ref('');
const alertType = ref('alert-success');

// 筛选条件
const filterTimeRange = ref('all');

const editFormData = ref({
  title: '',
  content: {
    summary: '',
    competitorDynamic: '',
    riskAnalysis: '',
    suggestion: ''
  }
});

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// 筛选历史周报
const filterHistoryReport = async () => {
  await loadReports();
};

// 加载周报列表
const loadReports = async () => {
  loading.value = true;
  try {
    const timeRange = filterTimeRange.value === 'all' ? undefined : filterTimeRange.value;
    await reportStore.getReports(timeRange);
    reports.value = reportStore.reports;
  } catch (error) {
    console.error('获取周报列表失败:', error);
    showAlert('获取周报列表失败，请稍后重试', 'danger');
  } finally {
    loading.value = false;
  }
};

// 编辑周报
const editReport = (report: any) => {
  currentReportId.value = report.id;
  editFormData.value = {
    title: report.title,
    content: {
      summary: report.content.summary || '',
      competitorDynamic: report.content.competitorDynamic || '',
      riskAnalysis: report.content.riskAnalysis || '',
      suggestion: report.content.suggestion || ''
    }
  };
  showEditModal.value = true;
};

// 关闭编辑弹窗
const closeEditModal = () => {
  showEditModal.value = false;
};

// 保存编辑后的周报
const saveEditedReport = async () => {
  if (!editFormData.value.title) {
    showAlert('周报标题不能为空！', 'danger');
    return;
  }
  
  saving.value = true;
  
  try {
    const success = await reportStore.updateReport(currentReportId.value, {
      title: editFormData.value.title,
      createTime: new Date().toISOString(),
      content: editFormData.value.content
    });
    
    if (success) {
      showAlert('周报编辑成功！', 'success');
      closeEditModal();
      await loadReports();
    } else {
      showAlert('编辑失败，请稍后重试', 'danger');
    }
  } catch (error) {
    console.error('编辑周报失败:', error);
    showAlert('编辑失败，请稍后重试', 'danger');
  } finally {
    saving.value = false;
  }
};

// 显示删除弹窗
const openDeleteModal = (id: string) => {
  currentReportId.value = id;
  showDeleteModal.value = true;
};

// 关闭删除弹窗
const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

// 删除周报
const deleteReport = async () => {
  deleting.value = true;
  
  try {
    const success = await reportStore.deleteReport(currentReportId.value);
    if (success) {
      showAlert('周报删除成功！', 'success');
      closeDeleteModal();
      await loadReports();
    } else {
      showAlert('删除失败，请稍后重试', 'danger');
    }
  } catch (error) {
    console.error('删除周报失败:', error);
    showAlert('删除失败，请稍后重试', 'danger');
  } finally {
    deleting.value = false;
  }
};

// 导出周报
const exportReport = (report: any) => {
  const summary = report.content.summary || '';
  const competitorDynamic = report.content.competitorDynamic || '';
  const riskAnalysis = report.content.riskAnalysis || '';
  const suggestion = report.content.suggestion || '';
  
  // 生成文本内容
  const reportContent = `
${report.title}
==========
创建时间：${formatDate(report.createTime)}

一、本周核心总结
${summary}

二、各竞品关键动态
${competitorDynamic}

三、机会与风险分析
${riskAnalysis}

四、后续建议
${suggestion}
  `.trim();
  
  // 创建下载链接
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.title}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  showAlert('周报导出成功！', 'success');
};

// 显示提示
const showAlert = (message: string, type: 'success' | 'danger') => {
  alertMessage.value = message;
  alertType.value = `alert-${type}`;
  setTimeout(() => {
    alertMessage.value = '';
  }, 3000);
};

onMounted(() => {
  loadReports();
});
</script>

<style scoped>
.history-page {
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

.history-list {
  margin-top: 20px;
}

.history-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item .name {
  font-weight: 500;
}

.history-item .time {
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
  width: 600px;
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
.form-item textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-item input:focus,
.form-item textarea:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-item textarea {
  min-height: 80px;
  resize: vertical;
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
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .history-item div:last-child {
    align-self: flex-end;
  }
}
</style>
