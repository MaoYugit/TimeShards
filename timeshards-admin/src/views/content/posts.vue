<script setup lang="ts">
</script>

<template>
  <div class="posts">
    <h2 class="page-title">文章管理</h2>
    
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-button type="primary" icon="Plus">新建文章</el-button>
          <el-input placeholder="搜索文章..." style="width: 200px" clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>
      
      <el-table :data="[]" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="status" label="状态" width="80" />
        <el-table-column prop="viewCount" label="阅读" width="80" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default>
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty description="暂无文章" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.posts {
  .page-title {
    margin: 0 0 20px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
