<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { getPostById, createPost, updatePost } from '@/api/blog'
import type { CreatePostDto, UpdatePostDto, BlogCategory } from '@/types/blog'

const router = useRouter()
const route = useRoute()

// 是否编辑模式
const isEdit = computed(() => !!route.params.id)
const postId = computed(() => route.params.id as string)

// 表单数据
const form = reactive({
  title: '',
  slug: '',
  summary: '',
  category: '' as BlogCategory | '',
  tags: [] as string[],
  content: '',
  status: 'draft' as 'draft' | 'published'
})

// 标签输入
const tagInput = ref('')

// 加载状态
const loading = ref(false)
const saving = ref(false)

// 分类选项
const categoryOptions: BlogCategory[] = ['前端', '工程化', 'AI 开发', '随笔']

// 表单规则
const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
}

const formRef = ref()

// 获取文章详情
async function fetchPost() {
  if (!isEdit.value) return
  
  loading.value = true
  try {
    const res = await getPostById(postId.value)
    const post = res.data
    form.title = post.title
    form.slug = post.slug
    form.summary = post.summary
    form.category = post.category
    form.tags = post.tags || []
    form.content = post.content
    form.status = post.status
  } catch (error: any) {
    ElMessage.error(error.message || '获取文章详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 添加标签
function handleAddTag() {
  const tag = tagInput.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
  }
  tagInput.value = ''
}

// 删除标签
function handleRemoveTag(index: number) {
  form.tags.splice(index, 1)
}

// 保存文章
async function handleSave(status: 'draft' | 'published') {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  saving.value = true
  try {
    const data = {
      title: form.title,
      slug: form.slug || undefined,
      summary: form.summary || undefined,
      category: form.category as BlogCategory,
      tags: form.tags,
      content: form.content,
      status
    }

    if (isEdit.value) {
      await updatePost(postId.value, data as UpdatePostDto)
      ElMessage.success('更新成功')
    } else {
      await createPost(data as CreatePostDto)
      ElMessage.success('创建成功')
    }
    
    router.push('/content/posts')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 取消
function handleCancel() {
  router.back()
}

onMounted(() => {
  fetchPost()
})
</script>

<template>
  <div class="post-editor">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑文章' : '新建文章' }}</h2>
      <div class="page-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button @click="handleSave('draft')" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="handleSave('published')" :loading="saving">
          {{ isEdit ? '更新发布' : '发布文章' }}
        </el-button>
      </div>
    </div>
    
    <el-card shadow="never" v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
      >
        <el-form-item label="文章标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入文章标题"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="item in categoryOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="Slug（可选）">
              <el-input
                v-model="form.slug"
                placeholder="留空自动生成"
                maxlength="200"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="摘要（可选）">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="2"
            placeholder="留空自动截取正文前 150 字"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="标签">
          <div class="tags-input">
            <el-tag
              v-for="(tag, index) in form.tags"
              :key="tag"
              closable
              @close="handleRemoveTag(index)"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-model="tagInput"
              placeholder="输入标签后回车"
              style="width: 150px"
              @keyup.enter="handleAddTag"
              @blur="handleAddTag"
            />
          </div>
        </el-form-item>
        
        <el-form-item label="文章内容" prop="content">
          <div class="editor-wrapper">
            <MdEditor
              v-model="form.content"
              :preview="true"
              style="height: 500px"
            />
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.post-editor {
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    
    @media screen and (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }

  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .page-actions {
    display: flex;
    gap: 8px;
  }

  .tags-input {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .tag-item {
    margin: 0;
  }

  .editor-wrapper {
    width: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
  }
}
</style>
