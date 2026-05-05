<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPostsAdmin, deletePost } from '@/api/blog'
import type { BlogPost, QueryPostDto } from '@/types/blog'

const router = useRouter()

// 表格数据
const tableData = ref<BlogPost[]>([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive<QueryPostDto>({
  page: 1,
  pageSize: 10,
  status: undefined,
  category: undefined,
  q: ''
})

// 分类选项
const categoryOptions = ['前端', '工程化', 'AI 开发', '随笔']

// 状态选项
const statusOptions = [
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' }
]

// 获取文章列表
async function fetchPosts() {
  loading.value = true
  try {
    const res = await getPostsAdmin(queryParams)
    tableData.value = res.data.items
    total.value = res.data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取文章列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  queryParams.page = 1
  fetchPosts()
}

// 重置搜索
function handleReset() {
  queryParams.q = ''
  queryParams.status = undefined
  queryParams.category = undefined
  queryParams.page = 1
  fetchPosts()
}

// 分页变化
function handlePageChange(page: number) {
  queryParams.page = page
  fetchPosts()
}

function handleSizeChange(size: number) {
  queryParams.pageSize = size
  queryParams.page = 1
  fetchPosts()
}

// 新建文章
function handleCreate() {
  router.push('/content/posts/create')
}

// 编辑文章
function handleEdit(row: BlogPost) {
  router.push(`/content/posts/edit/${row._id}`)
}

// 删除文章
async function handleDelete(row: BlogPost) {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    await deletePost(row._id)
    ElMessage.success('删除成功')
    fetchPosts()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 格式化日期
function formatDate(date: string | null) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// 状态标签类型
function statusType(status: string) {
  return status === 'published' ? 'success' : 'info'
}

function statusLabel(status: string) {
  return status === 'published' ? '已发布' : '草稿'
}

onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div class="posts">
    <h2 class="page-title">文章管理</h2>
    
    <el-card shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="queryParams.q"
          placeholder="搜索文章标题..."
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="queryParams.category"
          placeholder="选择分类"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        
        <el-select
          v-model="queryParams.status"
          placeholder="选择状态"
          clearable
          style="width: 100px"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        
        <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        
        <div class="search-bar__right">
          <el-button type="primary" icon="Plus" @click="handleCreate">新建文章</el-button>
        </div>
      </div>
      
      <!-- 表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        row-key="_id"
      >
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link type="primary" @click="handleEdit(row)">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="viewCount" label="阅读" width="70" align="center" />
        
        <el-table-column prop="tags" label="标签" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags?.slice(0, 2)"
              :key="tag"
              size="small"
              type="info"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
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

  .search-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;

    &__right {
      margin-left: auto;
    }
  }

  .tag-item {
    margin-right: 4px;
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
