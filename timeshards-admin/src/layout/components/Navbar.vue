<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'

const appStore = useAppStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// 用户名
const username = computed(() => authStore.userInfo?.username || 'Admin')

// 面包屑
const breadcrumbs = computed(() => {
  const title = route.meta?.title as string
  return title ? [{ title }] : []
})

// 退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    authStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 取消操作
  }
}

// 跳转个人信息
function handleProfile() {
  router.push('/system/profile')
}
</script>

<template>
  <div class="navbar">
    <!-- 左侧 -->
    <div class="navbar-left">
      <!-- 折叠按钮 -->
      <div class="hamburger" @click="appStore.toggleSidebar">
        <el-icon :size="20">
          <component :is="appStore.sidebarCollapsed ? 'Expand' : 'Fold'" />
        </el-icon>
      </div>

      <!-- 面包屑 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.title">
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧 -->
    <div class="navbar-right">
      <!-- 全屏按钮 -->
      <div class="right-menu-item" title="全屏">
        <el-icon :size="18"><FullScreen /></el-icon>
      </div>

      <!-- 用户信息 -->
      <el-dropdown trigger="click" @command="(cmd: string) => cmd === 'logout' ? handleLogout() : handleProfile()">
        <div class="user-info">
          <el-avatar :size="30" icon="UserFilled" />
          <span class="user-name">{{ username }}</span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item icon="User" command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item divided icon="SwitchButton" command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  flex-shrink: 0;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.hamburger {
  padding: 0 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
}

.breadcrumb {
  margin-left: 8px;
  
  @media screen and (max-width: 768px) {
    display: none;
  }
}

.navbar-right {
  display: flex;
  align-items: center;
}

.right-menu-item {
  padding: 0 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  
  .user-name {
    margin-left: 8px;
    font-size: 14px;
    color: #333;
    
    @media screen and (max-width: 768px) {
      display: none;
    }
  }
}
</style>
