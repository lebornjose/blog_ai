const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommend.controller');

// 获取推荐列表（分页）
router.get('/list', recommendController.getRecommends);

// 获取所有推荐（不分页）
router.get('/all', recommendController.getAllRecommends);

// 获取单个推荐
router.get('/:id', recommendController.getRecommendById);

// 创建推荐（开发环境暂时移除权限验证）
router.post('/', recommendController.createRecommend);

// 更新推荐（开发环境暂时移除权限验证）
router.put('/:id', recommendController.updateRecommend);

// 删除推荐（开发环境暂时移除权限验证）
router.delete('/:id', recommendController.deleteRecommend);

// 批量删除推荐（开发环境暂时移除权限验证）
router.post('/batch-delete', recommendController.batchDeleteRecommends);

module.exports = router;


