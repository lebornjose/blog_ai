<template>
  <a-layout class="layout-container">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      theme="dark"
      width="240"
    >
      <div class="logo">
        <h1 v-if="!collapsed">博客管理</h1>
        <h1 v-else>博客</h1>
      </div>
      
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
        @click="handleMenuClick"
      >
        <a-menu-item key="dashboard">
          <template #icon>
            <DashboardOutlined />
          </template>
          <span>仪表盘</span>
        </a-menu-item>
        
        <a-menu-item key="users">
          <template #icon>
            <UserOutlined />
          </template>
          <span>用户管理</span>
        </a-menu-item>
        
        <a-menu-item key="articles">
          <template #icon>
            <FileTextOutlined />
          </template>
          <span>文章管理</span>
        </a-menu-item>
        
        <a-menu-item key="categories">
          <template #icon>
            <TagsOutlined />
          </template>
          <span>分类管理</span>
        </a-menu-item>
        
        <a-menu-item key="recommends">
          <template #icon>
            <StarOutlined />
          </template>
          <span>推荐管理</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    
    <!-- 主内容区 -->
    <a-layout>
      <!-- 顶部导航栏 -->
      <a-layout-header class="layout-header">
        <div class="header-left">
          <MenuUnfoldOutlined
            v-if="collapsed"
            class="trigger"
            @click="toggleCollapsed"
          />
          <MenuFoldOutlined
            v-else
            class="trigger"
            @click="toggleCollapsed"
          />
        </div>
        
        <div class="header-right">
          <a-dropdown>
            <div class="user-info">
              <a-avatar :src="userStore.avatar" v-if="userStore.avatar">
                {{ userStore.nickname.charAt(0) }}
              </a-avatar>
              <a-avatar v-else>
                {{ userStore.nickname.charAt(0) }}
              </a-avatar>
              <span class="username">{{ userStore.nickname }}</span>
              <DownOutlined />
            </div>
            
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <UserOutlined />
                  个人中心
                </a-menu-item>
                <a-menu-item key="settings">
                  <SettingOutlined />
                  设置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      
      <!-- 内容区域 -->
      <a-layout-content class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>
      
      <!-- 底部 -->
      <a-layout-footer class="layout-footer">
        博客管理后台 ©2024 Created by Blog Team
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Modal } from 'ant-design-vue'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  TagsOutlined,
  StarOutlined,
  DownOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const collapsed = computed({
  get: () => appStore.collapsed,
  set: (val) => appStore.collapsed = val
})

const selectedKeys = ref(['dashboard'])
const openKeys = ref([])

// 监听路由变化，更新选中的菜单
watch(
  () => route.path,
  (newPath) => {
    const pathSegments = newPath.split('/').filter(Boolean)
    if (pathSegments.length > 0) {
      selectedKeys.value = [pathSegments[0]]
    }
  },
  { immediate: true }
)

const toggleCollapsed = () => {
  appStore.toggleCollapsed()
}

const handleMenuClick = ({ key }) => {
  router.push(`/${key}`)
}

const handleLogout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '确定要退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      userStore.logout()
      router.push('/login')
    }
  })
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
}

.logo h1 {
  color: white;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.layout-header {
  background: white;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 9;
}

.header-left {
  display: flex;
  align-items: center;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.username {
  margin-left: 4px;
  font-size: 14px;
}

.layout-content {
  margin: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  min-height: calc(100vh - 64px - 70px - 48px);
}

.layout-footer {
  text-align: center;
  color: #666;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>


