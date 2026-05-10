<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategories, createCategory, deleteCategory } from '@/api/blogCategory'
import type { BlogCategoryItem } from '@/types/blog'

const tableData = ref<BlogCategoryItem[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)

const form = ref({ name: '', slug: '' })
const formRef = ref()

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

// 获取分类列表
async function fetchCategories() {
  loading.value = true
  try {
    const res = await getCategories()
    tableData.value = res.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 新建分类
function handleCreate() {
  form.value = { name: '', slug: '' }
  dialogVisible.value = true
}

// 提交新建
async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    await createCategory({
      name: form.value.name,
      slug: form.value.slug || undefined
    })
    ElMessage.success('创建成功')
    dialogVisible.value = false
    fetchCategories()
  } catch (error: any) {
    ElMessage.error(error.message || '创建失败')
  } finally {
    submitting.value = false
  }
}

// 删除分类
async function handleDelete(row: BlogCategoryItem) {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    await deleteCategory(row._id)
    ElMessage.success('删除成功')
    fetchCategories()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 格式化日期
function formatDate(date: string) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="categories">
    <h2 class="page-title">分类管理</h2>

    <el-card shadow="never">
      <div class="search-bar">
        <div class="search-bar__right">
          <el-button type="primary" icon="Plus" @click="handleCreate">新建分类</el-button>
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%" row-key="_id">
        <el-table-column prop="name" label="分类名称" min-width="150" />
        <el-table-column prop="slug" label="Slug" min-width="150" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建分类对话框 -->
    <el-dialog v-model="dialogVisible" title="新建分类" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="Slug">
          <el-input v-model="form.slug" placeholder="留空自动生成" maxlength="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.categories {
  .page-title {
    margin: 0 0 20px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .search-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
}
</style>
