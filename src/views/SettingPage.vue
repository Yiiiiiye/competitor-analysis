<template>
  <div class="setting-page">
    <h2 class="page-title">系统设置</h2>
    <div class="setting-item">
      <label>默认监测渠道：</label>
      <select id="defaultMonitorChannel" v-model="settings.defaultMonitorChannel">
        <option value="官网,公众号,小红书">官网、公众号、小红书</option>
        <option value="官网,公众号">官网、公众号</option>
        <option value="官网">仅官网</option>
      </select>
    </div>
    <div class="setting-item">
      <label>周报默认周期：</label>
      <select id="defaultReportCycle" v-model="settings.defaultReportCycle">
        <option value="week">按周</option>
        <option value="month">按月</option>
      </select>
    </div>
    <div class="setting-item">
      <label>数据自动备份：</label>
      <select id="autoBackup" v-model="settings.autoBackup">
        <option value="yes">开启</option>
        <option value="no">关闭</option>
      </select>
    </div>
    <div class="setting-btns">
      <button class="btn btn-primary" id="saveSettingBtn" @click="saveSettings" :disabled="saving">
        {{ saving ? '保存中...' : '保存设置' }}
      </button>
      <button class="btn btn-default" id="resetSettingBtn" @click="resetSettings">重置默认</button>
    </div>
    
    <div class="alert" :class="alertType" v-if="alertMessage" style="display: block;">{{ alertMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const saving = ref(false);
const alertMessage = ref('');
const alertType = ref('alert-success');

const settings = ref({
  defaultMonitorChannel: '官网,公众号,小红书',
  defaultReportCycle: 'week',
  autoBackup: 'yes'
});

// 保存设置
const saveSettings = () => {
  saving.value = true;
  
  // 模拟保存
  setTimeout(() => {
    localStorage.setItem('settings', JSON.stringify(settings.value));
    showAlert('设置保存成功！', 'success');
    saving.value = false;
  }, 500);
};

// 重置默认设置
const resetSettings = () => {
  settings.value = {
    defaultMonitorChannel: '官网,公众号,小红书',
    defaultReportCycle: 'week',
    autoBackup: 'yes'
  };
  showAlert('设置已重置为默认！', 'success');
};

// 显示提示
const showAlert = (message: string, type: 'success' | 'danger') => {
  alertMessage.value = message;
  alertType.value = `alert-${type}`;
  setTimeout(() => {
    alertMessage.value = '';
  }, 3000);
};

// 加载设置
const loadSettings = () => {
  const savedSettings = localStorage.getItem('settings');
  if (savedSettings) {
    try {
      settings.value = JSON.parse(savedSettings);
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.setting-page {
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

.setting-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.setting-item label {
  width: 120px;
  font-weight: 500;
}

.setting-item input,
.setting-item select {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.setting-item input:focus,
.setting-item select:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.setting-btns {
  margin-top: 30px;
  text-align: right;
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
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .setting-item label {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>
