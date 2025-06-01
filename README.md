<<<<<<< HEAD
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
=======
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
>>>>>>> 988610728eac4676eedaf601f8a298a59b582839
