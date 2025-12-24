# 博客管理后台

基于 Vue 3 + Vite + Ant Design Vue 构建的现代化博客管理系统。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI 组件库**: Ant Design Vue 4.x
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **日期处理**: Day.js

## 功能特性

- ✅ 用户登录认证（JWT）
- ✅ 权限管理
- ✅ 用户管理（增删改查）
- ✅ 文章管理
- ✅ 分类管理
- ✅ 评论管理
- ✅ 仪表盘数据统计
- ✅ 响应式布局

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 `http://localhost:3000`

### 生产构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
blog_admin/
├── public/              # 静态资源
├── src/
│   ├── api/            # API 接口
│   ├── assets/         # 资源文件
│   ├── components/     # 公共组件
│   │   └── layout/    # 布局组件
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia 状态管理
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   │   ├── login/     # 登录
│   │   ├── dashboard/ # 仪表盘
│   │   ├── users/     # 用户管理
│   │   ├── articles/  # 文章管理
│   │   ├── categories/# 分类管理
│   │   └── comments/  # 评论管理
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── index.html
├── package.json
└── vite.config.js
```

## 环境变量

创建 `.env` 文件：

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:3001/api
```

## API 配置

默认后端 API 地址为 `http://localhost:3001/api`

可以在 `vite.config.js` 中修改代理配置。

## 登录凭证

默认使用后端数据库中的用户账号登录。

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 开发建议

1. 确保后端 API 服务已启动
2. 使用 Chrome DevTools 进行调试
3. 遵循 Vue 3 Composition API 最佳实践
4. 组件命名使用 PascalCase
5. 保持代码风格一致

## License

MIT
