import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 侧边栏是否折叠
    collapsed: false,
    // 当前选中的菜单
    selectedKeys: ['dashboard'],
    // 打开的菜单
    openKeys: []
  }),

  actions: {
    // 切换侧边栏折叠状态
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },

    // 设置选中的菜单
    setSelectedKeys(keys) {
      this.selectedKeys = keys
    },

    // 设置打开的菜单
    setOpenKeys(keys) {
      this.openKeys = keys
    }
  }
})


