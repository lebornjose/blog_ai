<template>
  <div class="article-edit">
    <h2>{{ isEdit ? '编辑文章' : '创建文章' }}</h2>
    
    <a-card>
      <a-form
        :model="form"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="标题" required>
          <a-input v-model:value="form.title" placeholder="请输入文章标题" />
        </a-form-item>
        
        <a-form-item label="分类" required>
          <a-select v-model:value="form.category_id" placeholder="请选择分类">
            <a-select-option value="1">技术</a-select-option>
            <a-select-option value="2">生活</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="内容" required>
          <a-textarea
            v-model:value="form.content"
            placeholder="请输入文章内容"
            :rows="10"
          />
        </a-form-item>
        
        <a-form-item :wrapper-col="{ offset: 4, span: 18 }">
          <a-space>
            <a-button type="primary" @click="handleSubmit" :loading="loading">
              {{ isEdit ? '更新' : '发布' }}
            </a-button>
            <a-button @click="$router.back()">
              取消
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getArticleById, createArticle, updateArticle } from '@/api/article'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const isEdit = ref(false)

const form = reactive({
  title: '',
  category_id: undefined,
  content: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      await updateArticle(route.params.id, form)
      message.success('更新成功')
    } else {
      await createArticle(form)
      message.success('创建成功')
    }
    router.push('/articles')
  } catch (error) {
    message.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (route.params.id) {
    isEdit.value = true
    try {
      const res = await getArticleById(route.params.id)
      if (res.success) {
        Object.assign(form, res.data)
      }
    } catch (error) {
      message.error('获取文章详情失败')
    }
  }
})
</script>

<style scoped>
.article-edit {
  padding: 0;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}
</style>


