-- =============================================
-- 博客系统数据库建表脚本
-- =============================================

-- 1. 用户表 (users) - 已存在，这里只是参考
-- CREATE TABLE IF NOT EXISTS `users` (
--   `uid` CHAR(24) NOT NULL COMMENT '用户ID',
--   `username` CHAR(30) NOT NULL COMMENT '用户名',
--   `pwd` VARCHAR(50) NOT NULL COMMENT '密码(MD5)',
--   `email` VARCHAR(50) DEFAULT NULL COMMENT '邮箱',
--   `logins` INT(11) NOT NULL DEFAULT 0 COMMENT '登录次数',
--   `ukey` VARCHAR(50) DEFAULT NULL COMMENT '用户密钥',
--   `nick` VARCHAR(20) DEFAULT NULL COMMENT '昵称',
--   `rate` INT(11) NOT NULL DEFAULT 0 COMMENT '权限等级',
--   `lasttime` INT(11) DEFAULT 0 COMMENT '最后登录时间',
--   `addtime` INT(11) NOT NULL DEFAULT 0 COMMENT '注册时间',
--   `honour` INT(11) DEFAULT NULL COMMENT '荣誉值',
--   `mobile` VARCHAR(15) DEFAULT NULL COMMENT '手机号',
--   `status` CHAR(1) DEFAULT '1' COMMENT '状态:1正常,0禁用',
--   `avatar` VARCHAR(50) DEFAULT '1111111111' COMMENT '头像',
--   `extend` VARCHAR(1000) DEFAULT NULL COMMENT '扩展信息',
--   PRIMARY KEY (`uid`),
--   UNIQUE KEY `username` (`username`),
--   KEY `email` (`email`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 文章分类表 (categories)
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `slug` VARCHAR(50) DEFAULT NULL COMMENT '分类别名',
  `description` TEXT COMMENT '分类描述',
  `parent_id` INT(11) DEFAULT 0 COMMENT '父分类ID,0为顶级',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章分类表';

-- 3. 文章表 (articles)
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '文章ID',
  `title` VARCHAR(200) NOT NULL COMMENT '文章标题',
  `slug` VARCHAR(200) DEFAULT NULL COMMENT '文章别名',
  `content` LONGTEXT NOT NULL COMMENT '文章内容',
  `summary` TEXT COMMENT '文章摘要',
  `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
  `author_uid` CHAR(24) NOT NULL COMMENT '作者UID',
  `category_id` INT(11) DEFAULT NULL COMMENT '分类ID',
  `tags` VARCHAR(255) DEFAULT NULL COMMENT '标签,逗号分隔',
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',
  `views` INT(11) DEFAULT 0 COMMENT '浏览次数',
  `likes` INT(11) DEFAULT 0 COMMENT '点赞数',
  `is_top` TINYINT(1) DEFAULT 0 COMMENT '是否置顶',
  `allow_comment` TINYINT(1) DEFAULT 1 COMMENT '是否允许评论',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `published_at` TIMESTAMP NULL DEFAULT NULL COMMENT '发布时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `author_uid` (`author_uid`),
  KEY `category_id` (`category_id`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `fk_articles_author` FOREIGN KEY (`author_uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE,
  CONSTRAINT `fk_articles_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表';

-- 4. 评论表 (comments)
CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `article_id` INT(11) NOT NULL COMMENT '文章ID',
  `user_uid` CHAR(24) DEFAULT NULL COMMENT '用户UID,NULL表示游客',
  `parent_id` INT(11) DEFAULT 0 COMMENT '父评论ID,0为顶级评论',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `author_name` VARCHAR(50) DEFAULT NULL COMMENT '评论者姓名(游客)',
  `author_email` VARCHAR(100) DEFAULT NULL COMMENT '评论者邮箱(游客)',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(255) DEFAULT NULL COMMENT '用户代理',
  `status` ENUM('pending', 'approved', 'rejected', 'spam') DEFAULT 'pending' COMMENT '状态',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`),
  KEY `user_uid` (`user_uid`),
  KEY `parent_id` (`parent_id`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `fk_comments_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_uid`) REFERENCES `users` (`uid`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- 5. 标签表 (tags) - 可选
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `name` VARCHAR(50) NOT NULL COMMENT '标签名称',
  `slug` VARCHAR(50) DEFAULT NULL COMMENT '标签别名',
  `description` TEXT COMMENT '标签描述',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标签表';

-- 6. 文章标签关联表 (article_tags) - 可选
CREATE TABLE IF NOT EXISTS `article_tags` (
  `article_id` INT(11) NOT NULL COMMENT '文章ID',
  `tag_id` INT(11) NOT NULL COMMENT '标签ID',
  PRIMARY KEY (`article_id`, `tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `fk_article_tags_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_article_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章标签关联表';

-- =============================================
-- 插入示例数据
-- =============================================

-- 插入示例分类
INSERT INTO `categories` (`name`, `slug`, `description`, `sort_order`) VALUES
('技术', 'tech', '技术相关文章', 1),
('生活', 'life', '生活随笔', 2),
('学习', 'study', '学习笔记', 3),
('其他', 'other', '其他文章', 4)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 插入示例标签
INSERT INTO `tags` (`name`, `slug`, `description`) VALUES
('JavaScript', 'javascript', 'JavaScript相关'),
('Vue', 'vue', 'Vue.js相关'),
('Node.js', 'nodejs', 'Node.js相关'),
('React', 'react', 'React相关'),
('CSS', 'css', 'CSS相关'),
('MySQL', 'mysql', 'MySQL相关'),
('前端', 'frontend', '前端开发'),
('后端', 'backend', '后端开发')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- =============================================
-- 创建索引优化
-- =============================================

-- 文章全文搜索索引
-- ALTER TABLE `articles` ADD FULLTEXT INDEX `ft_title_content` (`title`, `content`);

-- =============================================
-- 完成
-- =============================================

