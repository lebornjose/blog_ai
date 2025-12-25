const db = require('../config/database');

/**
 * 获取分类列表（分页）
 */
exports.getCategories = async (req, res) => {
  try {
    const { 
      pagesize = 20, 
      index = 1, 
      keyword = '', 
      parent_id = null 
    } = req.query;

    const offset = (parseInt(index) - 1) * parseInt(pagesize);
    
    // 构建查询条件
    let whereConditions = [];
    let queryParams = [];

    if (keyword) {
      whereConditions.push('(title LIKE ? OR keyword LIKE ? OR `describe` LIKE ?)');
      const searchTerm = `%${keyword}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (parent_id !== null && parent_id !== '') {
      whereConditions.push('parent_id = ?');
      queryParams.push(parent_id);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    // 查询总数
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM category ${whereClause}`,
      queryParams
    );

    // 查询数据
    const [categories] = await db.query(
      `SELECT * FROM category ${whereClause} ORDER BY \`index\` ASC, category_id DESC LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(pagesize), offset]
    );

    res.json({
      success: true,
      data: {
        list: categories,
        total: countResult[0].total,
        pagesize: parseInt(pagesize),
        index: parseInt(index)
      }
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message
    });
  }
};

/**
 * 获取所有分类（不分页，用于下拉选择）
 */
exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT category_id, title, parent_id FROM category ORDER BY `index` ASC, category_id DESC'
    );

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取所有分类错误:', error);
    res.status(500).json({
      success: false,
      message: '获取所有分类失败'
    });
  }
};

/**
 * 获取单个分类
 */
exports.getCategoryById = async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM category WHERE category_id = ?',
      [req.params.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      data: categories[0]
    });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败'
    });
  }
};

/**
 * 创建分类
 */
exports.createCategory = async (req, res) => {
  try {
    const { 
      title, 
      parent_id = 0, 
      index = 10, 
      children = 10, 
      pagesize = 20, 
      keyword = '', 
      describe = '' 
    } = req.body;

    // 验证必填字段
    if (!title) {
      return res.status(400).json({
        success: false,
        message: '分类标题不能为空'
      });
    }

    // 检查分类是否已存在
    const [existingCategories] = await db.query(
      'SELECT category_id FROM category WHERE title = ?',
      [title]
    );

    if (existingCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: '分类标题已存在'
      });
    }

    // 插入分类
    const [result] = await db.query(
      `INSERT INTO category (title, parent_id, \`index\`, children, pagesize, keyword, \`describe\`) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, parent_id, index, children, pagesize, keyword, describe]
    );

    res.status(201).json({
      success: true,
      message: '分类创建成功',
      data: {
        category_id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建分类错误:', error);
    res.status(500).json({
      success: false,
      message: '创建分类失败',
      error: error.message
    });
  }
};

/**
 * 更新分类
 */
exports.updateCategory = async (req, res) => {
  try {
    const { 
      title, 
      parent_id, 
      index, 
      children, 
      pagesize, 
      keyword, 
      describe 
    } = req.body;

    // 检查分类是否存在
    const [categories] = await db.query(
      'SELECT * FROM category WHERE category_id = ?',
      [req.params.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    // 构建动态更新字段
    const updateFields = [];
    const values = [];

    if (title !== undefined) {
      // 检查标题是否重复
      const [existingCategories] = await db.query(
        'SELECT category_id FROM category WHERE title = ? AND category_id != ?',
        [title, req.params.id]
      );

      if (existingCategories.length > 0) {
        return res.status(400).json({
          success: false,
          message: '分类标题已存在'
        });
      }

      updateFields.push('title = ?');
      values.push(title);
    }
    
    if (parent_id !== undefined) {
      updateFields.push('parent_id = ?');
      values.push(parent_id);
    }
    
    if (index !== undefined) {
      updateFields.push('`index` = ?');
      values.push(index);
    }
    
    if (children !== undefined) {
      updateFields.push('children = ?');
      values.push(children);
    }
    
    if (pagesize !== undefined) {
      updateFields.push('pagesize = ?');
      values.push(pagesize);
    }
    
    if (keyword !== undefined) {
      updateFields.push('keyword = ?');
      values.push(keyword);
    }
    
    if (describe !== undefined) {
      updateFields.push('`describe` = ?');
      values.push(describe);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有可更新的字段'
      });
    }

    values.push(req.params.id);

    await db.query(
      `UPDATE category SET ${updateFields.join(', ')} WHERE category_id = ?`,
      values
    );

    res.json({
      success: true,
      message: '分类更新成功'
    });
  } catch (error) {
    console.error('更新分类错误:', error);
    res.status(500).json({
      success: false,
      message: '更新分类失败',
      error: error.message
    });
  }
};

/**
 * 删除分类
 */
exports.deleteCategory = async (req, res) => {
  try {
    // 检查分类是否存在
    const [categories] = await db.query(
      'SELECT * FROM category WHERE category_id = ?',
      [req.params.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    // 检查是否有子分类
    const [subCategories] = await db.query(
      'SELECT COUNT(*) as count FROM category WHERE parent_id = ?',
      [req.params.id]
    );

    if (subCategories[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: '该分类下还有子分类，无法删除'
      });
    }

    // 删除分类
    await db.query('DELETE FROM category WHERE category_id = ?', [req.params.id]);

    res.json({
      success: true,
      message: '分类删除成功'
    });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({
      success: false,
      message: '删除分类失败',
      error: error.message
    });
  }
};

/**
 * 批量删除分类
 */
exports.batchDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的分类ID列表'
      });
    }

    // 检查是否有子分类
    const [subCategories] = await db.query(
      `SELECT COUNT(*) as count FROM category WHERE parent_id IN (?)`,
      [ids]
    );

    if (subCategories[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: '部分分类下还有子分类，无法删除'
      });
    }

    // 批量删除
    const placeholders = ids.map(() => '?').join(',');
    await db.query(
      `DELETE FROM category WHERE category_id IN (${placeholders})`,
      ids
    );

    res.json({
      success: true,
      message: `成功删除 ${ids.length} 个分类`
    });
  } catch (error) {
    console.error('批量删除分类错误:', error);
    res.status(500).json({
      success: false,
      message: '批量删除分类失败',
      error: error.message
    });
  }
};

