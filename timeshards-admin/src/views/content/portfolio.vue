<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getPortfolioProjects,
  deletePortfolioProject,
  type PortfolioProject
} from '@/api/portfolio'

const tableData = ref<PortfolioProject[]>([])
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加作品')
const formData = ref({
  title: '',
  period: '',
  summary: '',
  tags: [] as string[],
  image: '',
  showcaseNote: '',
  sortOrder: 0
})
const tagInput = ref('')

// 获取作品列表
async function fetchProjects() {
  loading.value = true
  try {
    const res = await getPortfolioProjects()
    tableData.value = res.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取作品列表失败')
  } finally {
    loading.value = false
  }
}

// 打开添加对话框
function handleAdd() {
  dialogTitle.value = '添加作品'
  formData.value = {
    title: '',
    period: '',
    summary: '',
    tags: [],
    image: '',
    showcaseNote: '',
    sortOrder: 0
  }
  dialogVisible.value = true
}

// 打开编辑对话框
function handleEdit(row: PortfolioProject) {
  dialogTitle.value = '编辑作品'
  formData.value = {
    title: row.title,
    period: row.period,
    summary: row.summary,
    tags: [...row.tags],
    image: row.image,
    showcaseNote: row.showcaseNote,
    sortOrder: row.sortOrder
  }
  dialogVisible.value = true
}

// 删除作品
async function handleDelete(row: PortfolioProject) {
  try {
    await ElMessageBox.confirm('确定要删除这个作品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    await deletePortfolioProject(row._id)
    ElMessage.success('删除成功')
    fetchProjects()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 添加标签
function handleAddTag() {
  const tag = tagInput.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
  }
  tagInput.value = ''
}

// 删除标签
function handleRemoveTag(index: number) {
  formData.value.tags.splice(index, 1)
}

// 格式化日期
function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}

onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <div class="portfolio">
    <h2 class="page-title">作品集管理</h2>
    
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-button type="primary" icon="Plus" @click="handleAdd">添加作品</el-button>
        </div>
      </template>
      
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="项目名称" min-width="150" show-overflow-tooltip />
        
        <el-table-column prop="period" label="时间段" width="100" />
        
        <el-table-column prop="tags" label="技术栈" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags?.slice(0, 3)"
              :key="tag"
              size="small"
              type="info"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        
        <el-table-column prop="createdAt" label="创建时间" width="120">
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
      
      <el-empty v-if="!loading && !tableData.length" description="暂无作品" />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form label-width="80px">
        <el-form-item label="项目名称" required>
          <el-input v-model="formData.title" placeholder="请输入项目名称" />
        </el-form-item>
        
        <el-form-item label="时间段">
          <el-input v-model="formData.period" placeholder="如：2024" />
        </el-form-item>
        
        <el-form-item label="简介">
          <el-input v-model="formData.summary" type="textarea" :rows="3" placeholder="项目简介" />
        </el-form-item>
        
        <el-form-item label="技术栈">
          <div class="tags-input">
            <el-tag
              v-for="(tag, index) in formData.tags"
              :key="tag"
              closable
              @close="handleRemoveTag(index)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-model="tagInput"
              placeholder="输入后回车"
              style="width: 120px"
              @keyup.enter="handleAddTag"
              @blur="handleAddTag"
            />
          </div>
        </el-form-item>
        
        <el-form-item label="展示图">
          <el-input v-model="formData.image" placeholder="图片 URL" />
        </el-form-item>
        
        <el-form-item label="排序">
          <el-input-number v-model="formData.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
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

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tag-item {
    margin-right: 4px;
    margin-bottom: 4px;
  }

  .tags-input {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
}
</style>
