<script setup lang="ts">
</script>

<template>
  <div class="guestbook">
    <h2 class="page-title">留言板管理</h2>
    
    <el-card shadow="never">
      <el-table :data="[]" style="width: 100%">
        <el-table-column prop="name" label="昵称" width="120" />
        <el-table-column prop="content" label="内容" min-width="200" />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="createdAt" label="时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default>
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty description="暂无留言" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.guestbook {
  .page-title {
    margin: 0 0 20px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }
}
</style>
