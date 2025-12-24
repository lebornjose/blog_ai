const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * MD5加密函数
 */
const md5 = (str) => {
  return crypto.createHash('md5').update(str).digest('hex');
};

/**
 * 用户注册
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, nick, mobile, ukey } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码不能为空'
      });
    }

    // 检查用户是否已存在
    const [existingUsers] = await db.query(
      'SELECT uid FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已被注册'
      });
    }

    // 生成唯一的uid（24位字符）
    const uid = crypto.randomBytes(12).toString('hex');
    
    // 加密密码（MD5）
    const hashedPassword = md5(password);

    // 当前时间戳（秒）
    const currentTime = Math.floor(Date.now() / 1000);

    // 插入新用户
    const [result] = await db.query(
      'INSERT INTO users (uid, username, pwd, email, nick, mobile, ukey, logins, rate, addtime, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        uid,
        username,
        hashedPassword,
        email,
        nick || username,
        mobile || null,
        ukey || null,
        0,
        0,
        currentTime,
        '1'
      ]
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        uid: uid,
        username,
        nick: nick || username,
        email
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
};

/**
 * 用户登录
 */
exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证必填字段
    if ((!username && !email) || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名/邮箱和密码不能为空'
      });
    }

    // 查找用户（支持用户名或邮箱登录）
    let query = 'SELECT * FROM users WHERE ';
    let params = [];
    
    if (email) {
      query += 'email = ?';
      params.push(email);
    } else {
      query += 'username = ?';
      params.push(username);
    }

    const [users] = await db.query(query, params);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名/邮箱或密码错误'
      });
    }

    const user = users[0];

    // 检查用户状态
    if (user.status !== '1') {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用，请联系管理员'
      });
    }

    // 验证密码（MD5加密）
    const hashedPassword = md5(password);
    console.log(hashedPassword, user.pwd);
    
    if (hashedPassword !== user.pwd) {
      return res.status(401).json({
        success: false,
        message: '用户名/邮箱或密码错误'
      });
    }

    // 更新登录次数和最后登录时间
    const currentTime = Math.floor(Date.now() / 1000);
    await db.query(
      'UPDATE users SET logins = logins + 1, lasttime = ? WHERE uid = ?',
      [currentTime, user.uid]
    );

    // 生成 JWT token
    const token = jwt.sign(
      { 
        uid: user.uid, 
        username: user.username,
        email: user.email, 
        nick: user.nick,
        rate: user.rate
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          uid: user.uid,
          username: user.username,
          nick: user.nick,
          email: user.email,
          avatar: user.avatar,
          rate: user.rate,
          honour: user.honour,
          mobile: user.mobile,
          logins: user.logins + 1,
          lasttime: currentTime
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
};

/**
 * 获取当前用户信息
 */
exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT uid, username, nick, email, avatar, mobile, honour, rate, logins, lasttime, addtime, extend FROM users WHERE uid = ?',
      [req.user.uid]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

/**
 * 更新用户信息
 */
exports.updateProfile = async (req, res) => {
  try {
    const { nick, avatar, mobile, extend } = req.body;
    const updateFields = [];
    const values = [];

    if (nick) {
      updateFields.push('nick = ?');
      values.push(nick);
    }
    if (avatar) {
      updateFields.push('avatar = ?');
      values.push(avatar);
    }
    if (mobile) {
      updateFields.push('mobile = ?');
      values.push(mobile);
    }
    if (extend !== undefined) {
      updateFields.push('extend = ?');
      values.push(extend);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有可更新的字段'
      });
    }

    values.push(req.user.uid);

    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE uid = ?`,
      values
    );

    res.json({
      success: true,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
};

/**
 * 获取用户列表
 */
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [users] = await db.query(
      'SELECT uid, username, nick, email, avatar, mobile, honour, rate, logins, lasttime, addtime, status FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
};

/**
 * 根据ID获取用户
 */
exports.getUserById = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT uid, username, nick, email, avatar, mobile, honour, rate, logins, lasttime, addtime, status FROM users WHERE uid = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('获取用户错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户失败'
    });
  }
};

