const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// 用户注册
router.post('/register', userController.register);

// 用户登录
router.post('/login', userController.login);

// 获取当前用户信息（需要认证）
router.get('/profile', authMiddleware, userController.getProfile);

// 更新用户信息（需要认证）
router.put('/profile', authMiddleware, userController.updateProfile);

// 获取用户列表
router.get('/', userController.getUsers);

// 获取单个用户信息
router.get('/:id', userController.getUserById);

module.exports = router;

