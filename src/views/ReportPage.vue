<template>
  <div class="report-page">
    <h2 class="page-title">周报生成与编辑</h2>
    <div class="filter-bar">
      <div class="filter-item">
        <label>周报周期：</label>
        <select id="reportWeekRange" v-model="reportWeekRange" @change="handleWeekRangeChange">
          <option value="latest">最新一周 (默认)</option>
          <option value="week">最近一周</option>
          <option value="month">最近一月</option>
          <option value="quarter">最近三月</option>
          <option value="custom">自定义周期</option>
        </select>
      </div>
      <div class="filter-item" id="customWeekRange" v-if="reportWeekRange === 'custom'">
        <label>开始时间：</label>
        <input type="date" id="reportStartDate" v-model="reportStartDate">
        <label style="margin-left: 10px;">结束时间：</label>
        <input type="date" id="reportEndDate" v-model="reportEndDate">
      </div>
    </div>
    <div class="report-editor">
      <div class="report-item">
        <h4>本周核心总结</h4>
        <textarea id="reportSummary" v-model="reportData.summary" placeholder="请输入本周竞品动态核心总结..."></textarea>
      </div>
      <div class="report-item">
        <h4>各竞品关键动态</h4>
        <textarea id="reportCompetitorDynamic" v-model="reportData.competitorDynamic" placeholder="按竞品分类梳理关键动态..."></textarea>
      </div>
      <div class="report-item">
        <h4>机会与风险分析</h4>
        <textarea id="reportRiskAnalysis" v-model="reportData.riskAnalysis" placeholder="分析竞品动态带来的机会与风险..."></textarea>
      </div>
      <div class="report-item">
        <h4>后续建议</h4>
        <textarea id="reportSuggestion" v-model="reportData.suggestion" placeholder="基于竞品动态给出后续行动建议..."></textarea>
      </div>
    </div>
    <div class="report-btns">
      <button class="btn btn-default" id="aiFillBtn" @click="aiFill" :disabled="aiFilling">
        {{ aiFilling ? 'AI填充中...' : 'AI辅助填充' }}
      </button>
      <button class="btn btn-default" id="saveDraftBtn" @click="saveDraft">保存草稿</button>
      <button class="btn btn-success" id="exportReportBtn" @click="exportReport">导出周报</button>
      <button class="btn btn-primary" id="saveReportBtn" @click="saveReport" :disabled="saving">
        {{ saving ? '保存中...' : '保存周报' }}
      </button>
    </div>
    
    <div class="alert" :class="alertType" v-if="alertMessage" style="display: block;">{{ alertMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useReportStore, useDynamicStore, useCompetitorStore } from '../stores';

const reportStore = useReportStore();
const dynamicStore = useDynamicStore();
const competitorStore = useCompetitorStore();

const reportWeekRange = ref('latest');
const reportStartDate = ref<string>('');
const reportEndDate = ref<string>('');
const aiFilling = ref(false);
const saving = ref(false);
const alertMessage = ref('');
const alertType = ref('alert-success');

const reportData = ref({
  summary: '',
  competitorDynamic: '',
  riskAnalysis: '',
  suggestion: ''
});

// 处理周报周期变更
const handleWeekRangeChange = () => {
  if (reportWeekRange.value === 'custom') {
    // 设置默认自定义日期范围（最近一周）
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    reportStartDate.value = startDate.toISOString().split('T')[0] as string;
    reportEndDate.value = endDate.toISOString().split('T')[0] as string;
  }
};

// AI辅助填充
const aiFill = async () => {
  aiFilling.value = true;
  
  try {
    let timeRange: string | undefined = reportWeekRange.value;
    if (timeRange === 'latest') {
      timeRange = 'week';
    } else if (timeRange === 'custom') {
      timeRange = undefined;
    }
    
    const result = await reportStore.generateAIReport(timeRange);
    
    if (result && result.success && result.data) {
      reportData.value.summary = result.data.summary || '';
      reportData.value.competitorDynamic = result.data.competitorDynamic || '';
      reportData.value.riskAnalysis = result.data.riskAnalysis || '';
      reportData.value.suggestion = result.data.suggestion || '';
      
      const meta = result.meta;
      const metaInfo = meta 
        ? `（基于${meta.competitorCount}个竞品、${meta.dynamicCount}条动态生成）`
        : '';
      
      showAlert(`AI生成完成！${metaInfo}`, 'success');
    } else {
      showAlert(result?.message || 'AI生成失败，请稍后重试', 'danger');
    }
  } catch (error) {
    console.error('AI生成失败:', error);
    showAlert('AI生成失败，请稍后重试', 'danger');
  } finally {
    aiFilling.value = false;
  }
};

// 保存草稿
const saveDraft = () => {
  localStorage.setItem('reportDraft', JSON.stringify({
    ...reportData.value,
    saveTime: new Date().toLocaleString()
  }));
  showAlert('草稿保存成功！', 'success');
};

// 导出周报
const exportReport = () => {
  const summary = reportData.value.summary;
  const competitorDynamic = reportData.value.competitorDynamic;
  const riskAnalysis = reportData.value.riskAnalysis;
  const suggestion = reportData.value.suggestion;
  
  // 生成文本内容
  const reportContent = `
竞品周报
==========
生成时间：${new Date().toLocaleString()}

一、本周核心总结
${summary || '暂无'}

二、各竞品关键动态
${competitorDynamic || '暂无'}

三、机会与风险分析
${riskAnalysis || '暂无'}

四、后续建议
${suggestion || '暂无'}
  `.trim();
  
  // 创建下载链接
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `竞品周报_${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  showAlert('周报导出成功！', 'success');
};

// 保存周报
const saveReport = async () => {
  if (!reportData.value.summary) {
    showAlert('请至少填写本周核心总结！', 'danger');
    return;
  }
  
  saving.value = true;
  
  try {
    const title = `竞品周报_${new Date().toISOString().split('T')[0]}`;
    const success = await reportStore.addReport({
      title,
      createTime: new Date().toISOString(),
      content: reportData.value
    });
    
    if (success) {
      showAlert('周报保存成功！', 'success');
      // 清空表单
      reportData.value = {
        summary: '',
        competitorDynamic: '',
        riskAnalysis: '',
        suggestion: ''
      };
    } else {
      showAlert('保存失败，请稍后重试', 'danger');
    }
  } catch (error) {
    console.error('保存周报失败:', error);
    showAlert('保存失败，请稍后重试', 'danger');
  } finally {
    saving.value = false;
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

// 加载草稿
const loadDraft = () => {
  const draft = localStorage.getItem('reportDraft');
  if (draft) {
    try {
      const draftData = JSON.parse(draft);
      reportData.value = {
        summary: draftData.summary || '',
        competitorDynamic: draftData.competitorDynamic || '',
        riskAnalysis: draftData.riskAnalysis || '',
        suggestion: draftData.suggestion || ''
      };
      showAlert(`已加载上次保存的草稿（${draftData.saveTime}）`, 'success');
    } catch (error) {
      console.error('加载草稿失败:', error);
    }
  }
};

onMounted(() => {
  // 加载草稿
  loadDraft();
  // 设置默认日期范围
  handleWeekRangeChange();
});
</script>

<style scoped>
.report-page {
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

.filter-item select,
.filter-item input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-item select:focus,
.filter-item input:focus {
  outline: none;
  border-color: #409eff;
}

.report-editor {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  min-height: 400px;
}

.report-item {
  margin-bottom: 20px;
}

.report-item h4 {
  margin-bottom: 10px;
  color: #409eff;
}

.report-item textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 80px;
  font-size: 14px;
  resize: vertical;
}

.report-item textarea:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.report-btns {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
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
  
  .report-btns {
    flex-direction: column;
  }
  
  .report-btns button {
    width: 100%;
  }
}
</style>
