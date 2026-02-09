<template>
  <div class="user-list">
    <div class="page-header">
      <h2>用户管理</h2>
      <a-space>
        <a-button type="primary" @click="showAddModal">
          <UserAddOutlined />
          添加用户
        </a-button>
        <a-button @click="fetchUsers">
          <ReloadOutlined />
          刷新
        </a-button>
      </a-space>
    </div>
    
    <!-- 搜索栏 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="用户名">
          <a-input
            v-model:value="searchForm.username"
            placeholder="请输入用户名"
            @press-enter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input
            v-model:value="searchForm.email"
            placeholder="请输入邮箱"
            @press-enter="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <SearchOutlined />
              搜索
            </a-button>
            <a-button @click="handleReset">
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
    
    <!-- 用户列表表格 -->
    <a-card style="margin-top: 16px;">
      <a-table
        :columns="columns"
        :data-source="users"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="uid"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar" v-if="record.avatar">
              {{ record.nick?.charAt(0) || record.username?.charAt(0) }}
            </a-avatar>
            <a-avatar v-else>
              {{ record.nick?.charAt(0) || record.username?.charAt(0) }}
            </a-avatar>
          </template>
          
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '1' ? 'green' : 'red'">
              {{ record.status === '1' ? '正常' : '禁用' }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'rate'">
            <a-tag color="blue" v-if="record.rate >= 90">管理员</a-tag>
            <a-tag color="cyan" v-else-if="record.rate >= 50">编辑</a-tag>
            <a-tag v-else>普通用户</a-tag>
          </template>
          
          <template v-if="column.key === 'addtime'">
            {{ formatDate(record.addtime) }}
          </template>
          
          <template v-if="column.key === 'lasttime'">
            {{ formatDate(record.lasttime) }}
          </template>
          
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewUser(record)">
                查看
              </a-button>
              <a-button type="link" size="small" @click="editUser(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个用户吗？"
                @confirm="deleteUserItem(record.uid)"
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
    
    <!-- 用户详情/编辑模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="600px"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        :model="currentUser"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="用户名">
          <a-input v-model:value="currentUser.username" disabled />
        </a-form-item>
        <a-form-item label="昵称">
          <a-input v-model:value="currentUser.nick" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="currentUser.email" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="currentUser.mobile" />
        </a-form-item>
        <a-form-item label="荣誉">
          <a-input v-model:value="currentUser.honour" />
        </a-form-item>
        <a-form-item label="权限等级">
          <a-input-number v-model:value="currentUser.rate" :min="0" :max="100" />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch
            v-model:checked="currentUser.status"
            checked-value="1"
            un-checked-value="0"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  UserAddOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'
import { getUserList, deleteUser } from '@/api/user'
import dayjs from 'dayjs'

const loading = ref(false)
const users = ref([])
const modalVisible = ref(false)
const modalTitle = ref('用户详情')
const currentUser = reactive({})

const searchForm = reactive({
  username: '',
  email: ''
})

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

const columns = [
  {
    title: '头像',
    key: 'avatar',
    width: 80
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '昵称',
    dataIndex: 'nick',
    key: 'nick'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '权限',
    key: 'rate'
  },
  {
    title: '登录次数',
    dataIndex: 'logins',
    key: 'logins'
  },
  {
    title: '状态',
    key: 'status'
  },
  {
    title: '注册时间',
    key: 'addtime'
  },
  {
    title: '最后登录',
    key: 'lasttime'
  },
  {
    title: '操作',
    key: 'action',
    width: 200
  }
]

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: pagination.current,
      limit: pagination.pageSize,
      ...searchForm
    })
    
    if (res.success) {
      users.value = res.data.users
      pagination.total = res.data.pagination.total
    }
  } catch (error) {
    message.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchUsers()
}

const handleSearch = () => {
  pagination.current = 1
  fetchUsers()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.email = ''
  pagination.current = 1
  fetchUsers()
}

const showAddModal = () => {
  modalTitle.value = '添加用户'
  Object.assign(currentUser, {
    username: '',
    nick: '',
    email: '',
    mobile: '',
    honour: '',
    rate: 0,
    status: '1'
  })
  modalVisible.value = true
}

const viewUser = (record) => {
  modalTitle.value = '用户详情'
  Object.assign(currentUser, { ...record })
  modalVisible.value = true
}

const editUser = (record) => {
  modalTitle.value = '编辑用户'
  Object.assign(currentUser, { ...record })
  modalVisible.value = true
}

const deleteUserItem = async (uid) => {
  try {
    await deleteUser(uid)
    message.success('删除成功')
    fetchUsers()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleModalOk = () => {
  // 这里应该调用更新用户的 API
  message.success('操作成功')
  modalVisible.value = false
  fetchUsers()
}

const handleModalCancel = () => {
  modalVisible.value = false
}

const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-list {
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

.search-card {
  border-radius: 8px;
}
</style>


