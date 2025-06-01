# 维修工单管理系统

## 系统概述
这是一个完整的维修工单管理系统，包含前后端功能，用于技术员管理维修工单全生命周期。

## 功能特性
- 用户认证与授权
- 工单创建、查看、更新
- 工单状态管理(待处理、进行中、已完成)
- 客户签名功能
- 工单优先级管理(高、中、低)
- 完整的工单信息记录

## 技术栈

### 前端
- React 19 + TypeScript
- Material-UI 组件库
- React Router v7
- axios HTTP客户端
- react-signature-pad-wrapper 签名组件

### 后端
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite 数据库
- JWT 认证

## 数据模型

### User 用户
- id: 用户ID
- username: 用户名(唯一)
- password: 密码(加密)
- role: 角色(technician/admin)
- tickets: 关联的工单

### Ticket 工单
- 基本信息: 标题、描述、状态、优先级
- 客户信息: 名称、联系人、电话、地址
- 设备信息: 名称、型号、序列号
- 维修信息: 解决方案、到达时间、完成时间、更换配件
- 客户反馈: 意见、签名
- 关联: 技术员、签名记录、位置记录

### Signature 签名
- 签名图片URL
- 关联工单

### Location 位置
- 经纬度坐标
- 关联工单

## API接口

### 工单相关
- GET /api/tickets - 获取当前用户工单列表
- POST /api/tickets - 创建新工单
- GET /api/tickets/:id - 获取工单详情
- PATCH /api/tickets/:id/status - 更新工单状态
- POST /api/tickets/:id/signature - 添加工单签名

## 前端页面

### 主要路由
- /login - 登录页
- /tickets - 工单列表页
- /tickets/new - 创建工单页
- /tickets/:id - 工单详情页

### 页面功能
- 工单列表页: 显示工单列表，支持按状态筛选
- 工单详情页: 显示完整工单信息，支持状态更新和签名
- 创建工单页: 创建新工单表单

## 运行指南

### 后端
1. 安装依赖: `npm install`
2. 数据库迁移: `npx prisma migrate dev`
3. 启动开发服务器: `npm run dev`

### 前端
1. 安装依赖: `npm install`
2. 启动开发服务器: `npm start`

默认访问地址: http://localhost:3000
# Repair Ticket System
