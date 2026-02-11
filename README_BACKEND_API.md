# 备忘录前端 - 后端API集成说明

## API配置

后端API地址配置在 `src/utils/api.js` 文件中：

```javascript
const API_BASE_URL = 'http://localhost:8001/api/v1'
```

如果后端地址不同，请修改此配置。

## 已实现的功能

### 1. 用户登录
- 文件：`src/components/Login.jsx`
- API：`POST /api/v1/login`
- 功能：用户名密码登录，获取token

### 2. 备忘录列表
- 文件：`src/App.jsx`
- API：`GET /api/v1/memos`
- 功能：获取当前用户的所有备忘录

### 3. 创建备忘录
- 文件：`src/App.jsx`, `src/components/MemoForm.jsx`
- API：`POST /api/v1/memos`
- 功能：创建新的备忘录

### 4. 更新备忘录
- 文件：`src/App.jsx`, `src/components/MemoForm.jsx`
- API：`PUT /api/v1/memos/{id}`
- 功能：编辑备忘录内容、标记完成/未完成

### 5. 删除备忘录
- 文件：`src/App.jsx`, `src/components/MemoCard.jsx`
- API：`DELETE /api/v1/memos/{id}`
- 功能：删除备忘录

### 6. 延期备忘录
- 文件：`src/App.jsx`, `src/components/MemoCard.jsx`
- API：`POST /api/v1/memos/{id}/postpone`
- 功能：延期备忘录N天

## 数据格式

### 后端返回的备忘录对象
```json
{
  "id": 1,
  "user_id": 1,
  "title": "完成项目文档",
  "description": "整理项目的技术文档和使用说明",
  "due_date": "2026-02-14T15:30:00Z",
  "reminder_minutes": 60,
  "email": "admin@example.com",
  "status": "pending",
  "created_at": "2026-02-11T10:00:00Z",
  "updated_at": "2026-02-11T10:00:00Z",
  "completed_at": ""
}
```

### 前端组件支持
- 组件会自动处理 `snake_case`（后端）和 `camelCase`（前端）的字段名转换
- 时间格式自动解析为 JavaScript Date 对象

## 错误处理

所有API调用都包含错误处理：
- 网络错误：显示错误提示
- 自动降级：如果后端不可用，会降级到 localStorage 存储（仅登录除外）

## 启动说明

### 1. 确保后端运行
```bash
cd D:\GOPATH\src\ql-forge
go run cmd/ql-forge/main.go -conf configs/dev
```

### 2. 启动前端
```bash
cd d:\GOPATH\src\memo
npm install  # 首次运行
npm run dev
```

### 3. 访问应用
打开浏览器访问：http://localhost:5173

使用测试账号登录：
- 用户名：admin
- 密码：admin123

## 测试账号

| 用户名 | 密码     |
|--------|----------|
| admin  | admin123 |
| test   | test123  |

## 开发建议

1. **查看API请求**：打开浏览器开发者工具（F12）→ Network 标签
2. **查看控制台日志**：打开浏览器开发者工具（F12）→ Console 标签
3. **API测试**：可以使用 Postman 或 curl 测试后端API

## 相关文件

- `src/utils/api.js` - API请求封装
- `src/utils/storage.js` - 本地存储和API调用（带降级）
- `src/utils/auth.js` - 认证相关工具函数
- `src/components/Login.jsx` - 登录组件
- `src/App.jsx` - 主应用，备忘录管理
- `src/components/MemoForm.jsx` - 备忘录表单
- `src/components/MemoCard.jsx` - 备忘录卡片
