<template>
  <div class="article-list">
    <div class="page-header">
      <h2>文章管理</h2>
      <a-button type="primary" @click="$router.push('/articles/create')">
        <FileAddOutlined />
        创建文章
      </a-button>
    </div>
    
    <a-card>
      <a-table
        :columns="columns"
        :data-source="articles"
        :loading="loading"
        :pagination="pagination"
        :row-key="record => record.article_id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="editArticle(record.article_id)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这篇文章吗？"
                @confirm="deleteArticleItem(record.article_id)"
              >
                <a-button type="link" danger size="small">
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
          <template v-else-if="column.key === 'pubtime'">
            {{ record.pubtime ? new Date(record.pubtime * 1000).toLocaleString('zh-CN') : '-' }}
          </template>
          <template v-else-if="column.key === 'keyword'">
            <a-space v-if="record.keyword" wrap>
              <a-tag v-for="(kw, idx) in record.keyword.split(',').filter(k => k.trim())" :key="idx" color="blue">
                {{ kw.trim() }}
              </a-tag>
            </a-space>
            <span v-else>-</span>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { FileAddOutlined } from '@ant-design/icons-vue'
import { getArticleList, deleteArticle } from '@/api/article'

const router = useRouter()
const loading = ref(false)
const articles = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true, width: 250 },
  { title: '副标题', dataIndex: 'caption', key: 'caption', ellipsis: true, width: 200 },
  { title: '作者', dataIndex: 'author', key: 'author', width: 100 },
  { title: '关键词', dataIndex: 'keyword', key: 'keyword', ellipsis: true, width: 150 },
  { title: '阅读量', dataIndex: 'seeds', key: 'seeds', width: 80 },
  { 
    title: '发布时间', 
    dataIndex: 'pubtime', 
    key: 'pubtime',
    width: 180,
    customRender: ({ text }) => {
      return text ? new Date(text * 1000).toLocaleString('zh-CN') : '-'
    }
  },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

const fetchArticles = async () => {
  loading.value = true
  try {
    const res = await getArticleList({
      page: pagination.current,
      limit: pagination.pageSize
    })
    
    if (res.success) {
      articles.value = res.data.articles
      pagination.total = res.data.pagination.total
      pagination.current = res.data.pagination.page
      pagination.pageSize = res.data.pagination.limit
    }
  } catch (error) {
    message.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchArticles()
}

const editArticle = (id) => {
  router.push(`/articles/edit/${id}`)
}

const deleteArticleItem = async (id) => {
  try {
    await deleteArticle(id)
    message.success('删除成功')
    fetchArticles()
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.article-list {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}
</style>


