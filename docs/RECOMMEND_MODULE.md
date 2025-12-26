# 推荐管理模块

## 📋 数据库表结构

表名：`recommend`

| 字段 | 类型 | 说明 |
|------|------|------|
| commend_id | BIGINT | 推荐ID（主键） |
| title | VARCHAR | 推荐标题 |
| note | TEXT | 备注信息 |
| index | INT | 排序索引 |
| describe | TEXT | 详细描述 |
| url | VARCHAR | 链接地址 |

## 🚀 后端接口

基础路径：`/api/recommends`

### 1. 获取推荐列表（分页）
```
GET /api/recommends/list
```
**查询参数：**
- `pagesize`: 每页数量（默认20）
- `index`: 页码（默认1）
- `keyword`: 搜索关键词（可选）

**响应示例：**
```json
{
  "success": true,
  "data": {
    "list": [...],
    "total": 100,
    "pagesize": 20,
    "index": 1
  }
}
```

### 2. 获取所有推荐（不分页）
```
GET /api/recommends/all
```

### 3. 获取单个推荐
```
GET /api/recommends/:id
```

### 4. 创建推荐
```
POST /api/recommends
```
**请求体：**
```json
{
  "title": "Kooteam分公协储",
  "url": "http://p.kooteam.com",
  "index": 0,
  "note": "一款开源的在线协作平台",
  "describe": "KooTeam是一款轻量级的团队协作管理工具"
}
```

### 5. 更新推荐
```
PUT /api/recommends/:id
```

### 6. 删除推荐
```
DELETE /api/recommends/:id
```

### 7. 批量删除推荐
```
POST /api/recommends/batch-delete
```
**请求体：**
```json
{
  "ids": [1, 2, 3]
}
```

## 💻 前端功能

路由：`/recommends`

### 功能列表
- ✅ 推荐列表展示（分页）
- ✅ 关键词搜索（搜索标题、备注、描述）
- ✅ 添加推荐
- ✅ 编辑推荐
- ✅ 删除推荐
- ✅ 批量删除
- ✅ 排序管理

### 表单字段
- **标题**（必填）：推荐的标题
- **链接**：推荐的URL地址
- **排序**：用于控制显示顺序
- **备注**：简短的备注信息
- **描述**：详细的描述信息

## 📝 使用说明

1. 进入"推荐管理"页面
2. 点击"添加推荐"按钮创建新推荐
3. 填写推荐信息，至少需要填写标题
4. 保存后即可在列表中看到新增的推荐
5. 可以通过编辑、删除按钮管理推荐

## 🔧 开发注意事项

1. 字段名使用了反引号（\`index\`、\`describe\`）因为它们是MySQL保留字
2. 主键字段名为 `commend_id`（注意拼写）
3. 当前版本已移除权限验证，适合开发环境使用
4. 生产环境建议加回权限验证中间件

## 🎯 与其他模块的区别

| 模块 | 主表 | 主键 |
|------|------|------|
| 分类管理 | category | category_id |
| 推荐管理 | recommend | commend_id |
| 文章管理 | article | article_id |
| 用户管理 | users | uid |

