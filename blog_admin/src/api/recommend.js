import request from '@/utils/request'

/**
 * 获取推荐列表
 */
export function getRecommendList(params) {
  return request({
    url: '/recommends/list',
    method: 'get',
    params
  })
}

/**
 * 获取所有推荐（不分页）
 */
export function getAllRecommends() {
  return request({
    url: '/recommends/all',
    method: 'get'
  })
}

/**
 * 获取推荐详情
 */
export function getRecommendById(id) {
  return request({
    url: `/recommends/${id}`,
    method: 'get'
  })
}

/**
 * 创建推荐
 */
export function createRecommend(data) {
  return request({
    url: '/recommends',
    method: 'post',
    data
  })
}

/**
 * 更新推荐
 */
export function updateRecommend(id, data) {
  return request({
    url: `/recommends/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除推荐
 */
export function deleteRecommend(id) {
  return request({
    url: `/recommends/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除推荐
 */
export function batchDeleteRecommends(ids) {
  return request({
    url: '/recommends/batch-delete',
    method: 'post',
    data: { ids }
  })
}

