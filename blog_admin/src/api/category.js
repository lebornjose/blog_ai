import request from '@/utils/request'

/**
 * 获取分类列表
 */
export function getCategoryList(params) {
  return request({
    url: '/categories/list',
    method: 'get',
    params
  })
}

/**
 * 获取所有分类（不分页）
 */
export function getAllCategories() {
  return request({
    url: '/categories/all',
    method: 'get'
  })
}

/**
 * 获取分类详情
 */
export function getCategoryById(id) {
  return request({
    url: `/categories/${id}`,
    method: 'get'
  })
}

/**
 * 创建分类
 */
export function createCategory(data) {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

/**
 * 更新分类
 */
export function updateCategory(id, data) {
  return request({
    url: `/categories/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除分类
 */
export function deleteCategory(id) {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除分类
 */
export function batchDeleteCategories(ids) {
  return request({
    url: '/categories/batch-delete',
    method: 'post',
    data: { ids }
  })
}


