<script setup lang="ts">
import GlobalBackground from './components/Background/GlobalBackground.vue'
import TheDock from './components/Dock/TheDock.vue'
</script>

<template>
  <!-- 全局背景 -->
  <GlobalBackground />

  <!-- 页面内容 -->
  <div class="app-wrapper">
    <router-view />
  </div>

  <!-- Dock 导航栏 -->
  <TheDock />
</template>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-wrapper {
  background: transparent;
  min-height: 100vh;
}
</style>
