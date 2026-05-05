<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDashboardStats, type DashboardStats } from '@/api/admin'

const router = useRouter()
const loading = ref(false)
const stats = ref<DashboardStats>({
  postCount: 0,
  publishedPostCount: 0,
  draftPostCount: 0,
  guestbookCount: 0,
  chatMessageCount: 0,
  portfolioCount: 0
})

const statCards = ref([
  { title: '文章总数', key: 'postCount' as keyof DashboardStats, icon: 'Document', color: '#409eff' },
  { title: '已发布', key: 'publishedPostCount' as keyof DashboardStats, icon: 'SuccessFilled', color: '#67c23a' },
  { title: '草稿', key: 'draftPostCount' as keyof DashboardStats, icon: 'EditPen', color: '#e6a23c' },
  { title: '留言总数', key: 'guestbookCount' as keyof DashboardStats, icon: 'Comment', color: '#909399' },
  { title: '聊天消息', key: 'chatMessageCount' as keyof DashboardStats, icon: 'ChatDotRound', color: '#f56c6c' },
  { title: '作品数量', key: 'portfolioCount' as keyof DashboardStats, icon: 'Suitcase', color: '#00d4aa' }
])

// 获取统计数据
async function fetchStats() {
  loading.value = true
  try {
    const res = await getDashboardStats()
    stats.value = res.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <h2 class="page-title">控制台</h2>
    
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col :xs="12" :sm="8" :md="4" v-for="item in statCards" :key="item.key">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value">{{ stats[item.key] }}</div>
            </div>
            <el-icon :size="40" :color="item.color">
              <component :is="item.icon" />
            </el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions" shadow="never">
      <template #header>
        <span>快捷操作</span>
      </template>
      <el-space wrap>
        <el-button type="primary" icon="EditPen" @click="router.push('/content/posts/create')">写文章</el-button>
        <el-button icon="Document" @click="router.push('/content/posts')">文章管理</el-button>
        <el-button icon="Comment" @click="router.push('/interaction/guestbook')">留言管理</el-button>
        <el-button icon="Suitcase" @click="router.push('/content/portfolio')">作品管理</el-button>
      </el-space>
    </el-card>

    <!-- 数据概览 -->
    <el-row :gutter="16">
      <el-col :xs="24" :sm="12">
        <el-card class="overview-card" shadow="never">
          <template #header>
            <span>内容概览</span>
          </template>
          <div class="overview-list">
            <div class="overview-item">
              <span class="label">已发布文章</span>
              <span class="value">{{ stats.publishedPostCount }}</span>
            </div>
            <div class="overview-item">
              <span class="label">草稿文章</span>
              <span class="value">{{ stats.draftPostCount }}</span>
            </div>
            <div class="overview-item">
              <span class="label">作品集</span>
              <span class="value">{{ stats.portfolioCount }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-card class="overview-card" shadow="never">
          <template #header>
            <span>互动数据</span>
          </template>
          <div class="overview-list">
            <div class="overview-item">
              <span class="label">留言总数</span>
              <span class="value">{{ stats.guestbookCount }}</span>
            </div>
            <div class="overview-item">
              <span class="label">聊天消息</span>
              <span class="value">{{ stats.chatMessageCount }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  .page-title {
    margin: 0 0 20px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .stat-card {
    margin-bottom: 16px;
    
    .stat-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .stat-title {
      font-size: 13px;
      color: #909399;
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }
  }

  .quick-actions {
    margin-bottom: 16px;
  }

  .overview-card {
    margin-bottom: 16px;

    .overview-list {
      .overview-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: #606266;
          font-size: 14px;
        }

        .value {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }
}
</style>
