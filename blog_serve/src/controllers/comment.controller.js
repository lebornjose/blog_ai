const db = require('../config/database');

/**
 * 获取文章的评论列表
 */
exports.getCommentsByArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    const [comments] = await db.query(
      `SELECT c.*, u.username, u.avatar
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.article_id = ?
       ORDER BY c.created_at DESC`,
      [articleId]
    );

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取评论列表失败'
    });
  }
};

/**
 * 创建评论
 */
exports.createComment = async (req, res) => {
  try {
    const { article_id, content, parent_id } = req.body;

    if (!article_id || !content) {
      return res.status(400).json({
        success: false,
        message: '文章ID和评论内容不能为空'
      });
    }

    // 检查文章是否存在
    const [articles] = await db.query(
      'SELECT id FROM articles WHERE id = ? AND status = "published"',
      [article_id]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在或未发布'
      });
    }

    // 如果是回复评论，检查父评论是否存在
    if (parent_id) {
      const [parentComments] = await db.query(
        'SELECT id FROM comments WHERE id = ? AND article_id = ?',
        [parent_id, article_id]
      );

      if (parentComments.length === 0) {
        return res.status(404).json({
          success: false,
          message: '父评论不存在'
        });
      }
    }

    const [result] = await db.query(
      'INSERT INTO comments (article_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [article_id, req.user.id, content, parent_id || null]
    );

    res.status(201).json({
      success: true,
      message: '评论发布成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建评论错误:', error);
    res.status(500).json({
      success: false,
      message: '评论发布失败'
    });
  }
};

/**
 * 删除评论
 */
exports.deleteComment = async (req, res) => {
  try {
    // 检查评论是否存在
    const [comments] = await db.query(
      'SELECT * FROM comments WHERE id = ?',
      [req.params.id]
    );

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    // 只有评论作者或管理员可以删除
    if (comments[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权限删除此评论'
      });
    }

    await db.query('DELETE FROM comments WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({
      success: false,
      message: '删除评论失败'
    });
  }
};

