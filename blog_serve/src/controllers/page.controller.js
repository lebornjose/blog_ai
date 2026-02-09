const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// 获取页面列表（分页）
const getPages = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      keyword = '',
      sortBy = 'page_id',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    // 构建查询条件
    let whereClause = '1=1';
    const params = [];

    if (keyword) {
      whereClause += ' AND (title LIKE ? OR describe LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 获取总数
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM page WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 获取列表数据
    const allowedSortFields = ['page_id', 'title'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'page_id';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [rows] = await db.query(
      `SELECT page_id, title, \`describe\`, 
              LEFT(content, 200) as content_preview,
              CHAR_LENGTH(content) as content_length
       FROM page 
       WHERE ${whereClause}
       ORDER BY ${sortField} ${order}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        list: rows,
        pagination: {
          page: parseInt(page),
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取页面列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取页面列表失败',
      error: error.message
    });
  }
};

// 获取所有页面（不分页）
const getAllPages = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT page_id, title, `describe` FROM page ORDER BY page_id DESC'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取所有页面失败:', error);
    res.status(500).json({
      success: false,
      message: '获取所有页面失败',
      error: error.message
    });
  }
};

// 获取单个页面
const getPageById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      'SELECT * FROM page WHERE page_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '页面不存在'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('获取页面详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取页面详情失败',
      error: error.message
    });
  }
};

// 创建页面
const createPage = async (req, res) => {
  try {
    const { title, describe, content } = req.body;

    // 验证必填字段
    if (!title) {
      return res.status(400).json({
        success: false,
        message: '标题不能为空'
      });
    }

    if (title.length > 30) {
      return res.status(400).json({
        success: false,
        message: '标题长度不能超过30个字符'
      });
    }

    if (describe && describe.length > 500) {
      return res.status(400).json({
        success: false,
        message: '描述长度不能超过500个字符'
      });
    }

    // 生成 UUID（取前24位）
    const pageId = uuidv4().replace(/-/g, '').substring(0, 24);

    const [result] = await db.query(
      'INSERT INTO page (page_id, title, `describe`, content) VALUES (?, ?, ?, ?)',
      [pageId, title, describe || '', content || '']
    );

    res.status(201).json({
      success: true,
      message: '页面创建成功',
      data: {
        page_id: pageId
      }
    });
  } catch (error) {
    console.error('创建页面失败:', error);
    res.status(500).json({
      success: false,
      message: '创建页面失败',
      error: error.message
    });
  }
};

// 更新页面
const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, describe, content } = req.body;

    // 检查页面是否存在
    const [existing] = await db.query(
      'SELECT page_id FROM page WHERE page_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '页面不存在'
      });
    }

    // 验证字段
    if (title && title.length > 30) {
      return res.status(400).json({
        success: false,
        message: '标题长度不能超过30个字符'
      });
    }

    if (describe && describe.length > 500) {
      return res.status(400).json({
        success: false,
        message: '描述长度不能超过500个字符'
      });
    }

    // 构建更新字段
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (describe !== undefined) {
      updates.push('`describe` = ?');
      params.push(describe);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有需要更新的字段'
      });
    }

    params.push(id);

    await db.query(
      `UPDATE page SET ${updates.join(', ')} WHERE page_id = ?`,
      params
    );

    res.json({
      success: true,
      message: '页面更新成功'
    });
  } catch (error) {
    console.error('更新页面失败:', error);
    res.status(500).json({
      success: false,
      message: '更新页面失败',
      error: error.message
    });
  }
};

// 删除页面
const deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM page WHERE page_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '页面不存在'
      });
    }

    res.json({
      success: true,
      message: '页面删除成功'
    });
  } catch (error) {
    console.error('删除页面失败:', error);
    res.status(500).json({
      success: false,
      message: '删除页面失败',
      error: error.message
    });
  }
};

// 批量删除页面
const batchDeletePages = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的页面ID列表'
      });
    }

    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.query(
      `DELETE FROM page WHERE page_id IN (${placeholders})`,
      ids
    );

    res.json({
      success: true,
      message: `成功删除 ${result.affectedRows} 个页面`,
      data: {
        deletedCount: result.affectedRows
      }
    });
  } catch (error) {
    console.error('批量删除页面失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除页面失败',
      error: error.message
    });
  }
};

module.exports = {
  getPages,
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  batchDeletePages
};
