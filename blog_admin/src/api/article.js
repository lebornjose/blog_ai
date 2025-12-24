import request from '@/utils/request'

/**
 * 获取文章列表
 */
export function getArticleList(params) {
  return request({
    url: '/articles/list',
    method: 'get',
    params
  })
}

/**
 * 获取文章详情
 */
export function getArticleById(id) {
  return request({
    url: `/articles/${id}`,
    method: 'get'
  })
}

/**
 * 创建文章
 */
export function createArticle(data) {
  return request({
    url: '/articles',
    method: 'post',
    data
  })
}

/**
 * 更新文章
 */
export function updateArticle(id, data) {
  return request({
    url: `/articles/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除文章
 */
export function deleteArticle(id) {
  return request({
    url: `/articles/${id}`,
    method: 'delete'
  })
}


