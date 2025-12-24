import request from '@/utils/request'

/**
 * 用户登录
 */
export function login(data) {
  return request({
    url: '/users/login',
    method: 'post',
    data
  })
}

/**
 * 获取当前用户信息
 */
export function getUserProfile() {
  return request({
    url: '/users/profile',
    method: 'get'
  })
}

/**
 * 更新用户信息
 */
export function updateUserProfile(data) {
  return request({
    url: '/users/profile',
    method: 'put',
    data
  })
}

/**
 * 获取用户列表
 */
export function getUserList(params) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

/**
 * 获取用户详情
 */
export function getUserById(id) {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}


