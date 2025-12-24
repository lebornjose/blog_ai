const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// 获取文章列表（支持分页、筛选）
router.get('/list', articleController.getArticles);

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'test'
  });
});
// 获取单篇文章详情
router.get('/:id', articleController.getArticleById);

// 创建文章（需要认证）
router.post('/', authMiddleware, articleController.createArticle);

// 更新文章（需要认证）
router.put('/:id', authMiddleware, articleController.updateArticle);

// 删除文章（需要认证）
router.delete('/:id', authMiddleware, articleController.deleteArticle);

module.exports = router;

