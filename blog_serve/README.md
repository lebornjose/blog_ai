# 博客后端服务系统

基于 Express.js 和 MySQL 的博客后端 API 系统，提供完整的博客管理功能。

## 功能特性

### 用户管理
- ✅ 用户注册和登录
- ✅ JWT 令牌认证
- ✅ 用户信息管理
- ✅ 角色权限控制（用户/管理员）

### 文章管理
- ✅ 文章的增删改查
- ✅ 文章分页和筛选
- ✅ 文章状态管理（草稿/已发布）
- ✅ 文章浏览次数统计
- ✅ 支持封面图和标签
- ✅ 文章分类关联

### 分类管理
- ✅ 分类的增删改查
- ✅ 统计每个分类下的文章数量
- ✅ 删除前检查是否有关联文章

### 评论管理
- ✅ 评论的增删查
- ✅ 支持评论回复（父子评论）
- ✅ 评论权限控制

## 技术栈

- **后端框架**: Express.js 4.x
- **数据库**: MySQL (使用 mysql2)
- **身份认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **跨域处理**: CORS
- **数据验证**: express-validator
- **环境变量**: dotenv
- **开发工具**: nodemon

## 项目结构

```
blog_serve/
├── src/
│   ├── app.js                 # 应用入口文件
│   ├── config/
│   │   └── database.js        # 数据库连接配置
│   ├── controllers/           # 控制器层
│   │   ├── user.controller.js
│   │   ├── article.controller.js
│   │   ├── category.controller.js
│   │   └── comment.controller.js
│   ├── routes/                # 路由层
│   │   ├── user.routes.js
│   │   ├── article.routes.js
│   │   ├── category.routes.js
│   │   └── comment.routes.js
│   └── middlewares/           # 中间件
│       └── auth.middleware.js
├── package.json
├── env.example               # 环境变量示例
└── README.md
```

## 快速开始

### 1. 环境要求

- Node.js >= 14.x
- MySQL >= 5.7
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `env.example` 文件并重命名为 `.env`，然后修改配置：

```bash
cp env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blog_db

# JWT 密钥（生产环境请使用强密码）
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

### 4. 数据库设计参考

确保你的 MySQL 数据库包含以下表结构：

**users 表** - 用户表
```sql
- id (主键)
- username (用户名)
- email (邮箱，唯一)
- password (密码，已加密)
- avatar (头像 URL)
- bio (个人简介)
- role (角色: user/admin)
- created_at (创建时间)
- updated_at (更新时间)
```

**articles 表** - 文章表
```sql
- id (主键)
- title (标题)
- content (内容)
- summary (摘要)
- cover_image (封面图)
- tags (标签，JSON 或字符串)
- category_id (分类 ID，外键)
- author_id (作者 ID，外键)
- status (状态: draft/published)
- views (浏览次数)
- created_at (创建时间)
- updated_at (更新时间)
```

**categories 表** - 分类表
```sql
- id (主键)
- name (分类名称，唯一)
- description (描述)
- created_at (创建时间)
```

**comments 表** - 评论表
```sql
- id (主键)
- article_id (文章 ID，外键)
- user_id (用户 ID，外键)
- content (评论内容)
- parent_id (父评论 ID，可为空)
- created_at (创建时间)
```

### 5. 启动服务

**开发环境**（使用 nodemon 自动重启）：
```bash
npm run dev
```

**生产环境**：
```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

## API 接口文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **请求头**: `Authorization: Bearer <token>`

### 用户接口 `/api/users`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/register` | 用户注册 | 否 |
| POST | `/login` | 用户登录 | 否 |
| GET | `/profile` | 获取当前用户信息 | 是 |
| PUT | `/profile` | 更新用户信息 | 是 |
| GET | `/` | 获取用户列表 | 否 |
| GET | `/:id` | 获取指定用户信息 | 否 |

**注册示例**：
```json
POST /api/users/register
{
  "username": "张三",
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

**登录示例**：
```json
POST /api/users/login
{
  "email": "zhangsan@example.com",
  "password": "password123"
}

// 响应
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "张三",
      "email": "zhangsan@example.com",
      "role": "user"
    }
  }
}
```

### 文章接口 `/api/articles`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/` | 获取文章列表 | 否 |
| GET | `/:id` | 获取文章详情 | 否 |
| POST | `/` | 创建文章 | 是 |
| PUT | `/:id` | 更新文章 | 是 |
| DELETE | `/:id` | 删除文章 | 是 |

**查询参数**：
- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：10）
- `category_id`: 分类 ID
- `status`: 文章状态（draft/published）

**创建文章示例**：
```json
POST /api/articles
Authorization: Bearer <token>
{
  "title": "我的第一篇博客",
  "content": "这是文章内容...",
  "summary": "文章摘要",
  "category_id": 1,
  "cover_image": "https://example.com/image.jpg",
  "tags": "JavaScript,Node.js",
  "status": "published"
}
```

### 分类接口 `/api/categories`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/` | 获取分类列表 | 否 |
| GET | `/:id` | 获取分类详情 | 否 |
| POST | `/` | 创建分类 | 管理员 |
| PUT | `/:id` | 更新分类 | 管理员 |
| DELETE | `/:id` | 删除分类 | 管理员 |

### 评论接口 `/api/comments`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/article/:articleId` | 获取文章评论 | 否 |
| POST | `/` | 创建评论 | 是 |
| DELETE | `/:id` | 删除评论 | 是 |

**创建评论示例**：
```json
POST /api/comments
Authorization: Bearer <token>
{
  "article_id": 1,
  "content": "写得不错！",
  "parent_id": null  // 如果是回复评论，填写父评论ID
}
```

## 响应格式

所有 API 响应都遵循统一格式：

**成功响应**：
```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

**错误响应**：
```json
{
  "success": false,
  "message": "错误信息描述"
}
```

## 状态码说明

- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权（未登录或 token 无效）
- `403` - 禁止访问（权限不足）
- `404` - 资源不存在
- `500` - 服务器内部错误

## 安全特性

- ✅ 密码使用 bcrypt 加密存储
- ✅ JWT 令牌认证
- ✅ 角色权限控制
- ✅ SQL 注入防护（使用参数化查询）
- ✅ CORS 跨域配置

## 开发建议

### 本地开发

1. 使用 nodemon 进行热重载开发
2. 配置 `.env` 文件保存敏感信息
3. 不要将 `.env` 文件提交到版本控制

### 生产部署

1. 修改 `NODE_ENV=production`
2. 使用强密码作为 `JWT_SECRET`
3. 配置 HTTPS
4. 使用进程管理工具（如 PM2）
5. 配置数据库连接池
6. 启用日志记录

## 待扩展功能

- [ ] 文件上传功能
- [ ] 文章搜索功能
- [ ] 点赞功能
- [ ] 阅读统计
- [ ] 邮件通知
- [ ] Redis 缓存
- [ ] 图片处理
- [ ] API 限流

## 常见问题

### 1. 数据库连接失败

检查 `.env` 文件中的数据库配置是否正确，确保 MySQL 服务已启动。

### 2. JWT token 无效

检查 `JWT_SECRET` 是否配置正确，token 是否过期。

### 3. 端口被占用

修改 `.env` 文件中的 `PORT` 配置。

## License

MIT

## 联系方式

如有问题，请提交 Issue 或 Pull Request。

