# 贡献指南 | Contributing Guidelines

感谢你对 HOLD 社区门户的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 报告问题

1. 在 [Issues](https://github.com/BNBHOLDERS/hold-community-portal/issues) 中搜索是否已存在类似问题
2. 如果没有，创建新的 Issue，包含：
   - 清晰的标题
   - 问题描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 环境信息（Node.js 版本、操作系统等）

### 提交代码

1. **Fork** 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 **Pull Request**

### 代码规范

- 使用简体中文编写注释和文档
- 遵循现有的代码风格
- 添加必要的注释说明复杂���辑
- 确保代码通过测试（如有）
- 更新相关文档

### 提交信息规范

使用清晰的提交信息：

```
类型(范围): 简短描述

详细描述（可选）
```

类型：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat(ai): 添加代币分析功能
fix(auth): 修复验证码过期问题
docs(readme): 更新安装说明
```

## 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/BNBHOLDERS/hold-community-portal.git
cd hold-community-portal

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入必要的配置

# 启动开发服务器
npm run dev
```

## 项目结构

```
hold-community-portal/
├── src/
│   ├── server.js              # Express 入口
│   ├── public/
│   │   └── index.html         # 前端 SPA
│   └── api/
│       ├── routes.js          # API 路由
│       ├── controllers/       # 控制器
│       ├── services/          # 服务层
│       ├── middleware/        # 中间件
│       ├── config/            # 配置
│       └── utils/             # 工具函数
├── data/                      # 数据目录（不提交）
├── .env.example               # 环境变量示例
├── package.json
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

## 开发原则

1. **安全优先**: 所有用户输入必须验证和转义
2. **性能意识**: 避免阻塞操作，使用异步处理
3. **错误处理**: 优雅地处理错误，给出友好的提示
4. **代码复用**: 避免重复代码，提取通用逻辑

## 获得帮助

- 查看 [README.md](README.md) 了解项目概况
- 阅读 [Issues](https://github.com/BNBHOLDERS/hold-community-portal/issues) 了解已知问题
- 提问时提供足够的上下文信息

## 行为准则

- 尊重所有贡献者
- 建设性地讨论问题
- 接受反馈并持续改进

感谢你的贡献！
