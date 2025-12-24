const jwt = require('jsonwebtoken');

/**
 * JWT 认证中间件
 */
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取 token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期'
      });
    }
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
};

/**
 * 管理员权限验证中间件（基于rate字段）
 */
const adminMiddleware = (req, res, next) => {
  // rate值越高权限越大，这里假设rate >= 90为管理员
  if (req.user && req.user.rate >= 90) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware
};

