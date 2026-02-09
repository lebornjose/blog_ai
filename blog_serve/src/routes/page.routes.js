const express = require('express');
const router = express.Router();
const pageController = require('../controllers/page.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// 公开接口 - 前台展示用
// 获取页面列表（分页）
router.get('/list', pageController.getPages);

// 获取所有页面（不分页）
router.get('/all', pageController.getAllPages);

// 获取单个页面
router.get('/:id', pageController.getPageById);

// 管理接口 - 需要管理员权限
// 创建页面
router.post('/', authMiddleware, adminMiddleware, pageController.createPage);

// 更新页面
router.put('/:id', authMiddleware, adminMiddleware, pageController.updatePage);

// 删除页面
router.delete('/:id', authMiddleware, adminMiddleware, pageController.deletePage);

// 批量删除页面
router.post('/batch-delete', authMiddleware, adminMiddleware, pageController.batchDeletePages);

module.exports = router;
