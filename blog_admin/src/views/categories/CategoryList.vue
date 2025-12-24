<template>
  <div class="category-list">
    <div class="page-header">
      <h2>分类管理</h2>
      <a-button type="primary" @click="showAddModal">
        <PlusOutlined />
        添加分类
      </a-button>
    </div>
    
    <a-card>
      <a-table
        :columns="columns"
        :data-source="categories"
        :loading="loading"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="editCategory(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个分类吗？"
                @confirm="deleteCategoryItem(record.id)"
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
    >
      <a-form :model="currentCategory">
        <a-form-item label="分类名称" required>
          <a-input v-model:value="currentCategory.name" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="currentCategory.description" />
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
const currentCategory = reactive({ name: '', description: '' })

const columns = [
  { title: '分类名称', dataIndex: 'name', key: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '文章数', dataIndex: 'article_count', key: 'article_count' },
  { title: '操作', key: 'action', width: 150 }
]

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getCategoryList()
    if (res.success) {
      categories.value = res.data.categories
    }
  } catch (error) {
    message.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const showAddModal = () => {
  modalTitle.value = '添加分类'
  currentCategory.name = ''
  currentCategory.description = ''
  modalVisible.value = true
}

const editCategory = (record) => {
  modalTitle.value = '编辑分类'
  Object.assign(currentCategory, record)
  modalVisible.value = true
}

const deleteCategoryItem = async (id) => {
  try {
    await deleteCategory(id)
    message.success('删除成功')
    fetchCategories()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleModalOk = async () => {
  try {
    if (currentCategory.id) {
      await updateCategory(currentCategory.id, currentCategory)
    } else {
      await createCategory(currentCategory)
    }
    message.success('操作成功')
    modalVisible.value = false
    fetchCategories()
  } catch (error) {
    message.error('操作失败')
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


