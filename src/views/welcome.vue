<template>
  <div class="dashboard-container">
    <!-- 欢迎信息 -->
    <div class="welcome-section">
      <h2>欢迎回来！{{ userRole }}</h2>
    </div>

    <!-- 数据卡片 -->
    <el-row :gutter="20" class="data-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <div class="card-icon blue">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">题库总量</div>
              <div class="card-value">
                {{ formatNumber(statistics.totalQuestions) }}
                <span class="trend up">
                  <el-icon><ArrowUp /></el-icon>
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <div class="card-icon purple">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">今日新增题目</div>
              <div class="card-value">
                {{ statistics.newQuestions }}
                <span class="trend up">
                  <el-icon><ArrowUp /></el-icon>
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <div class="card-icon orange">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">用户答题数</div>
              <div class="card-value">
                {{ formatNumber(statistics.totalAnswers) }}
                <span class="trend up">
                  <el-icon><ArrowUp /></el-icon>
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <div class="card-icon green">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">日活跃用户</div>
              <div class="card-value">
                {{ statistics.dailyActiveUsers }}%
                <span class="trend down">
                  <el-icon><ArrowDown /></el-icon>
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图表 -->
    <el-card shadow="hover" class="chart-card">
      <div class="card-header">
        <h3>题库使用趋势</h3>
        <el-button link type="primary">查看更多</el-button>
      </div>
      <div class="chart-container" ref="lineChartRef"></div>
    </el-card>

    <!-- 底部卡片 -->
    <el-row :gutter="20" class="bottom-section">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="leaderboard-card">
          <div class="card-header">
            <h3>用户排行榜</h3>
            <el-button link type="primary" @click="refreshLeaderboard">刷新</el-button>
          </div>
          <div class="tabs-container">
            <el-tabs v-model="leaderboardType" @tab-change="handleLeaderboardTypeChange">
              <el-tab-pane label="今日排行" name="daily"></el-tab-pane>
              <el-tab-pane label="本周排行" name="weekly"></el-tab-pane>
              <el-tab-pane label="总排行" name="total"></el-tab-pane>
            </el-tabs>
          </div>
          <el-table :data="leaderboardData" style="width: 100%" v-loading="leaderboardLoading">
            <el-table-column prop="rank" label="排名" width="70">
              <template #default="scope">
                <span :class="getRankClass(scope.row.rank)">{{ scope.row.rank }}</span>
              </template>
            </el-table-column>
            <el-table-column label="用户" min-width="150">
              <template #default="scope">
                <div class="user-info">
                  <el-avatar :size="32" :src="scope.row.avatar" class="user-avatar">
                    {{ scope.row.nickname?.charAt(0) || 'U' }}
                  </el-avatar>
                  <div class="user-details">
                    <div class="nickname">{{ scope.row.nickname || '匿名用户' }}</div>
                    <div class="province">{{ scope.row.province || '未知地区' }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="score" label="答题数" width="100">
              <template #default="scope">
                <span class="score-text">{{ Math.floor(scope.row.score) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="Continuelogin" label="连续登录" width="100">
              <template #default="scope">
                <el-tag :type="getContinueLoginTagType(scope.row.Continuelogin)" size="small">
                  {{ scope.row.Continuelogin }}天
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="question-types">
          <div class="card-header">
            <h3>题目类型占比</h3>
          </div>
          <div class="pie-chart-container" ref="pieChartRef"></div>
          <div class="pie-total">
            <div class="total-label">题目总量</div>
            <div class="total-value">{{ formatNumber(statistics.totalQuestions) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, getCurrentInstance, computed, nextTick } from "vue";
import {
  Document,
  Collection,
  ChatDotRound,
  TrendCharts,
  ArrowUp,
  ArrowDown,
} from "@element-plus/icons-vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";

const { proxy } = getCurrentInstance();
const sysAdmin = proxy.$store.state.sysAdmin;
const userRole = computed(() => sysAdmin.Username || "管理员");

const activeTab = ref("single");
const leaderboardType = ref("daily");
const leaderboardData = ref([]);
const leaderboardLoading = ref(false);
const lineChartRef = ref(null);
const pieChartRef = ref(null);
let lineChart = null;
let pieChart = null;

// 使用响应式数据
const statsData = ref({
  total_questions: 0,
  today_added: 0,
  user_answer_count: 0,
  daily_active_users: 0,
  question_type_ratio: [],
  usage_trend: []
});

// 自动计算的统计信息
const statistics = computed(() => ({
  totalQuestions: statsData.value.total_questions,
  newQuestions: statsData.value.today_added,
  totalAnswers: statsData.value.user_answer_count,
  dailyActiveUsers: statsData.value.daily_active_users
}));

const getstat = () => {
  proxy.$api.stats()
    .then((res) => {

        statsData.value = res.data;
        console.log("数据",statsData)
        // DOM更新后刷新图表
        nextTick(() => {
          updateCharts();
        });

    })
    .catch((err) => {
      ElMessage.error("请求失败");
      console.error("API错误:", err);
    });
};

// 类型转换方法
const getTypeName = (type) => {
  const typeMap = {
    '1': '判断题',
    '2': '单选题',
    '3': '多选题'
  };
  return typeMap[type] || '未知类型';
};

// 格式化数字
const formatNumber = (num) => {
  if (!num) return "0";
  return num >= 10000 ? `${(num/10000).toFixed(1)}w` : num.toString();
};

// 图表初始化
const initCharts = () => {
  lineChart = echarts.init(lineChartRef.value);
  pieChart = echarts.init(pieChartRef.value);
};

// 图表更新
const updateCharts = () => {
  updateLineChart();
  updatePieChart();
};

// 折线图配置
const updateLineChart = () => {
  const option = {
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: statsData.value.usage_trend.map(item => item.date)
    },
    yAxis: { type: "value" },
    series: [{
      type: "line",
      data: statsData.value.usage_trend.map(item => item.count),
      areaStyle: { color: "#409EFF" }
    }]
  };
  lineChart.setOption(option);
};

// 饼图配置
const updatePieChart = () => {
  const option = {
    tooltip: { formatter: "{b}: {d}%" },
    series: [{
      type: "pie",
      data: statsData.value.question_type_ratio.map(item => ({
        name: getTypeName(item.type),
        value: item.ratio
      }))
    }]
  };
  pieChart.setOption(option);
};

// 获取排行榜数据
const getLeaderboard = async () => {
  leaderboardLoading.value = true;
  try {
    const res = await proxy.$api.getLeaderboard({
      type: leaderboardType.value,
      count: 10
    });
    if (res.code === 200) {
      leaderboardData.value = res.data || [];
    } else {
      ElMessage.error("获取排行榜失败");
    }
  } catch (err) {
    console.error("获取排行榜失败:", err);
    ElMessage.error("获取排行榜失败");
  } finally {
    leaderboardLoading.value = false;
  }
};

// 刷新排行榜
const refreshLeaderboard = () => {
  getLeaderboard();
};

// 处理排行榜类型切换
const handleLeaderboardTypeChange = (type) => {
  leaderboardType.value = type;
  getLeaderboard();
};

// 获取排名样式类
const getRankClass = (rank) => {
  if (rank === 1) return 'rank-first';
  if (rank === 2) return 'rank-second';
  if (rank === 3) return 'rank-third';
  return 'rank-normal';
};

// 获取连续登录标签类型
const getContinueLoginTagType = (days) => {
  if (days >= 30) return 'danger';
  if (days >= 14) return 'warning';
  if (days >= 7) return 'success';
  return 'info';
};

// 窗口resize处理
const handleResize = () => {
  lineChart?.resize();
  pieChart?.resize();
};

onMounted(async () => {
  await getstat();
  await getLeaderboard();
  initCharts();
  window.addEventListener("resize", handleResize);
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.welcome-section {
  margin-bottom: 20px;
}

.welcome-section h2 {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.data-cards {
  margin-bottom: 20px;
}

.data-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.card-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.card-icon.blue {
  background-color: #409eff;
}

.card-icon.purple {
  background-color: #8b5cf6;
}

.card-icon.orange {
  background-color: #f59e0b;
}

.card-icon.green {
  background-color: #10b981;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  display: flex;
  align-items: center;
}

.trend {
  font-size: 12px;
  margin-left: 8px;
  display: flex;
  align-items: center;
}

.trend.up {
  color: #67c23a;
}

.trend.down {
  color: #f56c6c;
}

.chart-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: #303133;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.bottom-section {
  margin-bottom: 20px;
}

.leaderboard-card,
.question-types {
  height: 100%;
  border-radius: 8px;
}

.tabs-container {
  margin-bottom: 16px;
}

.pie-chart-container {
  height: 300px;
  width: 100%;
}

.pie-total {
  text-align: center;
  margin-top: 16px;
}

.total-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.total-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

/* 排行榜样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.nickname {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.province {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-text {
  font-weight: 600;
  color: #409eff;
}

/* 排名样式 */
.rank-first {
  color: #ffd700;
  font-weight: bold;
  font-size: 16px;
}

.rank-second {
  color: #c0c0c0;
  font-weight: bold;
  font-size: 16px;
}

.rank-third {
  color: #cd7f32;
  font-weight: bold;
  font-size: 16px;
}

.rank-normal {
  color: #303133;
  font-weight: 500;
}
</style>
