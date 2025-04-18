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
        <el-card shadow="hover" class="popular-questions">
          <div class="card-header">
            <h3>热门题目</h3>
            <el-button link type="primary">查看更多</el-button>
          </div>
          <div class="tabs-container">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="单选题" name="single"></el-tab-pane>
              <el-tab-pane label="多选题" name="multiple"></el-tab-pane>
              <el-tab-pane label="判断题" name="judge"></el-tab-pane>
            </el-tabs>
          </div>
          <el-table :data="popularQuestions" style="width: 100%">
            <el-table-column prop="rank" label="排名" width="70" />
            <el-table-column prop="title" label="题目标题" min-width="200" />
            <el-table-column prop="usageCount" label="使用次数" width="120">
              <template #default="scope">
                {{ formatNumber(scope.row.usageCount) }}
              </template>
            </el-table-column>
            <el-table-column prop="correctRate" label="正确率" width="120">
              <template #default="scope">
                {{ scope.row.correctRate }}%
                <span :class="['trend', scope.row.trend]">
                  <el-icon v-if="scope.row.trend === 'up'"><ArrowUp /></el-icon>
                  <el-icon v-else><ArrowDown /></el-icon>
                </span>
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
import { ref, onMounted, reactive } from 'vue'
import { 
  Document, 
  Collection, 
  ChatDotRound, 
  TrendCharts, 
  ArrowUp, 
  ArrowDown 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const userRole = '管理员'
const activeTab = ref('single')
const lineChartRef = ref(null)
const pieChartRef = ref(null)

// 模拟数据
const statistics = reactive({
  totalQuestions: 37350,
  newQuestions: 368,
  totalAnswers: 8874,
  dailyActiveUsers: 2.8
})

const popularQuestions = [
  { rank: 1, title: 'JavaScript中的闭包是什么？', usageCount: 3463, correctRate: 35, trend: 'down' },
  { rank: 2, title: 'React中的虚拟DOM有什么优势？', usageCount: 3242, correctRate: 22, trend: 'down' },
  { rank: 3, title: 'Vue3的Composition API有哪些优点？', usageCount: 3189, correctRate: 9, trend: 'down' },
  { rank: 4, title: 'TypeScript中的泛型如何使用？', usageCount: 2875, correctRate: 17, trend: 'up' },
  { rank: 5, title: 'CSS中的Flex布局基本概念是什么？', usageCount: 2654, correctRate: 45, trend: 'up' }
]

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

// 初始化图表
onMounted(() => {
  initLineChart()
  initPieChart()
})

// 初始化折线图
const initLineChart = () => {
  const chartDom = lineChartRef.value
  const myChart = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['2023-03-28', '2023-03-29', '2023-03-30', '2023-03-31', '2023-04-01', '2023-04-02', '2023-04-03', '2023-04-04']
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '答题人数',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#409EFF'
        },
        areaStyle: {
          opacity: 0.2,
          color: '#409EFF'
        },
        data: [58000, 72000, 79000, 53000, 67000, 84000, 86000, 49000, 55000, 78000]
      }
    ]
  }
  
  myChart.setOption(option)
  
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 初始化饼图
const initPieChart = () => {
  const chartDom = pieChartRef.value
  const myChart = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['单选题', '多选题', '判断题']
    },
    series: [
      {
        name: '题目类型',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 48, name: '单选题', itemStyle: { color: '#36A3F7' } },
          { value: 36, name: '多选题', itemStyle: { color: '#4956E3' } },
          { value: 16, name: '判断题', itemStyle: { color: '#25C3D9' } }
        ]
      }
    ]
  }
  
  myChart.setOption(option)
  
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}
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
  background-color: #409EFF;
}

.card-icon.purple {
  background-color: #8B5CF6;
}

.card-icon.orange {
  background-color: #F59E0B;
}

.card-icon.green {
  background-color: #10B981;
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
  color: #67C23A;
}

.trend.down {
  color: #F56C6C;
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

.popular-questions, .question-types {
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
</style>