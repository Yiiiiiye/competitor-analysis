const axios = require('axios');

class AIReportGenerator {
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || '';
    this.apiBase = process.env.GOOGLE_API_BASE || 'https://generativelanguage.googleapis.com/v1beta';
  }

  async generateReport(competitors, dynamics) {
    if (!this.apiKey) {
      console.log('未配置Google API密钥，使用模拟生成模式');
      return this.generateMockReport(competitors, dynamics);
    }

    const prompt = this.buildPrompt(competitors, dynamics);

    try {
      console.log('开始调用Google Gemini API...');
      console.log('API Base:', this.apiBase);
      console.log('API Key前缀:', this.apiKey.substring(0, 10) + '...');

      const response = await axios.post(
        `${this.apiBase}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `你是一个专业的竞品分析师，擅长分析竞品动态并生成高质量的周报。请根据提供的竞品信息，生成结构清晰、内容详实的竞品动态周报。

${prompt}

请生成包含以下内容的周报：
1. 本周核心总结：简要概述本周竞品动态的整体情况
2. 各竞品关键动态：按竞品分类梳理关键动态
3. 机会与风险分析：分析竞品动态带来的机会与风险
4. 后续建议：基于竞品动态给出后续行动建议

请以JSON格式返回，格式如下：
{
  "summary": "本周核心总结",
  "competitorDynamic": "各竞品关键动态",
  "riskAnalysis": "机会与风险分析",
  "suggestion": "后续建议"
}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('API响应状态:', response.status);
      console.log('API响应数据:', JSON.stringify(response.data).substring(0, 200));

      if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('API返回空响应');
      }

      const content = response.data.candidates[0].content.parts[0].text;
      console.log('生成的内容长度:', content.length);

      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Google API调用失败，切换到模拟生成模式');
      console.error('错误详情:', error.message);
      return this.generateMockReport(competitors, dynamics);
    }
  }

  generateMockReport(competitors, dynamics) {
    console.log('使用模拟AI生成模式');

    const highPriorityCompetitors = competitors.filter(c => c.priority === '高');
    const recentDynamics = dynamics.slice(0, 10);

    const summary = `本周共监测到${dynamics.length}条竞品动态，涉及${competitors.length}个竞品。其中高优先级竞品${highPriorityCompetitors.length}个，中优先级竞品${competitors.filter(c => c.priority === '中').length}个。整体来看，竞品在产品迭代、市场推广和功能优化方面较为活跃。`;

    let competitorDynamic = '';
    competitors.forEach(comp => {
      const compDynamics = recentDynamics.filter(d => d.competitorId.toString() === comp._id.toString());
      if (compDynamics.length > 0) {
        competitorDynamic += `【${comp.name}】\n`;
        compDynamics.forEach(d => {
          competitorDynamic += `• ${d.title}（${d.channel}，${new Date(d.publishTime).toLocaleDateString()}）\n`;
          competitorDynamic += `  ${d.content.substring(0, 100)}${d.content.length > 100 ? '...' : ''}\n\n`;
        });
        competitorDynamic += '\n';
      }
    });

    const riskAnalysis = `1. 高优先级竞品${highPriorityCompetitors.map(c => c.name).join('、')}均有重要动态更新，需要重点关注其产品迭代方向。\n` +
      `2. 竞品在社交媒体渠道的活跃度提升，可能加大市场竞争压力。\n` +
      `3. 部分竞品推出了新功能或优化措施，可能影响用户体验和市场份额。\n` +
      `4. 建议密切关注竞品的定价策略和营销活动，及时调整我方策略。`;

    const suggestion = `1. 加强产品研发投入，特别是在AI推荐、个性化功能等竞品重点发力的领域。\n` +
      `2. 优化用户体验，提升产品竞争力，重点关注用户反馈和功能易用性。\n` +
      `3. 制定差异化竞争策略，避免直接价格战，突出我方产品独特价值。\n` +
      `4. 建立竞品动态监控机制，定期收集和分析竞品信息，及时调整策略。\n` +
      `5. 加强市场营销和品牌建设，提升用户认知度和品牌影响力。`;

    return {
      summary,
      competitorDynamic,
      riskAnalysis,
      suggestion
    };
  }

  buildPrompt(competitors, dynamics) {
    let prompt = '请根据以下竞品信息，生成一份竞品动态周报：\n\n';

    prompt += '【竞品列表】\n';
    competitors.forEach(comp => {
      prompt += `- ${comp.name}（${comp.business}，优先级：${comp.priority}）\n`;
    });

    prompt += '\n【竞品动态】\n';
    dynamics.forEach(dyn => {
      const competitor = competitors.find(c => c._id.toString() === dyn.competitorId.toString());
      const competitorName = competitor ? competitor.name : '未知竞品';
      prompt += `- ${competitorName}：${dyn.title}（${dyn.channel}，${new Date(dyn.publishTime).toLocaleDateString()}）\n`;
      prompt += `  内容：${dyn.content}\n\n`;
    });

    prompt += '\n请生成包含以下内容的周报：\n';
    prompt += '1. 本周核心总结：简要概述本周竞品动态的整体情况\n';
    prompt += '2. 各竞品关键动态：按竞品分类梳理关键动态\n';
    prompt += '3. 机会与风险分析：分析竞品动态带来的机会与风险\n';
    prompt += '4. 后续建议：基于竞品动态给出后续行动建议\n\n';
    prompt += '请以JSON格式返回，格式如下：\n';
    prompt += '{\n';
    prompt += '  "summary": "本周核心总结",\n';
    prompt += '  "competitorDynamic": "各竞品关键动态",\n';
    prompt += '  "riskAnalysis": "机会与风险分析",\n';
    prompt += '  "suggestion": "后续建议"\n';
    prompt += '}';

    return prompt;
  }

  parseAIResponse(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        summary: content.substring(0, 500),
        competitorDynamic: content.substring(500, 1500),
        riskAnalysis: content.substring(1500, 2000),
        suggestion: content.substring(2000)
      };
    } catch (error) {
      console.error('解析AI响应失败:', error);
      return {
        summary: 'AI生成内容解析失败，请手动编辑',
        competitorDynamic: content,
        riskAnalysis: '请根据竞品动态分析机会与风险',
        suggestion: '请根据实际情况制定后续建议'
      };
    }
  }
}

module.exports = AIReportGenerator;