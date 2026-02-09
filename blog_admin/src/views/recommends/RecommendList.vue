<template>
  <div class="recommend-list">
    <div class="page-header">
      <h2>推荐管理</h2>
      <a-space>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索标题/描述"
          style="width: 250px"
          @search="handleSearch"
        />
        <a-button type="primary" @click="showAddModal">
          <PlusOutlined />
          添加推荐
        </a-button>
      </a-space>
    </div>
    
    <a-card>
      <a-table
        :columns="columns"
        :data-source="recommends"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        :row-key="record => record.commend_id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'url'">
            <a :href="record.url" target="_blank" v-if="record.url">
              {{ record.url }}
            </a>
            <span v-else>-</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="editRecommend(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个推荐吗？"
                @confirm="deleteRecommendItem(record.commend_id)"
              >
                <a-button type="link" danger size="small">
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      width="700px"
    >
      <a-form :model="currentRecommend" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-form-item label="标题" required>
          <a-input v-model:value="currentRecommend.title" placeholder="请输入推荐标题" />
        </a-form-item>
        <a-form-item label="链接">
          <a-input v-model:value="currentRecommend.url" placeholder="请输入链接地址" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="currentRecommend.index" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="currentRecommend.note" :rows="3" placeholder="备注信息" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="currentRecommend.describe" :rows="4" placeholder="详细描述" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getRecommendList, createRecommend, updateRecommend, deleteRecommend } from '@/api/recommend'

const loading = ref(false)
const recommends = ref([])
const modalVisible = ref(false)
const modalTitle = ref('添加推荐')
const searchKeyword = ref('')

const currentRecommend = reactive({
  title: '',
  url: '',
  index: 0,
  note: '',
  describe: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
  locale: {
    items_per_page: '条/页',
    jump_to: '跳至',
    jump_to_confirm: '确定',
    page: '页'
  }
})

const columns = [
  { title: '标题', dataIndex: 'title', key: 'title', width: 200 },
  { title: '链接', dataIndex: 'url', key: 'url', ellipsis: true, width: 300 },
  { title: '排序', dataIndex: 'index', key: 'index', width: 80 },
  { title: '备注', dataIndex: 'note', key: 'note', ellipsis: true },
  { title: '描述', dataIndex: 'describe', key: 'describe', ellipsis: true },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

const fetchRecommends = async () => {
  loading.value = true
  try {
    const res = await getRecommendList({
      pagesize: pagination.pageSize,
      index: pagination.current,
      keyword: searchKeyword.value
    })
    if (res.success) {
      recommends.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    message.error('获取推荐列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchRecommends()
}

const handleSearch = () => {
  pagination.current = 1
  fetchRecommends()
}

const showAddModal = () => {
  modalTitle.value = '添加推荐'
  currentRecommend.title = ''
  currentRecommend.url = ''
  currentRecommend.index = 0
  currentRecommend.note = ''
  currentRecommend.describe = ''
  delete currentRecommend.commend_id
  modalVisible.value = true
}

const editRecommend = (record) => {
  modalTitle.value = '编辑推荐'
  Object.assign(currentRecommend, {
    commend_id: record.commend_id,
    title: record.title,
    url: record.url,
    index: record.index,
    note: record.note,
    describe: record.describe
  })
  modalVisible.value = true
}

const deleteRecommendItem = async (id) => {
  try {
    const res = await deleteRecommend(id)
    if (res.success) {
      message.success('删除成功')
      fetchRecommends()
    } else {
      message.error(res.message || '删除失败')
    }
  } catch (error) {
    message.error(error.response?.data?.message || '删除失败')
  }
}

const handleModalOk = async () => {
  if (!currentRecommend.title) {
    message.error('请输入推荐标题')
    return
  }

  try {
    let res
    if (currentRecommend.commend_id) {
      res = await updateRecommend(currentRecommend.commend_id, currentRecommend)
    } else {
      res = await createRecommend(currentRecommend)
    }
    
    if (res.success) {
      message.success('操作成功')
      modalVisible.value = false
      fetchRecommends()
    } else {
      message.error(res.message || '操作失败')
    }
  } catch (error) {
    message.error(error.response?.data?.message || '操作失败')
    console.error(error)
  }
}

onMounted(() => {
  fetchRecommends()
})
</script>

<style scoped>
.recommend-list {
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

