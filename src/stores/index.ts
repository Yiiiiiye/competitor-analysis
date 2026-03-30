import { defineStore } from 'pinia';
import axios from 'axios';

// API基础URL
const API_BASE_URL = 'http://localhost:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 用户认证状态
interface UserState {
  isLogin: boolean;
  username: string;
  token: string;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLogin: !!localStorage.getItem('token'),
    username: localStorage.getItem('username') || '',
    token: localStorage.getItem('token') || ''
  }),
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.success) {
          this.isLogin = true;
          this.username = response.data.user.username;
          this.token = response.data.token;
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('username', response.data.user.username);
          return true;
        }
        return false;
      } catch (error) {
        console.error('登录失败:', error);
        return false;
      }
    },
    async register(username: string, password: string) {
      try {
        const response = await api.post('/auth/register', { username, password });
        return response.data.success;
      } catch (error) {
        console.error('注册失败:', error);
        return false;
      }
    },
    async wechatLogin() {
      try {
        const response = await api.post('/auth/wechat');
        if (response.data.success) {
          this.isLogin = true;
          this.username = response.data.user.username;
          this.token = response.data.token;
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('username', response.data.user.username);
          return true;
        }
        return false;
      } catch (error) {
        console.error('微信登录失败:', error);
        return false;
      }
    },
    logout() {
      this.isLogin = false;
      this.username = '';
      this.token = '';
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
  }
});

// 竞品状态
interface Competitor {
  id: string;
  name: string;
  business: string;
  channels: string;
  priority: string;
}

interface CompetitorState {
  competitors: Competitor[];
  loading: boolean;
}

export const useCompetitorStore = defineStore('competitor', {
  state: (): CompetitorState => ({
    competitors: [],
    loading: false
  }),
  actions: {
    async getCompetitors() {
      this.loading = true;
      try {
        const response = await api.get('/competitors');
        if (response.data.success) {
          this.competitors = response.data.data;
        }
      } catch (error) {
        console.error('获取竞品列表失败:', error);
      } finally {
        this.loading = false;
      }
    },
    async addCompetitor(competitor: Omit<Competitor, 'id'>) {
      try {
        const response = await api.post('/competitors', competitor);
        if (response.data.success) {
          this.competitors.push(response.data.data);
          return true;
        }
        return false;
      } catch (error) {
        console.error('添加竞品失败:', error);
        return false;
      }
    },
    async updateCompetitor(id: string, competitor: Omit<Competitor, 'id'>) {
      try {
        const response = await api.put(`/competitors/${id}`, competitor);
        if (response.data.success) {
          const index = this.competitors.findIndex(c => c.id === id);
          if (index !== -1) {
            this.competitors[index] = response.data.data;
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error('更新竞品失败:', error);
        return false;
      }
    },
    async deleteCompetitor(id: string) {
      try {
        const response = await api.delete(`/competitors/${id}`);
        if (response.data.success) {
          this.competitors = this.competitors.filter(c => c.id !== id);
          return true;
        }
        return false;
      } catch (error) {
        console.error('删除竞品失败:', error);
        return false;
      }
    }
  }
});

// 动态状态
interface Dynamic {
  id: string;
  competitorId: string;
  title: string;
  channel: string;
  publishTime: string;
  content: string;
  competitor?: {
    name: string;
  };
}

interface DynamicState {
  dynamics: Dynamic[];
  loading: boolean;
}

export const useDynamicStore = defineStore('dynamic', {
  state: (): DynamicState => ({
    dynamics: [],
    loading: false
  }),
  actions: {
    async getDynamics(competitorId?: string, timeRange?: string) {
      this.loading = true;
      try {
        const params = new URLSearchParams();
        if (competitorId) params.append('competitorId', competitorId);
        if (timeRange) params.append('timeRange', timeRange);
        
        const response = await api.get(`/dynamics?${params.toString()}`);
        if (response.data.success) {
          this.dynamics = response.data.data;
        }
      } catch (error) {
        console.error('获取动态列表失败:', error);
      } finally {
        this.loading = false;
      }
    },
    async addDynamic(dynamic: Omit<Dynamic, 'id'>) {
      try {
        const response = await api.post('/dynamics', dynamic);
        if (response.data.success) {
          this.dynamics.push(response.data.data);
          return true;
        }
        return false;
      } catch (error) {
        console.error('添加动态失败:', error);
        return false;
      }
    },
    async updateDynamic(id: string, dynamic: Omit<Dynamic, 'id'>) {
      try {
        const response = await api.put(`/dynamics/${id}`, dynamic);
        if (response.data.success) {
          const index = this.dynamics.findIndex(d => d.id === id);
          if (index !== -1) {
            this.dynamics[index] = response.data.data;
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error('更新动态失败:', error);
        return false;
      }
    },
    async deleteDynamic(id: string) {
      try {
        const response = await api.delete(`/dynamics/${id}`);
        if (response.data.success) {
          this.dynamics = this.dynamics.filter(d => d.id !== id);
          return true;
        }
        return false;
      } catch (error) {
        console.error('删除动态失败:', error);
        return false;
      }
    }
  }
});

// 周报状态
interface ReportContent {
  summary: string;
  competitorDynamic: string;
  riskAnalysis: string;
  suggestion: string;
}

interface Report {
  id: string;
  title: string;
  createTime: string;
  content: ReportContent;
}

interface ReportState {
  reports: Report[];
  loading: boolean;
}

export const useReportStore = defineStore('report', {
  state: (): ReportState => ({
    reports: [],
    loading: false
  }),
  actions: {
    async getReports(timeRange?: string) {
      this.loading = true;
      try {
        const params = new URLSearchParams();
        if (timeRange) params.append('timeRange', timeRange);
        
        const response = await api.get(`/reports?${params.toString()}`);
        if (response.data.success) {
          this.reports = response.data.data;
        }
      } catch (error) {
        console.error('获取周报列表失败:', error);
      } finally {
        this.loading = false;
      }
    },
    async addReport(report: Omit<Report, 'id'>) {
      try {
        const response = await api.post('/reports', report);
        if (response.data.success) {
          this.reports.push(response.data.data);
          return true;
        }
        return false;
      } catch (error) {
        console.error('添加周报失败:', error);
        return false;
      }
    },
    async updateReport(id: string, report: Omit<Report, 'id'>) {
      try {
        const response = await api.put(`/reports/${id}`, report);
        if (response.data.success) {
          const index = this.reports.findIndex(r => r.id === id);
          if (index !== -1) {
            this.reports[index] = response.data.data;
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error('更新周报失败:', error);
        return false;
      }
    },
    async deleteReport(id: string) {
      try {
        const response = await api.delete(`/reports/${id}`);
        if (response.data.success) {
          this.reports = this.reports.filter(r => r.id !== id);
          return true;
        }
        return false;
      } catch (error) {
        console.error('删除周报失败:', error);
        return false;
      }
    },
    async generateAIReport(timeRange?: string) {
      try {
        const response = await api.post('/reports/ai-generate', { timeRange });
        if (response.data.success) {
          return {
            success: true,
            data: response.data.data,
            meta: response.data.meta
          };
        }
        return {
          success: false,
          message: response.data.message
        };
      } catch (error: any) {
        console.error('AI生成周报失败:', error);
        return {
          success: false,
          message: error.response?.data?.message || 'AI生成周报失败'
        };
      }
    }
  }
});
