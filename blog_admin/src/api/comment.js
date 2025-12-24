import request from '@/utils/request'

/**
 * 获取评论列表
 */
export function getCommentList(params) {
  return request({
    url: '/comments',
    method: 'get',
    params
  })
}

/**
 * 删除评论
 */
export function deleteComment(id) {
  return request({
    url: `/comments/${id}`,
    method: 'delete'
  })
}


