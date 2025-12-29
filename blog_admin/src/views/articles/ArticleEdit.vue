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
          <div ref="editorContainer" class="quill-editor"></div>
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
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getArticleById, createArticle, updateArticle } from '@/api/article'
import { getAllCategories } from '@/api/category'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const categoryLoading = ref(false)
const isEdit = ref(false)
const categories = ref([])
const editorContainer = ref(null)
let quillEditor = null
let isSettingContent = false // 标志位：是否正在设置内容

const form = reactive({
  title: '',
  caption: '',
  category_id: undefined,
  author: '',
  keywords: [],
  summary: '',
  content: ''
})

// 初始化 Quill 编辑器
const initEditor = () => {
  if (editorContainer.value && !quillEditor) {
    quillEditor = new Quill(editorContainer.value, {
      theme: 'snow',
      placeholder: '请输入文章内容...',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'align': [] }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
          ['clean']
        ]
      }
    })

    // 监听内容变化 - 只在非设置内容时同步
    quillEditor.on('text-change', () => {
      if (!isSettingContent) {
        form.content = quillEditor.root.innerHTML
      }
    })
  }
}

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
  
  // 获取编辑器内容
  const content = quillEditor.root.innerHTML
  if (!content || content.trim() === '' || content === '<p><br></p>') {
    message.error('请输入文章内容')
    return
  }

  loading.value = true
  try {
    // 将关键词数组转换为逗号分隔的字符串
    const submitData = {
      ...form,
      content: content, // 使用编辑器的 HTML 内容
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

  // 如果是编辑模式，先加载文章详情
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

  // 等待 DOM 更新后再初始化编辑器
  await nextTick()
  
  // 初始化编辑器
  initEditor()
  
  // 如果有内容，设置到编辑器
  if (quillEditor && form.content) {
    isSettingContent = true // 开始设置内容，暂停监听器同步
    await nextTick()
    
    // 使用 clipboard.dangerouslyPasteHTML 方法（Quill 官方推荐的设置 HTML 方式）
    quillEditor.clipboard.dangerouslyPasteHTML(form.content)
    
    await nextTick()
    isSettingContent = false // 恢复监听器同步
  }
})

onBeforeUnmount(() => {
  if (quillEditor) {
    quillEditor = null
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

/* Quill 编辑器样式 */
.quill-editor {
  background: white;
  min-height: 400px;
}

:deep(.ql-container) {
  font-size: 14px;
  min-height: 400px;
}

:deep(.ql-editor) {
  min-height: 400px;
  line-height: 1.8;
}

:deep(.ql-editor p) {
  margin: 10px 0;
}

:deep(.ql-toolbar) {
  background: #f8f9fa;
  border: 1px solid #d9d9d9;
  border-radius: 4px 4px 0 0;
}

:deep(.ql-container) {
  border: 1px solid #d9d9d9;
  border-top: none;
  border-radius: 0 0 4px 4px;
}
</style>
