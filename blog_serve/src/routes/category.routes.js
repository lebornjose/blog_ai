const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// 获取分类列表（分页）
router.get('/list', categoryController.getCategories);

// 获取所有分类（不分页）
router.get('/all', categoryController.getAllCategories);

// 获取单个分类
router.get('/:id', categoryController.getCategoryById);

// 创建分类（开发环境暂时移除权限验证）
router.post('/', categoryController.createCategory);

// 更新分类（开发环境暂时移除权限验证）
router.put('/:id', categoryController.updateCategory);

// 删除分类（开发环境暂时移除权限验证）
router.delete('/:id', categoryController.deleteCategory);

// 批量删除分类（开发环境暂时移除权限验证）
router.post('/batch-delete', categoryController.batchDeleteCategories);

module.exports = router;

