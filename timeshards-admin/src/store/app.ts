import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏是否折叠
  const sidebarCollapsed = ref(false)
  
  // 是否为移动端
  const isMobile = ref(false)

  // 切换侧边栏
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // 设置移动端状态
  function setMobile(val: boolean) {
    isMobile.value = val
    // 移动端默认折叠侧边栏
    if (val) {
      sidebarCollapsed.value = true
    }
  }

  return {
    sidebarCollapsed,
    isMobile,
    toggleSidebar,
    setMobile
  }
})
