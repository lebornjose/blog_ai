const db = require('../config/database');
const crypto = require('crypto');

/**
 * 获取文章列表
 */
exports.getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const categoryId = req.query.category_id;
    const keyword = req.query.keyword;

    let query = `
      SELECT a.*, u.username as author_name, u.nick as author_nick
      FROM article a
      LEFT JOIN users u ON a.uid COLLATE utf8_general_ci = u.uid COLLATE utf8_general_ci
      WHERE 1=1
    `;
    const params = [];

    // 分类筛选
    if (categoryId) {
      query += ' AND a.category_id = ?';
      params.push(categoryId);
    }

    // 关键词搜索
    if (keyword) {
      query += ' AND (a.title LIKE ? OR a.summary LIKE ? OR a.keyword LIKE ?)';
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword, likeKeyword);
    }

    query += ' ORDER BY a.pubtime DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [articles] = await db.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM article WHERE 1=1';
    const countParams = [];
    
    if (categoryId) {
      countQuery += ' AND category_id = ?';
      countParams.push(categoryId);
    }
    
    if (keyword) {
      countQuery += ' AND (title LIKE ? OR summary LIKE ? OR keyword LIKE ?)';
      const likeKeyword = `%${keyword}%`;
      countParams.push(likeKeyword, likeKeyword, likeKeyword);
    }
    
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取文章列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取文章列表失败'
    });
  }
};

/**
 * 获取单篇文章（包含详细内容）
 */
exports.getArticleById = async (req, res) => {
  try {
    const [articles] = await db.query(
      `SELECT a.*, ad.content, u.username as author_name, u.nick as author_nick
       FROM article a
       LEFT JOIN article_detail ad ON a.article_id = ad.article_id
       LEFT JOIN users u ON a.uid COLLATE utf8_general_ci = u.uid COLLATE utf8_general_ci
       WHERE a.article_id = ?`,
      [req.params.id]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 增加浏览次数（如果有 seeds 字段表示浏览数）
    await db.query(
      'UPDATE article SET seeds = seeds + 1 WHERE article_id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      data: articles[0]
    });
  } catch (error) {
    console.error('获取文章错误:', error);
    res.status(500).json({
      success: false,
      message: '获取文章失败'
    });
  }
};

/**
 * 创建文章
 */
exports.createArticle = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      caption,
      summary, 
      category_id, 
      categorys,
      keyword,
      author,
      model,
      come,
      come_url,
      jtype,
      ispost,
      iscash
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空'
      });
    }

    // 生成唯一的 article_id (24位)
    const article_id = crypto.randomBytes(12).toString('hex');
    
    // 当前时间戳
    const currentTime = Math.floor(Date.now() / 1000);

    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 插入文章基本信息
      await connection.query(
        `INSERT INTO article (
          article_id, title, caption, author, model, pubtime, 
          summary, seeds, ispost, come, come_url, keyword, 
          uid, categorys, jtype, category_id, iscash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          article_id,
          title,
          caption || '',
          author || req.user.username,
          model || '',
          currentTime,
          summary || '',
          0, // seeds 初始为 0
          ispost || '0',
          come || '',
          come_url || '',
          keyword || '',
          req.user.uid,
          categorys || '',
          jtype || '1',
          category_id || '',
          iscash || '0'
        ]
      );

      // 插入文章详细内容
      await connection.query(
        `INSERT INTO article_detail (article_id, content, categorys) VALUES (?, ?, ?)`,
        [article_id, content, categorys || '']
      );

      await connection.commit();
      connection.release();

      res.status(201).json({
        success: true,
        message: '文章创建成功',
        data: {
          article_id: article_id
        }
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('创建文章错误:', error);
    res.status(500).json({
      success: false,
      message: '创建文章失败'
    });
  }
};

/**
 * 更新文章
 */
exports.updateArticle = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      caption,
      summary, 
      category_id,
      categorys,
      keyword,
      author,
      model,
      come,
      come_url,
      jtype,
      ispost,
      iscash
    } = req.body;

    // 检查文章是否存在
    const [articles] = await db.query(
      'SELECT * FROM article WHERE article_id = ?',
      [req.params.id]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 检查权限：是作者本人或者是管理员（rate >= 90）
    if (articles[0].uid !== req.user.uid && req.user.rate < 90) {
      return res.status(403).json({
        success: false,
        message: '无权限修改此文章'
      });
    }

    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 更新文章基本信息
      const updateFields = [];
      const values = [];

      if (title) {
        updateFields.push('title = ?');
        values.push(title);
      }
      if (caption !== undefined) {
        updateFields.push('caption = ?');
        values.push(caption);
      }
      if (summary !== undefined) {
        updateFields.push('summary = ?');
        values.push(summary);
      }
      if (category_id !== undefined) {
        updateFields.push('category_id = ?');
        values.push(category_id);
      }
      if (categorys !== undefined) {
        updateFields.push('categorys = ?');
        values.push(categorys);
      }
      if (keyword !== undefined) {
        updateFields.push('keyword = ?');
        values.push(keyword);
      }
      if (author !== undefined) {
        updateFields.push('author = ?');
        values.push(author);
      }
      if (model !== undefined) {
        updateFields.push('model = ?');
        values.push(model);
      }
      if (come !== undefined) {
        updateFields.push('come = ?');
        values.push(come);
      }
      if (come_url !== undefined) {
        updateFields.push('come_url = ?');
        values.push(come_url);
      }
      if (jtype !== undefined) {
        updateFields.push('jtype = ?');
        values.push(jtype);
      }
      if (ispost !== undefined) {
        updateFields.push('ispost = ?');
        values.push(ispost);
      }
      if (iscash !== undefined) {
        updateFields.push('iscash = ?');
        values.push(iscash);
      }

      if (updateFields.length > 0) {
        values.push(req.params.id);
        await connection.query(
          `UPDATE article SET ${updateFields.join(', ')} WHERE article_id = ?`,
          values
        );
      }

      // 更新文章内容
      if (content !== undefined) {
        // 检查是否已有详情记录
        const [details] = await connection.query(
          'SELECT article_id FROM article_detail WHERE article_id = ?',
          [req.params.id]
        );

        if (details.length > 0) {
          // 更新
          await connection.query(
            'UPDATE article_detail SET content = ?, categorys = ? WHERE article_id = ?',
            [content, categorys || '', req.params.id]
          );
        } else {
          // 插入
          await connection.query(
            'INSERT INTO article_detail (article_id, content, categorys) VALUES (?, ?, ?)',
            [req.params.id, content, categorys || '']
          );
        }
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: '文章更新成功'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('更新文章错误:', error);
    res.status(500).json({
      success: false,
      message: '更新文章失败'
    });
  }
};

/**
 * 删除文章
 */
exports.deleteArticle = async (req, res) => {
  try {
    // 检查文章是否存在
    const [articles] = await db.query(
      'SELECT * FROM article WHERE article_id = ?',
      [req.params.id]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 检查权限：是作者本人或者是管理员（rate >= 90）
    if (articles[0].uid !== req.user.uid && req.user.rate < 90) {
      return res.status(403).json({
        success: false,
        message: '无权限删除此文章'
      });
    }

    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 删除文章详情
      await connection.query(
        'DELETE FROM article_detail WHERE article_id = ?',
        [req.params.id]
      );

      // 删除文章基本信息
      await connection.query(
        'DELETE FROM article WHERE article_id = ?',
        [req.params.id]
      );

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: '文章删除成功'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('删除文章错误:', error);
    res.status(500).json({
      success: false,
      message: '删除文章失败'
    });
  }
};
