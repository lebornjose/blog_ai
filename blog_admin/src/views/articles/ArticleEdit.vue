<template>
  <div class="article-edit">
    <h2>{{ isEdit ? '编辑文章' : '创建文章' }}</h2>
    
    <a-card>
      <a-form
        :model="form"
        :label-col="{ span: 3 }"
        :wrapper-col="{ span: 20 }"
      >
        <a-form-item label="标题" required>
          <a-input v-model:value="form.title" placeholder="请输入文章标题" size="large" />
        </a-form-item>

        <a-form-item label="副标题">
          <a-input v-model:value="form.caption" placeholder="请输入文章副标题（可选）" />
        </a-form-item>
        
        <a-form-item label="分类" required>
          <a-select 
            v-model:value="form.category_id" 
            placeholder="请选择分类"
            :loading="categoryLoading"
            show-search
            :filter-option="filterCategoryOption"
          >
            <a-select-option 
              v-for="category in categories" 
              :key="category.category_id" 
              :value="category.category_id"
            >
              {{ category.title }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="作者">
          <a-input v-model:value="form.author" placeholder="请输入作者名称" />
        </a-form-item>

        <a-form-item label="关键词">
          <a-select
            v-model:value="form.keywords"
            mode="tags"
            placeholder="输入关键词后按回车添加，可添加多个"
            style="width: 100%"
            :token-separators="[',', '，']"
          >
          </a-select>
          <div class="form-tip">提示：输入关键词后按回车键添加，多个关键词用逗号分隔</div>
        </a-form-item>

        <a-form-item label="摘要">
          <a-textarea
            v-model:value="form.summary"
            placeholder="请输入文章摘要（可选）"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item label="内容" required>
          <a-textarea
            v-model:value="form.content"
            placeholder="请输入文章内容"
            :rows="15"
          />
        </a-form-item>
        
        <a-form-item :wrapper-col="{ offset: 3, span: 20 }">
          <a-space>
            <a-button type="primary" @click="handleSubmit" :loading="loading" size="large">
              {{ isEdit ? '更新文章' : '发布文章' }}
            </a-button>
            <a-button @click="$router.back()" size="large">
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
import { getAllCategories } from '@/api/category'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const categoryLoading = ref(false)
const isEdit = ref(false)
const categories = ref([])

const form = reactive({
  title: '',
  caption: '',
  category_id: undefined,
  author: '',
  keywords: [],
  summary: '',
  content: ''
})

// 加载分类列表
const loadCategories = async () => {
  categoryLoading.value = true
  try {
    const res = await getAllCategories()
    if (res.success) {
      categories.value = res.data
    }
  } catch (error) {
    message.error('获取分类列表失败')
    console.error(error)
  } finally {
    categoryLoading.value = false
  }
}

// 分类搜索过滤
const filterCategoryOption = (input, option) => {
  return option.children[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const handleSubmit = async () => {
  // 验证必填字段
  if (!form.title) {
    message.error('请输入文章标题')
    return
  }
  if (!form.category_id) {
    message.error('请选择文章分类')
    return
  }
  if (!form.content) {
    message.error('请输入文章内容')
    return
  }

  loading.value = true
  try {
    // 将关键词数组转换为逗号分隔的字符串
    const submitData = {
      ...form,
      keyword: form.keywords.join(',')
    }
    delete submitData.keywords

    if (isEdit.value) {
      const res = await updateArticle(route.params.id, submitData)
      if (res.success) {
        message.success('更新成功')
        router.push('/articles')
      } else {
        message.error(res.message || '更新失败')
      }
    } else {
      const res = await createArticle(submitData)
      if (res.success) {
        message.success('创建成功')
        router.push('/articles')
      } else {
        message.error(res.message || '创建失败')
      }
    }
  } catch (error) {
    message.error(error.response?.data?.message || (isEdit.value ? '更新失败' : '创建失败'))
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 加载分类列表
  await loadCategories()

  // 如果是编辑模式，加载文章详情
  if (route.params.id) {
    isEdit.value = true
    try {
      const res = await getArticleById(route.params.id)
      if (res.success) {
        const article = res.data
        form.title = article.title || ''
        form.caption = article.caption || ''
        form.category_id = article.category_id || undefined
        form.author = article.author || ''
        form.keywords = article.keyword ? article.keyword.split(',').filter(k => k.trim()) : []
        form.summary = article.summary || ''
        form.content = article.content || ''
      }
    } catch (error) {
      message.error('获取文章详情失败')
      console.error(error)
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

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
}

:deep(.ant-card-body) {
  padding: 32px;
}
</style>
