const db = require('../config/database');

/**
 * 获取推荐列表（分页）
 */
exports.getRecommends = async (req, res) => {
  try {
    const { 
      pagesize = 20, 
      index = 1, 
      keyword = '' 
    } = req.query;

    const offset = (parseInt(index) - 1) * parseInt(pagesize);
    
    // 构建查询条件
    let whereConditions = [];
    let queryParams = [];

    if (keyword) {
      whereConditions.push('(title LIKE ? OR note LIKE ? OR `describe` LIKE ?)');
      const searchTerm = `%${keyword}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    // 查询总数
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM recommend ${whereClause}`,
      queryParams
    );

    // 查询数据
    const [recommends] = await db.query(
      `SELECT * FROM recommend ${whereClause} ORDER BY \`index\` ASC, commend_id DESC LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(pagesize), offset]
    );

    res.json({
      success: true,
      data: {
        list: recommends,
        total: countResult[0].total,
        pagesize: parseInt(pagesize),
        index: parseInt(index)
      }
    });
  } catch (error) {
    console.error('获取推荐列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐列表失败',
      error: error.message
    });
  }
};

/**
 * 获取所有推荐（不分页）
 */
exports.getAllRecommends = async (req, res) => {
  try {
    const [recommends] = await db.query(
      'SELECT commend_id, title, url, `index` FROM recommend ORDER BY `index` ASC, commend_id DESC'
    );

    res.json({
      success: true,
      data: recommends
    });
  } catch (error) {
    console.error('获取所有推荐错误:', error);
    res.status(500).json({
      success: false,
      message: '获取所有推荐失败'
    });
  }
};

/**
 * 获取单个推荐
 */
exports.getRecommendById = async (req, res) => {
  try {
    const [recommends] = await db.query(
      'SELECT * FROM recommend WHERE commend_id = ?',
      [req.params.id]
    );

    if (recommends.length === 0) {
      return res.status(404).json({
        success: false,
        message: '推荐不存在'
      });
    }

    res.json({
      success: true,
      data: recommends[0]
    });
  } catch (error) {
    console.error('获取推荐错误:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐失败'
    });
  }
};

/**
 * 创建推荐
 */
exports.createRecommend = async (req, res) => {
  try {
    const { 
      title, 
      note = '', 
      index = 0, 
      describe = '', 
      url = '' 
    } = req.body;

    // 验证必填字段
    if (!title) {
      return res.status(400).json({
        success: false,
        message: '推荐标题不能为空'
      });
    }

    // 检查标题是否已存在
    const [existingRecommends] = await db.query(
      'SELECT commend_id FROM recommend WHERE title = ?',
      [title]
    );

    if (existingRecommends.length > 0) {
      return res.status(400).json({
        success: false,
        message: '推荐标题已存在'
      });
    }

    // 插入推荐
    const [result] = await db.query(
      `INSERT INTO recommend (title, note, \`index\`, \`describe\`, url) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, note, index, describe, url]
    );

    res.status(201).json({
      success: true,
      message: '推荐创建成功',
      data: {
        commend_id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建推荐错误:', error);
    res.status(500).json({
      success: false,
      message: '创建推荐失败',
      error: error.message
    });
  }
};

/**
 * 更新推荐
 */
exports.updateRecommend = async (req, res) => {
  try {
    const { 
      title, 
      note, 
      index, 
      describe, 
      url 
    } = req.body;

    // 检查推荐是否存在
    const [recommends] = await db.query(
      'SELECT * FROM recommend WHERE commend_id = ?',
      [req.params.id]
    );

    if (recommends.length === 0) {
      return res.status(404).json({
        success: false,
        message: '推荐不存在'
      });
    }

    // 构建动态更新字段
    const updateFields = [];
    const values = [];

    if (title !== undefined) {
      // 检查标题是否重复
      const [existingRecommends] = await db.query(
        'SELECT commend_id FROM recommend WHERE title = ? AND commend_id != ?',
        [title, req.params.id]
      );

      if (existingRecommends.length > 0) {
        return res.status(400).json({
          success: false,
          message: '推荐标题已存在'
        });
      }

      updateFields.push('title = ?');
      values.push(title);
    }
    
    if (note !== undefined) {
      updateFields.push('note = ?');
      values.push(note);
    }
    
    if (index !== undefined) {
      updateFields.push('`index` = ?');
      values.push(index);
    }
    
    if (describe !== undefined) {
      updateFields.push('`describe` = ?');
      values.push(describe);
    }
    
    if (url !== undefined) {
      updateFields.push('url = ?');
      values.push(url);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有可更新的字段'
      });
    }

    values.push(req.params.id);

    await db.query(
      `UPDATE recommend SET ${updateFields.join(', ')} WHERE commend_id = ?`,
      values
    );

    res.json({
      success: true,
      message: '推荐更新成功'
    });
  } catch (error) {
    console.error('更新推荐错误:', error);
    res.status(500).json({
      success: false,
      message: '更新推荐失败',
      error: error.message
    });
  }
};

/**
 * 删除推荐
 */
exports.deleteRecommend = async (req, res) => {
  try {
    // 检查推荐是否存在
    const [recommends] = await db.query(
      'SELECT * FROM recommend WHERE commend_id = ?',
      [req.params.id]
    );

    if (recommends.length === 0) {
      return res.status(404).json({
        success: false,
        message: '推荐不存在'
      });
    }

    // 删除推荐
    await db.query('DELETE FROM recommend WHERE commend_id = ?', [req.params.id]);

    res.json({
      success: true,
      message: '推荐删除成功'
    });
  } catch (error) {
    console.error('删除推荐错误:', error);
    res.status(500).json({
      success: false,
      message: '删除推荐失败',
      error: error.message
    });
  }
};

/**
 * 批量删除推荐
 */
exports.batchDeleteRecommends = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的推荐ID列表'
      });
    }

    // 批量删除
    const placeholders = ids.map(() => '?').join(',');
    await db.query(
      `DELETE FROM recommend WHERE commend_id IN (${placeholders})`,
      ids
    );

    res.json({
      success: true,
      message: `成功删除 ${ids.length} 个推荐`
    });
  } catch (error) {
    console.error('批量删除推荐错误:', error);
    res.status(500).json({
      success: false,
      message: '批量删除推荐失败',
      error: error.message
    });
  }
};


