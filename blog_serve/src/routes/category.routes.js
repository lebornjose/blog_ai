const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// 获取分类列表
router.get('/', categoryController.getCategories);

// 获取单个分类
router.get('/:id', categoryController.getCategoryById);

// 创建分类（需要管理员权限）
router.post('/', authMiddleware, adminMiddleware, categoryController.createCategory);

// 更新分类（需要管理员权限）
router.put('/:id', authMiddleware, adminMiddleware, categoryController.updateCategory);

// 删除分类（需要管理员权限）
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

module.exports = router;

