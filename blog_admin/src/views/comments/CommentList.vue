<template>
  <div class="comment-list">
    <h2>评论管理</h2>
    
    <a-card>
      <a-table
        :columns="columns"
        :data-source="comments"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-popconfirm
              title="确定要删除这条评论吗？"
              @confirm="deleteCommentItem(record.id)"
            >
              <a-button type="link" danger size="small">
                删除
              </a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getCommentList, deleteComment } from '@/api/comment'

const loading = ref(false)
const comments = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  { title: '内容', dataIndex: 'content', key: 'content' },
  { title: '作者', dataIndex: 'author', key: 'author' },
  { title: '文章', dataIndex: 'article_title', key: 'article_title' },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
  { title: '操作', key: 'action', width: 100 }
]

const fetchComments = async () => {
  loading.value = true
  try {
    const res = await getCommentList({
      page: pagination.current,
      limit: pagination.pageSize
    })
    
    if (res.success) {
      comments.value = res.data.comments
      pagination.total = res.data.pagination.total
    }
  } catch (error) {
    message.error('获取评论列表失败')
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchComments()
}

const deleteCommentItem = async (id) => {
  try {
    await deleteComment(id)
    message.success('删除成功')
    fetchComments()
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchComments()
})
</script>

<style scoped>
.comment-list {
  padding: 0;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}
</style>


