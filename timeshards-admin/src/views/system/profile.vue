<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const userInfo = computed(() => authStore.userInfo)

// 格式化日期
function formatDate(date: string | undefined) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}
</script>

<template>
  <div class="profile">
    <h2 class="page-title">个人信息</h2>
    
    <el-card shadow="never">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名" label-class-name="label">
          {{ userInfo?.username || '-' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="角色" label-class-name="label">
          <el-tag type="success">{{ userInfo?.role || 'admin' }}</el-tag>
        </el-descriptions-item>
        
        <el-descriptions-item label="注册时间" label-class-name="label">
          {{ formatDate(userInfo?.createdAt) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="最后更新" label-class-name="label">
          {{ formatDate(userInfo?.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="mt-16">
      <template #header>
        <span>修改密码</span>
      </template>
      
      <el-form label-width="100px" style="max-width: 400px">
        <el-form-item label="当前密码">
          <el-input type="password" placeholder="请输入当前密码" show-password />
        </el-form-item>
        
        <el-form-item label="新密码">
          <el-input type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        
        <el-form-item label="确认密码">
          <el-input type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.profile {
  .page-title {
    margin: 0 0 20px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .mt-16 {
    margin-top: 16px;
  }

  :deep(.label) {
    width: 120px;
  }
}
</style>
