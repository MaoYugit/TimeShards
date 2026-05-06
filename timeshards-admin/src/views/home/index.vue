<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getHomepageConfig, updateHomepageConfig, type HomepageConfig } from '@/api/siteConfig'

const loading = ref(false)
const saving = ref(false)

const form = ref<HomepageConfig>({
  welcomeQuote: '',
  welcomeIntro: ''
})

// 获取配置
async function fetchConfig() {
  loading.value = true
  try {
    const res = await getHomepageConfig()
    form.value = res.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取配置失败')
  } finally {
    loading.value = false
  }
}

// 保存配置
async function handleSave() {
  saving.value = true
  try {
    await updateHomepageConfig(form.value)
    ElMessage.success('保存成功')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <div class="home-config" v-loading="loading">
    <h2 class="page-title">首页配置</h2>
    
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>欢迎区域配置</span>
          <el-button type="primary" icon="Check" :loading="saving" @click="handleSave">保存配置</el-button>
        </div>
      </template>
      
      <el-form :model="form" label-position="top" style="max-width: 600px">
        <el-form-item label="欢迎语">
          <el-input
            v-model="form.welcomeQuote"
            type="textarea"
            :rows="3"
            placeholder="「欢迎来到 TimeShards —— 愿这片小站能成为你浏览路上的一处歇脚点。」"
            maxlength="500"
            show-word-limit
          />
          <div class="form-tip">显示在首页顶部的欢迎文字</div>
        </el-form-item>
        
        <el-form-item label="介绍文字">
          <el-input
            v-model="form.welcomeIntro"
            type="textarea"
            :rows="4"
            placeholder="这里是我的个人站点：记录作品集、博客与一些实验。"
            maxlength="1000"
            show-word-limit
          />
          <div class="form-tip">欢迎语下方的介绍文字</div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 预览区域 -->
    <el-card shadow="never" class="mt-16">
      <template #header>
        <span>预览效果</span>
      </template>
      
      <div class="preview">
        <article class="welcome-card" aria-label="欢迎与介绍">
          <p class="welcome-quote">{{ form.welcomeQuote || '「欢迎来到 TimeShards」' }}</p>
          <p class="welcome-intro">{{ form.welcomeIntro || '介绍文字...' }}</p>
        </article>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.home-config {
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

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .mt-16 {
    margin-top: 16px;
  }

  .preview {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 24px;
    color: #fff;
  }

  .welcome-card {
    .welcome-quote {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 12px;
      line-height: 1.6;
    }

    .welcome-intro {
      font-size: 14px;
      margin: 0;
      opacity: 0.9;
      line-height: 1.6;
    }
  }
}
</style>
