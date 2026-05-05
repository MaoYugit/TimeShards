<script setup lang="ts">
</script>

<template>
  <div class="portfolio">
    <h2 class="page-title">作品集管理</h2>
    
    <el-card shadow="never">
      <template #header>
        <el-button type="primary" icon="Plus">添加作品</el-button>
      </template>
      
      <el-empty description="暂无作品" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.portfolio {
  .page-title {
    margin: 0 0 20px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }
}
</style>
