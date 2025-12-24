<template>
  <div class="dashboard">
    <h2>欢迎回来，{{ userStore.nickname }}！</h2>
    <p class="subtitle">这是您的仪表盘概览</p>
    
    <a-row :gutter="16" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic
            title="总用户数"
            :value="stats.users"
            :prefix="h(UserOutlined)"
          >
            <template #suffix>
              <span class="trend up">+12%</span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic
            title="总文章数"
            :value="stats.articles"
            :prefix="h(FileTextOutlined)"
          >
            <template #suffix>
              <span class="trend up">+8%</span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic
            title="总评论数"
            :value="stats.comments"
            :prefix="h(CommentOutlined)"
          >
            <template #suffix>
              <span class="trend up">+23%</span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic
            title="总分类数"
            :value="stats.categories"
            :prefix="h(TagsOutlined)"
          />
        </a-card>
      </a-col>
    </a-row>
    
    <a-row :gutter="16" style="margin-top: 24px;">
      <a-col :xs="24" :lg="12">
        <a-card title="快捷操作" class="quick-actions">
          <a-space direction="vertical" style="width: 100%;">
            <a-button type="primary" block @click="$router.push('/articles/create')">
              <FileAddOutlined />
              创建新文章
            </a-button>
            <a-button block @click="$router.push('/users')">
              <UserAddOutlined />
              管理用户
            </a-button>
            <a-button block @click="$router.push('/categories')">
              <TagOutlined />
              管理分类
            </a-button>
          </a-space>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :lg="12">
        <a-card title="系统信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="用户名">
              {{ userStore.username }}
            </a-descriptions-item>
            <a-descriptions-item label="昵称">
              {{ userStore.nickname }}
            </a-descriptions-item>
            <a-descriptions-item label="权限等级">
              {{ userStore.rate }}
              <a-tag color="blue" v-if="userStore.isAdmin">管理员</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="登录次数">
              {{ userStore.userInfo.logins || 0 }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  UserOutlined,
  FileTextOutlined,
  CommentOutlined,
  TagsOutlined,
  FileAddOutlined,
  UserAddOutlined,
  TagOutlined
} from '@ant-design/icons-vue'

const userStore = useUserStore()

const stats = ref({
  users: 0,
  articles: 0,
  comments: 0,
  categories: 0
})

// 这里可以调用 API 获取真实的统计数据
// 暂时使用模拟数据
stats.value = {
  users: 128,
  articles: 456,
  comments: 1289,
  categories: 12
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  margin-bottom: 24px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.trend {
  font-size: 14px;
  margin-left: 8px;
}

.trend.up {
  color: #52c41a;
}

.trend.down {
  color: #ff4d4f;
}

.quick-actions :deep(.ant-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
}
</style>


