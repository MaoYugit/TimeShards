<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getGuestbookEntries, deleteGuestbookEntry, type GuestbookEntry } from '@/api/guestbook'

const tableData = ref<GuestbookEntry[]>([])
const loading = ref(false)
const total = ref(0)

const queryParams = ref({
  page: 1,
  pageSize: 10
})

// 获取留言列表
async function fetchEntries() {
  loading.value = true
  try {
    const res = await getGuestbookEntries(queryParams.value)
    tableData.value = res.data.items
    total.value = res.data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取留言列表失败')
  } finally {
    loading.value = false
  }
}

// 删除留言
async function handleDelete(row: GuestbookEntry) {
  try {
    await ElMessageBox.confirm('确定要删除这条留言吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    await deleteGuestbookEntry(row._id)
    ElMessage.success('删除成功')
    fetchEntries()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 分页变化
function handlePageChange(page: number) {
  queryParams.value.page = page
  fetchEntries()
}

function handleSizeChange(size: number) {
  queryParams.value.pageSize = size
  queryParams.value.page = 1
  fetchEntries()
}

// 格式化日期
function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

onMounted(() => {
  fetchEntries()
})
</script>

<template>
  <div class="guestbook">
    <h2 class="page-title">留言板管理</h2>
    
    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="昵称" width="120" />
        
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="email" label="邮箱" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.email || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="ip" label="IP" width="140" />
        
        <el-table-column prop="createdAt" label="时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="!loading && !tableData.length" description="暂无留言" />
      
      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
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

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
