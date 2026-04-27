# 海底世界 (Sea World) - 家庭积分管理系统

一个为家庭设计的积分管理系统，帮助家长通过积分激励孩子的成长。

## 技术栈

| 层 | 技术 |
|---|---|
| 后端 | Java 21 + Spring Boot 3.2.5 + PostgreSQL + Flyway + JWT |
| 前端 | React 19 + TypeScript + Vite + React Router + Zustand + Axios |
| 构建工具 | Maven 3.9+ (后端), npm (前端) |

## 快速开始

本仓库的启动与使用说明已集中在 `QUICK_START.md` 中。

## 文档说明

- `QUICK_START.md`：快速启动和本地开发指南
- `backend/CONFIG_GUIDE.md`：后端配置与版本控制策略
- `nginx/README.md`：Nginx 配置与管理说明
- `.github/skills/git-security-check.md`：Git 安全检查机制

## 🔒 Git 安全机制

本项目已配置 Git pre-commit 钩子，在每次提交前自动检测敏感信息：

- ✅ **自动检测**：密码、密钥、Token 等敏感数据
- 🚫 **提交拦截**：发现敏感信息时阻止提交并给出修复建议
- 📋 **白名单支持**：支持配置例外文件和模式

**使用方法**：
```bash
# 正常提交（会自动触发安全检查）
git add .
git commit -m "提交信息"

# 紧急情况跳过检查
git commit --no-verify -m "紧急提交"
```

**自定义配置**：
- `.git/hooks/sensitive-patterns.txt`：敏感信息检测模式
- `.git/hooks/sensitive-whitelist.txt`：白名单文件模式

## 项目结构

```
world-under-the-sea-2/
├── backend/                    # 后端项目
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/seaworld/
│   │   │   │   ├── controller/    # REST 控制器
│   │   │   │   ├── service/       # 业务逻辑
│   │   │   │   ├── repository/    # 数据访问
│   │   │   │   ├── entity/        # JPA 实体
│   │   │   │   ├── dto/           # 数据传输对象
│   │   │   │   ├── security/      # 安全配置
│   │   │   │   ├── config/        # 应用配置
│   │   │   │   ├── exception/     # 异常处理
│   │   │   │   └── util/          # 工具类 (ErrorMessages / ResponseMessages)
│   │   │   └── resources/
│   │   │       ├── application.yml           # 主配置
│   │   │       ├── application-dev.yml       # 开发环境
│   │   │       ├── application-prod.yml      # 生产环境
│   │   │       └── db/migration/             # Flyway 数据库迁移脚本
│   │   └── test/
│   └── pom.xml
│
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── api/               # API 客户端 (Axios)
│   │   ├── components/        # React 组件
│   │   ├── pages/             # 页面组件
│   │   ├── store/             # Zustand 状态管理
│   │   ├── types/             # TypeScript 类型定义
│   │   ├── App.tsx            # 根组件
│   │   └── main.tsx           # 入口文件
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                       # 文档
├── .github/                    # GitHub 配置
│   ├── copilot-instructions.md   # Copilot 项目规范
│   └── instructions/             # 细分规范文件
├── start-backend.ps1          # 后端启动脚本 (Windows)
├── start-backend.sh           # 后端启动脚本 (Linux/Mac)
├── start-frontend.ps1         # 前端启动脚本 (Windows)
├── start-frontend.sh          # 前端启动脚本 (Linux/Mac)
├── start-mailhog.ps1          # MailHog 邮件服务启动脚本 (Windows)
├── start-mailhog.bat          # MailHog 邮件服务启动脚本 (Windows)
└── README.md                  # 本文件
```

## 开发规范

本项目遵循严格的代码规范和最佳实践，详见 [.github/copilot-instructions.md](.github/copilot-instructions.md)：

### 代码规范
- **命名规范**: [java-naming.instructions.md](.github/instructions/java-naming.instructions.md)
- **异常处理**: [java-exception-handling.instructions.md](.github/instructions/java-exception-handling.instructions.md)
- **DTO 映射**: [java-dto-mapping.instructions.md](.github/instructions/java-dto-mapping.instructions.md)
- **消息管理**: 所有消息通过 `ErrorMessages` / `ResponseMessages` 枚举管理
- **输入校验**: Controller 层使用 `@Validated` + `@Valid` + 约束注解

### 12-Factor App 原则 ⭐

本项目遵循 [12-Factor App](https://12factor.net/zh_cn/) 方法论，确保应用的可维护性和部署友好性。

详细指南：[.github/instructions/12-factor-app.instructions.md](.github/instructions/12-factor-app.instructions.md)

**核心原则**：
- ✅ **配置外部化**：所有敏感信息通过环境变量配置
- ✅ **无状态设计**：使用 JWT，应用支持水平扩展
- ✅ **日志流**：输出到 stdout，使用 SLF4J/Logback
- ✅ **显式依赖**：Maven/npm 管理所有依赖
- ✅ **环境一致性**：开发和生产使用相同技术栈

**合规性检查**：
```bash
# Windows - 使用 Git Bash 运行
# 方法1：右键点击 12-factor-check.sh -> Git Bash Here -> 运行
./12-factor-check.sh

# 方法2：在 Git Bash 中运行
bash 12-factor-check.sh

# Linux/macOS
chmod +x 12-factor-check.sh
./12-factor-check.sh
```

这将检查项目是否符合 12-Factor 原则，包括：
- 配置是否使用环境变量
- 敏感信息是否被正确保护
- 日志是否输出到 stdout
- 应用是否无状态设计

## 环境变量配置

### 后端环境变量

生产环境建议通过环境变量配置敏感信息：

```bash
# 数据库
export DB_URL=jdbc:postgresql://your-host:5432/seaworld
export DB_USERNAME=your_username
export DB_PASSWORD=your_password

# JWT
export JWT_SECRET=your-256-bit-secret-key-must-be-at-least-32-chars

# 邮件服务
export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=587
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password

# 前端地址
export FRONTEND_URL=https://your-domain.com
export CORS_ORIGINS=https://your-domain.com
```

或使用 `.env` 文件（推荐）：

```bash
# 1. 复制模板
cp .env.example .env

# 2. 编辑 .env，填写真实配置
vi .env

# 3. 确保 .env 权限正确（仅所有者可读写）
chmod 600 .env
```

### 本地开发覆盖

如需本地覆盖配置（如连接本地数据库），创建 `backend/src/main/resources/application-local.yml`：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/seaworld_local
    username: local_user
    password: local_pass
```

然后通过 `--spring.profiles.active=local,dev` 激活。

> **注意**：`application-local.yml` 已被 `.gitignore` 保护，不会被提交到仓库。

## 常见问题

### 1. 数据库连接失败

**错误**: `org.postgresql.util.PSQLException: Connection refused`

**解决**:
- 确保 PostgreSQL 服务已启动
- 检查 `application-dev.yml` 中的连接配置是否正确
- 确认数据库 `seaworld` 已创建

### 2. 端口冲突

**错误**: `Port 8080 is already in use` / `Port 5173 is already in use`

**解决**:
- 修改 `backend/src/main/resources/application.yml` 中的 `server.port`
- 修改 `frontend/vite.config.ts` 中的 `server.port`

### 3. Maven 依赖下载慢

**解决**:
- 配置国内镜像源 (`~/.m2/settings.xml`)
- 使用 VPN

### 4. npm 依赖安装失败

**解决**:
```bash
# 清除缓存
npm cache clean --force

# 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 重新安装
npm install
```

### 5. 邮件发送失败

**开发环境**:
- 确认 MailHog 已启动（`docker ps` 检查容器状态）
- 访问 http://localhost:8025 查看邮件是否被 MailHog 捕获
- 检查后端日志确认发送尝试

**生产环境**:
- 确认 SMTP 配置环境变量已正确设置
- Gmail 用户需使用应用专用密码（不是账户密码）
- 查看详细配置指南：[docs/EMAIL_SERVER_SETUP.md](docs/EMAIL_SERVER_SETUP.md)

## API 文档

主要 API 端点：

| 分类 | 端点 | 说明 |
|------|------|------|
| 认证 | `POST /api/auth/register` | 用户注册 |
| 认证 | `POST /api/auth/login` | 用户登录 |
| 认证 | `POST /api/auth/refresh` | 刷新 Token |
| 家庭 | `POST /api/families` | 创建家庭 |
| 家庭 | `GET /api/families/{id}` | 获取家庭详情 |
| 孩子 | `POST /api/families/{id}/children` | 添加孩子 |
| 积分 | `POST /api/scores` | 记录积分 |
| 商城 | `GET /api/shop/items` | 获取商品列表 |
| 商城 | `POST /api/shop/purchase` | 购买商品 |

完整 API 文档（如已集成 Swagger）: http://localhost:8080/swagger-ui.html

## 构建生产版本

### 后端

```bash
cd backend
mvn clean package -DskipTests

# 生成的 JAR 文件位于
# backend/target/sea-world-0.0.1-SNAPSHOT.jar
```

运行:
```bash
java -jar backend/target/sea-world-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### 前端

```bash
cd frontend
npm run build

# 生成的静态文件位于
# frontend/dist/
```

部署到 Nginx / Apache / CDN。

## 许可

本项目仅供学习交流使用。

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**项目维护者**: [Your Team]  
**最后更新**: 2026-04-10
