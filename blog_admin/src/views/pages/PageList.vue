<template>
  <div class="page-list-container">
    <div class="page-header">
      <h2>页面管理</h2>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <a-space>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索标题或描述"
          style="width: 300px"
          @search="handleSearch"
          allow-clear
        />
        <a-button type="primary" @click="showCreateModal">
          <template #icon><PlusOutlined /></template>
          新建页面
        </a-button>
        <a-button
          danger
          :disabled="selectedRowKeys.length === 0"
          @click="handleBatchDelete"
        >
          <template #icon><DeleteOutlined /></template>
          批量删除
        </a-button>
      </a-space>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="pageList"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange
      }"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange"
      row-key="page_id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'content_preview'">
          <div class="content-preview">
            {{ record.content_preview }}
            <span v-if="record.content_length > 200" class="more">...</span>
          </div>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="showEditModal(record)">
              编辑
            </a-button>
            <a-popconfirm
              title="确定要删除这个页面吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record.page_id)"
            >
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 创建/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="900"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        :model="form"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
      >
        <a-form-item label="标题" required>
          <a-input
            v-model:value="form.title"
            placeholder="请输入标题（最多30个字符）"
            :maxlength="30"
            show-count
          />
        </a-form-item>

        <a-form-item label="描述">
          <a-textarea
            v-model:value="form.describe"
            placeholder="请输入描述（最多500个字符）"
            :rows="3"
            :maxlength="500"
            show-count
          />
        </a-form-item>

        <a-form-item label="内容" :wrapper-col="{ span: 24 }">
          <div class="editor-wrapper">
            <div ref="editorContainer" class="editor-container"></div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import {
  getPageList,
  createPage,
  updatePage,
  deletePage,
  batchDeletePages,
  getPageById
} from '@/api/page'

// 表格列定义
const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 200
  },
  {
    title: '描述',
    dataIndex: 'describe',
    key: 'describe',
    width: 300,
    ellipsis: true
  },
  {
    title: '内容预览',
    key: 'content_preview',
    width: 300,
    ellipsis: true
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right'
  }
]

// 数据
const pageList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const selectedRowKeys = ref([])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
  locale: {
    items_per_page: '条/页',
    jump_to: '跳至',
    jump_to_confirm: '确定',
    page: '页'
  }
})

// 弹窗
const modalVisible = ref(false)
const modalTitle = ref('新建页面')
const isEdit = ref(false)
const currentPageId = ref(null)

// 表单
const form = reactive({
  title: '',
  describe: '',
  content: ''
})

// 编辑器
const editorContainer = ref(null)
let quillEditor = null
let isSettingContent = false

// 初始化编辑器
const initEditor = async () => {
  await nextTick()
  if (editorContainer.value && !quillEditor) {
    quillEditor = new Quill(editorContainer.value, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['link', 'image'],
          ['clean']
        ]
      },
      placeholder: '请输入页面内容...'
    })

    // 监听内容变化
    quillEditor.on('text-change', () => {
      if (!isSettingContent) {
        form.content = quillEditor.root.innerHTML
      }
    })
  }
}

// 销毁编辑器
const destroyEditor = () => {
  if (quillEditor) {
    quillEditor = null
  }
}

// 设置编辑器内容
const setEditorContent = async (content) => {
  if (quillEditor) {
    isSettingContent = true
    await nextTick()
    quillEditor.clipboard.dangerouslyPasteHTML(content || '')
    await nextTick()
    isSettingContent = false
  }
}

// 加载页面列表
const loadPages = async () => {
  loading.value = true
  try {
    const response = await getPageList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value
    })

    if (response.success) {
      pageList.value = response.data.list
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    message.error('加载页面列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadPages()
}

// 表格变化
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadPages()
}

// 选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 显示创建弹窗
const showCreateModal = async () => {
  modalTitle.value = '新建页面'
  isEdit.value = false
  currentPageId.value = null
  form.title = ''
  form.describe = ''
  form.content = ''
  modalVisible.value = true
  await initEditor()
  await setEditorContent('')
}

// 显示编辑弹窗
const showEditModal = async (record) => {
  modalTitle.value = '编辑页面'
  isEdit.value = true
  currentPageId.value = record.page_id
  modalVisible.value = true

  try {
    const response = await getPageById(record.page_id)
    if (response.success) {
      const data = response.data
      form.title = data.title
      form.describe = data.describe || ''
      form.content = data.content || ''
      await initEditor()
      await setEditorContent(data.content || '')
    }
  } catch (error) {
    message.error('加载页面详情失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!form.title) {
    message.warning('请输入标题')
    return
  }

  // 获取编辑器内容
  if (quillEditor) {
    form.content = quillEditor.root.innerHTML
  }

  try {
    const data = {
      title: form.title,
      describe: form.describe,
      content: form.content
    }

    if (isEdit.value) {
      await updatePage(currentPageId.value, data)
      message.success('页面更新成功')
    } else {
      await createPage(data)
      message.success('页面创建成功')
    }

    modalVisible.value = false
    loadPages()
  } catch (error) {
    message.error(isEdit.value ? '页面更新失败' : '页面创建失败')
  }
}

// 取消
const handleCancel = () => {
  modalVisible.value = false
  destroyEditor()
}

// 删除
const handleDelete = async (id) => {
  try {
    await deletePage(id)
    message.success('删除成功')
    loadPages()
  } catch (error) {
    message.error('删除失败')
  }
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的页面')
    return
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个页面吗？`,
    onOk: async () => {
      try {
        await batchDeletePages(selectedRowKeys.value)
        message.success('批量删除成功')
        selectedRowKeys.value = []
        loadPages()
      } catch (error) {
        message.error('批量删除失败')
      }
    }
  })
}

// 生命周期
onMounted(() => {
  loadPages()
})

onBeforeUnmount(() => {
  destroyEditor()
})
</script>

<style scoped>
.page-list-container {
  padding: 24px;
  background: #fff;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.toolbar {
  margin-bottom: 16px;
}

.content-preview {
  color: #666;
  font-size: 12px;
}

.content-preview .more {
  color: #999;
}

.editor-wrapper {
  width: 100%;
}

.editor-container {
  height: 400px;
  background: #fff;
}

:deep(.ql-container) {
  height: calc(100% - 42px);
  font-size: 14px;
}

:deep(.ql-editor) {
  min-height: 300px;
}

:deep(.ql-editor p) {
  margin: 8px 0;
  line-height: 1.6;
}
</style>
