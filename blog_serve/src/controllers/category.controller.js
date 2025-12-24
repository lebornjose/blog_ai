const db = require('../config/database');

/**
 * 获取分类列表
 */
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT c.*, COUNT(a.id) as article_count
       FROM categories c
       LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败'
    });
  }
};

/**
 * 获取单个分类
 */
exports.getCategoryById = async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM categories WHERE id = ?',
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
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }

    // 检查分类是否已存在
    const [existingCategories] = await db.query(
      'SELECT id FROM categories WHERE name = ?',
      [name]
    );

    if (existingCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: '分类已存在'
      });
    }

    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );

    res.status(201).json({
      success: true,
      message: '分类创建成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建分类错误:', error);
    res.status(500).json({
      success: false,
      message: '创建分类失败'
    });
  }
};

/**
 * 更新分类
 */
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // 检查分类是否存在
    const [categories] = await db.query(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    const updateFields = [];
    const values = [];

    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      values.push(description);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有可更新的字段'
      });
    }

    values.push(req.params.id);

    await db.query(
      `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
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
      message: '更新分类失败'
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
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    // 检查是否有文章使用此分类
    const [articles] = await db.query(
      'SELECT COUNT(*) as count FROM articles WHERE category_id = ?',
      [req.params.id]
    );

    if (articles[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: '该分类下还有文章，无法删除'
      });
    }

    await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: '分类删除成功'
    });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({
      success: false,
      message: '删除分类失败'
    });
  }
};

