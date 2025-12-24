const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// 获取文章的评论列表
router.get('/article/:articleId', commentController.getCommentsByArticle);

// 创建评论（需要认证）
router.post('/', authMiddleware, commentController.createComment);

// 删除评论（需要认证）
router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router;

