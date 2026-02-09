import request from '@/utils/request'

// 获取页面列表（分页）
export const getPageList = (params) => {
  return request({
    url: '/pages/list',
    method: 'get',
    params
  })
}

// 获取所有页面（不分页）
export const getAllPages = () => {
  return request({
    url: '/pages/all',
    method: 'get'
  })
}

// 获取单个页面
export const getPageById = (id) => {
  return request({
    url: `/pages/${id}`,
    method: 'get'
  })
}

// 创建页面
export const createPage = (data) => {
  return request({
    url: '/pages',
    method: 'post',
    data
  })
}

// 更新页面
export const updatePage = (id, data) => {
  return request({
    url: `/pages/${id}`,
    method: 'put',
    data
  })
}

// 删除页面
export const deletePage = (id) => {
  return request({
    url: `/pages/${id}`,
    method: 'delete'
  })
}

// 批量删除页面
export const batchDeletePages = (ids) => {
  return request({
    url: '/pages/batch-delete',
    method: 'post',
    data: { ids }
  })
}
