<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/store/app";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

// 获取路由菜单
const menuRoutes = computed(() => {
  return router.options.routes.filter((r) => {
    return !r.meta?.hidden && r.children;
  });
});

// 当前激活的菜单
const activeMenu = computed(() => {
  const { path } = route;
  return path;
});

// 是否折叠
const isCollapse = computed(() => appStore.sidebarCollapsed);

// 处理菜单点击（移动端点击后关闭菜单）
function handleMenuSelect() {
  if (appStore.isMobile) {
    appStore.toggleSidebar();
  }
}

// 路径拼接函数，处理多余斜杠
const resolvePath = (parentPath: string, childPath: string) => {
  if (childPath.startsWith("/")) return childPath;

  // 如果父路径就是 '/'，直接拼接
  if (parentPath === "/") {
    return `/${childPath}`;
  }

  // 否则，确保中间只有一个斜杠
  return `${parentPath}/${childPath}`.replace(/\/+/g, "/");
};
</script>

<template>
  <div
    class="sidebar-container"
    :class="{ 'is-collapse': isCollapse, 'is-mobile': appStore.isMobile }"
  >
    <!-- Logo -->
    <div class="sidebar-logo">
      <img src="/logo.png" alt="Logo" class="logo-img" />
      <span v-show="!isCollapse" class="logo-title">TimeShards</span>
    </div>

    <!-- 菜单 -->
    <el-scrollbar class="sidebar-menu">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        :unique-opened="true"
        router
        @select="handleMenuSelect"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <!-- 单个菜单项（只有一个子路由） -->
          <el-menu-item
            v-if="route.children && route.children.length === 1"
            :index="resolvePath(route.path, route.children[0].path)"
          >
            <el-icon v-if="route.children[0].meta?.icon">
              <component :is="route.children[0].meta.icon" />
            </el-icon>
            <template #title>{{ route.children[0].meta?.title }}</template>
          </el-menu-item>

          <!-- 子菜单（多个子路由） -->
          <el-sub-menu
            v-else-if="route.children && route.children.length > 1"
            :index="route.path"
          >
            <template #title>
              <el-icon v-if="route.meta?.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ route.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children"
              :key="child.path"
              :index="resolvePath(route.path, child.path)"
            >
              <el-icon v-if="child.meta?.icon">
                <component :is="child.meta.icon" />
              </el-icon>
              <template #title>{{ child.meta?.title }}</template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-container {
  width: 220px;
  height: 100vh;
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  z-index: 1000;

  &.is-collapse {
    width: 64px;
  }

  &.is-mobile {
    position: fixed;
    top: 0;
    left: 0;
    box-shadow: 2px 0 6px rgba(0, 0, 0, 0.2);
  }
}

.sidebar-logo {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background-color: #2b2f3a;
  overflow: hidden;

  .logo-img {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .logo-title {
    margin-left: 10px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
  }
}

.sidebar-menu {
  flex: 1;
  overflow: hidden;

  // 菜单样式覆盖
  :deep(.el-menu) {
    border-right: none;
    background-color: #304156;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    color: #bfcbd9;

    &:hover {
      background-color: #263445;
    }
  }

  :deep(.el-menu-item.is-active) {
    background-color: #1890ff !important;
    color: #fff;
  }

  :deep(.el-sub-menu .el-menu-item) {
    background-color: #1f2d3d !important;
    min-width: auto;

    &:hover {
      background-color: #001528 !important;
    }
  }

  // 折叠时隐藏箭头
  :deep(.el-menu--collapse .el-sub-menu__title .el-sub-menu__icon-arrow) {
    display: none;
  }
}
</style>
