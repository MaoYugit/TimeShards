<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getChatMessages, type ChatMessage } from '@/api/chat'

const messages = ref<ChatMessage[]>([])
const loading = ref(false)

// 获取历史消息
async function fetchMessages() {
  loading.value = true
  try {
    const res = await getChatMessages({ limit: 100 })
    messages.value = res.data.items
  } catch (error: any) {
    ElMessage.error(error.message || '获取消息失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date))
}

// 获取头像颜色
function getAvatarColor(hue: number) {
  return `hsl(${hue}, 70%, 60%)`
}

// 获取昵称首字母
function getInitial(nickname: string) {
  return nickname.charAt(0).toUpperCase()
}

onMounted(() => {
  fetchMessages()
})
</script>

<template>
  <div class="chat">
    <h2 class="page-title">聊天室管理</h2>
    
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>聊天记录</span>
          <el-button icon="Refresh" @click="fetchMessages" :loading="loading">刷新</el-button>
        </div>
      </template>
      
      <div class="message-list" v-loading="loading">
        <div v-for="msg in messages" :key="msg._id" class="message-item">
          <div
            class="avatar"
            :style="{ backgroundColor: getAvatarColor(msg.avatarHue) }"
          >
            {{ getInitial(msg.nickname) }}
          </div>
          
          <div class="message-content">
            <div class="message-header">
              <span class="nickname">{{ msg.nickname }}</span>
              <span class="time">{{ formatDate(msg.createdAt) }}</span>
            </div>
            <div class="text">{{ msg.text }}</div>
          </div>
        </div>
        
        <el-empty v-if="!loading && !messages.length" description="暂无消息" />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.chat {
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

  .message-list {
    max-height: 600px;
    overflow-y: auto;
  }

  .message-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 600;
      font-size: 16px;
      flex-shrink: 0;
    }

    .message-content {
      flex: 1;
      min-width: 0;

      .message-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 4px;

        .nickname {
          font-weight: 600;
          color: #303133;
          font-size: 14px;
        }

        .time {
          font-size: 12px;
          color: #909399;
        }
      }

      .text {
        color: #606266;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
      }
    }
  }
}
</style>
