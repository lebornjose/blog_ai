import { defineStore } from 'pinia'
import { login as loginApi, getUserProfile } from '@/api/user'
import { message } from 'ant-design-vue'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    isLoggedIn: !!localStorage.getItem('token')
  }),

  getters: {
    // 获取用户名
    username: (state) => state.userInfo.username || '',
    // 获取昵称
    nickname: (state) => state.userInfo.nick || state.userInfo.username || '',
    // 获取头像
    avatar: (state) => state.userInfo.avatar || '',
    // 获取权限等级
    rate: (state) => state.userInfo.rate || 0,
    // 是否是管理员
    isAdmin: (state) => state.userInfo.rate >= 90
  },

  actions: {
    // 用户登录
    async login(loginForm) {
      try {
        const res = await loginApi(loginForm)
        
        if (res.success) {
          const { token, user } = res.data
          
          // 保存 token 和用户信息
          this.token = token
          this.userInfo = user
          this.isLoggedIn = true
          
          localStorage.setItem('token', token)
          localStorage.setItem('userInfo', JSON.stringify(user))
          
          message.success('登录成功')
          return Promise.resolve(res)
        } else {
          message.error(res.message || '登录失败')
          return Promise.reject(res)
        }
      } catch (error) {
        console.error('登录失败:', error)
        message.error('登录失败，请稍后重试')
        return Promise.reject(error)
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const res = await getUserProfile()
        
        if (res.success) {
          this.userInfo = res.data
          localStorage.setItem('userInfo', JSON.stringify(res.data))
        }
        
        return res
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return Promise.reject(error)
      }
    },

    // 用户登出
    logout() {
      this.token = ''
      this.userInfo = {}
      this.isLoggedIn = false
      
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      message.success('已退出登录')
    },

    // 更新用户信息
    updateUserInfo(info) {
      this.userInfo = { ...this.userInfo, ...info }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    }
  }
})


