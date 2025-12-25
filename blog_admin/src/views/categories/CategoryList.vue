<template>
  <div class="category-list">
    <div class="page-header">
      <h2>分类管理</h2>
      <a-space>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索分类标题/关键词"
          style="width: 250px"
          @search="handleSearch"
        />
        <a-button type="primary" @click="showAddModal">
          <PlusOutlined />
          添加分类
        </a-button>
      </a-space>
    </div>
    
    <a-card>
      <a-table
        :columns="columns"
        :data-source="categories"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        :row-key="record => record.category_id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'parent_id'">
            {{ record.parent_id === 0 ? '顶级分类' : `子分类(${record.parent_id})` }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="editCategory(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个分类吗？"
                @confirm="deleteCategoryItem(record.category_id)"
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
      width="600px"
    >
      <a-form :model="currentCategory" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="分类标题" required>
          <a-input v-model:value="currentCategory.title" placeholder="请输入分类标题" />
        </a-form-item>
        <a-form-item label="父分类">
          <a-input-number v-model:value="currentCategory.parent_id" :min="0" style="width: 100%" placeholder="0为顶级分类" />
        </a-form-item>
        <a-form-item label="排序索引">
          <a-input-number v-model:value="currentCategory.index" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="子分类数量">
          <a-input-number v-model:value="currentCategory.children" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="每页数量">
          <a-input-number v-model:value="currentCategory.pagesize" :min="1" style="width: 100%" />
        </a-form-item>
        <a-form-item label="关键词">
          <a-input v-model:value="currentCategory.keyword" placeholder="用于搜索的关键词" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="currentCategory.describe" :rows="4" placeholder="分类描述" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getCategoryList, createCategory, updateCategory, deleteCategory } from '@/api/category'

const loading = ref(false)
const categories = ref([])
const modalVisible = ref(false)
const modalTitle = ref('添加分类')
const searchKeyword = ref('')

const currentCategory = reactive({
  title: '',
  parent_id: 0,
  index: 10,
  children: 10,
  pagesize: 20,
  keyword: '',
  describe: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
})

const columns = [
  { title: 'ID', dataIndex: 'category_id', key: 'category_id', width: 80 },
  { title: '分类标题', dataIndex: 'title', key: 'title', width: 150 },
  { title: '父分类', dataIndex: 'parent_id', key: 'parent_id', width: 120 },
  { title: '排序', dataIndex: 'index', key: 'index', width: 80 },
  { title: '子分类数', dataIndex: 'children', key: 'children', width: 100 },
  { title: '每页数', dataIndex: 'pagesize', key: 'pagesize', width: 90 },
  { title: '关键词', dataIndex: 'keyword', key: 'keyword', ellipsis: true },
  { title: '描述', dataIndex: 'describe', key: 'describe', ellipsis: true },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getCategoryList({
      pagesize: pagination.pageSize,
      index: pagination.current,
      keyword: searchKeyword.value
    })
    if (res.success) {
      categories.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    message.error('获取分类列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchCategories()
}

const handleSearch = () => {
  pagination.current = 1
  fetchCategories()
}

const showAddModal = () => {
  modalTitle.value = '添加分类'
  currentCategory.title = ''
  currentCategory.parent_id = 0
  currentCategory.index = 10
  currentCategory.children = 10
  currentCategory.pagesize = 20
  currentCategory.keyword = ''
  currentCategory.describe = ''
  delete currentCategory.category_id
  modalVisible.value = true
}

const editCategory = (record) => {
  modalTitle.value = '编辑分类'
  Object.assign(currentCategory, {
    category_id: record.category_id,
    title: record.title,
    parent_id: record.parent_id,
    index: record.index,
    children: record.children,
    pagesize: record.pagesize,
    keyword: record.keyword,
    describe: record.describe
  })
  modalVisible.value = true
}

const deleteCategoryItem = async (id) => {
  try {
    const res = await deleteCategory(id)
    if (res.success) {
      message.success('删除成功')
      fetchCategories()
    } else {
      message.error(res.message || '删除失败')
    }
  } catch (error) {
    message.error(error.response?.data?.message || '删除失败')
  }
}

const handleModalOk = async () => {
  if (!currentCategory.title) {
    message.error('请输入分类标题')
    return
  }

  try {
    let res
    if (currentCategory.category_id) {
      res = await updateCategory(currentCategory.category_id, currentCategory)
    } else {
      res = await createCategory(currentCategory)
    }
    
    if (res.success) {
      message.success('操作成功')
      modalVisible.value = false
      fetchCategories()
    } else {
      message.error(res.message || '操作失败')
    }
  } catch (error) {
    message.error(error.response?.data?.message || '操作失败')
    console.error(error)
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.category-list {
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
