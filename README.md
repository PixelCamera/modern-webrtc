# Modern WebRTC

一个现代化的 WebRTC 视频通话应用。

## 技术栈

- Frontend: 
  - React 18 + TypeScript + Vite
  - TailwindCSS + shadcn/ui + Radix UI
  - Zustand (状态管理)
  - React Query (数据获取)
- Backend: 
  - Node.js + Express
  - Socket.io (实时通信)
  - WebRTC API
- 开发工具:
  - TypeScript
  - ESLint + Prettier
  - Bun (包管理器)

## 项目结构

```bash
apps/
  ├── web/          # 前端应用
  │   ├── src/
  │   │   ├── components/  # UI 组件
  │   │   ├── lib/         # 工具函数
  │   │   └── App.tsx      # 根组件
  │   └── ...
  └── server/       # 后端服务
      ├── src/
      │   ├── controllers/ # 控制器
      │   └── index.ts     # 入口文件
      └── ...
```

## 开发计划

### MVP v0.1 - 基础视频通话 (当前阶段)
- [x] 项目初始化和技术栈搭建
  - [x] 前端项目配置 (React + TypeScript + Vite)
  - [x] UI 框架集成 (TailwindCSS + shadcn/ui)
  - [x] 基础布局组件
- [ ] 视频通话核心功能
  - [ ] 获取本地摄像头画面
    - [ ] 媒体设备权限处理
    - [ ] 视频预览组件
    - [ ] 错误提示
  - [ ] WebRTC 点对点连接
    - [ ] RTCPeerConnection 设置
    - [ ] ICE 处理
    - [ ] 信令处理
  - [ ] 简单信令服务器
    - [ ] Socket.io 服务端
    - [ ] 基础信令消息处理
    - [ ] 连接状态管理

### v0.2 - 基础房间系统
- [ ] 用户界面
  - [ ] 首页设计
  - [ ] 房间页面设计
  - [ ] 响应式布局
- [ ] 房间功能
  - [ ] 创建/加入房间表单
  - [ ] 房间 ID 生成与验证
  - [ ] 房间链接分享
  - [ ] 用户列表与状态显示
- [ ] 错误处理
  - [ ] 连接错误处理
  - [ ] 设备错误处理
  - [ ] 房间错误处理
  - [ ] 重连机制

### v0.3 - 基础控制功能
- [ ] 音视频控制
  - [ ] 麦克风开关
  - [ ] 摄像头开关
  - [ ] 设备选择
  - [ ] 音量控制
- [ ] 通话控制
  - [ ] 挂断功能
  - [ ] 重新连接
  - [ ] 通话时长显示
- [ ] 屏幕共享
  - [ ] 共享整个屏幕
  - [ ] 共享应用窗口
  - [ ] 共享标签页

### v0.4 - 聊天功能
- [ ] 实时文字聊天
  - [ ] 消息发送/接收
  - [ ] 消息列表显示
  - [ ] 表情支持
  - [ ] 图片分享
- [ ] 文件共享
  - [ ] 小文件传输
  - [ ] 传输进度显示
  - [ ] 文件预览
- [ ] 在线状态
  - [ ] 用户状态显示
  - [ ] 状态变更通知
  - [ ] 已读状态

### v0.5 - 多人会议支持
- [ ] 多人视频
  - [ ] Mesh 网络实现
  - [ ] 网格布局
  - [ ] 说话者检测
  - [ ] 布局自适应
- [ ] 带宽优化
  - [ ] 视频质量自适应
  - [ ] 网络状态监测
  - [ ] 弱网优化
- [ ] 会议控制
  - [ ] 主持人功能
  - [ ] 发言者管理
  - [ ] 参会者管理
  - [ ] 会议录制

### v1.0 - 产品化
- [ ] 用户系统
  - [ ] 注册/登录
  - [ ] 个人资料
  - [ ] OAuth 集成
- [ ] 会议预约
  - [ ] 日历集成
  - [ ] 邀请链接
  - [ ] 会议提醒
- [ ] 移动端适配
  - [ ] 响应式设计
  - [ ] 触摸优化
  - [ ] PWA 支持
- [ ] 数据持久化
  - [ ] 聊天历史
  - [ ] 会议记录
  - [ ] 用户设置

## 开发指南

### 环境要求
- Node.js >= 18
- Bun >= 1.0

### 本地开发

```bash
# 安装前端依赖
cd apps/web
bun install

# 启动前端开发服务器
bun dev

# 安装后端依赖
cd ../server
bun install

# 启动后端服务器
bun dev
```

## 贡献指南
1. Fork 本仓库
2. 创建你的特性分支 (git checkout -b feature/AmazingFeature)
3. 提交你的更改 (git commit -m 'feat: Add some AmazingFeature')
4. 推送到分支 (git push origin feature/AmazingFeature)
5. 开启一个 Pull Request

## 许可证
MIT
