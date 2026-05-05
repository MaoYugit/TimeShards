<script setup lang="ts">
import { ref } from 'vue'

const stats = ref([
  { title: '文章总数', value: 12, icon: 'Document', color: '#409eff' },
  { title: '留言总数', value: 56, icon: 'Comment', color: '#67c23a' },
  { title: '聊天消息', value: 238, icon: 'ChatDotRound', color: '#e6a23c' },
  { title: '今日访问', value: 1024, icon: 'View', color: '#f56c6c' }
])
</script>

<template>
  <div class="dashboard">
    <h2 class="page-title">控制台</h2>
    
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col :xs="12" :sm="6" v-for="item in stats" :key="item.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value">{{ item.value }}</div>
            </div>
            <el-icon :size="48" :color="item.color">
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
        <el-button type="primary" icon="EditPen">写文章</el-button>
        <el-button icon="Setting">首页配置</el-button>
        <el-button icon="User">个人信息</el-button>
      </el-space>
    </el-card>

    <!-- 最新留言 -->
    <el-card class="recent-data" shadow="never">
      <template #header>
        <span>最新留言</span>
      </template>
      <el-table :data="[]" style="width: 100%">
        <el-table-column prop="name" label="昵称" width="120" />
        <el-table-column prop="content" label="内容" />
        <el-table-column prop="createdAt" label="时间" width="180" />
      </el-table>
      <el-empty description="暂无数据" />
    </el-card>
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
      font-size: 14px;
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

  .recent-data {
    margin-bottom: 16px;
  }
}
</style>
