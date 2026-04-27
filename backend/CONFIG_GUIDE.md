# 后端配置指南

## 配置方案

本项目后端使用 **Spring Boot Profile + YAML 配置** 方式，不使用 `.env` 文件。

## 配置文件结构

```
backend/src/main/resources/
├── application-dev-local.yml.example     # ✅ 开发环境本地配置模板（可提交）
├── application-prod-local.yml.example    # ✅ 生产环境本地配置模板（可提交）
└── (其他 application*.yml 文件为环境专用，不提交版本控制)
```

## 快速开始

### 1. 开发环境设置

```bash
# 1. 复制模板文件
cd backend/src/main/resources
cp application-dev-local.yml.example application-dev-local.yml

# 2. 编辑 application-dev-local.yml，填入真实密码
vi application-dev-local.yml

# 3. 启动（会自动合并 dev + dev-local 配置）
cd ../../../..  # 回到 backend 目录
mvn spring-boot:run -Dspring-boot.run.profiles=dev,dev-local
```

### 2. 生产本地环境设置（模拟生产）

```bash
# 1. 复制模板文件
cd backend/src/main/resources
cp application-prod-local.yml.example application-prod-local.yml

# 2. 编辑 application-prod-local.yml，填入真实密码
vi application-prod-local.yml

# 3. 构建并启动
cd ../../../..
mvn clean package
java -jar target/sea-world-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod-local
```

### 3. 真实生产环境部署

真实生产环境应使用 **环境变量** 而非本地配置文件：

```bash
# 方式 1: 导出环境变量
export DB_USERNAME=prod_user
export DB_PASSWORD=prod_password
export JWT_SECRET=your_jwt_secret
export MAIL_PASSWORD=your_mail_password
java -jar sea-world.jar --spring.profiles.active=prod

# 方式 2: 使用 systemd 服务配置
# 在 /etc/systemd/system/seaworld.service 中配置环境变量
```

## 配置优先级

Spring Boot 配置加载顺序（后加载的会覆盖先加载的）：

1. `application.yml` - 基础配置
2. `application-{profile}.yml` - 环境配置（dev/prod）
3. `application-{profile}-local.yml` - 本地覆盖（如果存在）
4. 环境变量 - 最高优先级

## 安全检查

```bash
# 验证 *-local.yml 文件已被 .gitignore 保护
git check-ignore backend/src/main/resources/application-dev-local.yml
git check-ignore backend/src/main/resources/application-prod-local.yml

# 应该输出文件路径，表示已被忽略
```

## ⚠️ 重要提示

### ✅ 仅可提交的文件
- `backend/src/main/resources/application-dev-local.yml.example`
- `backend/src/main/resources/application-prod-local.yml.example`
- `nginx/nginx-dev.conf`
- `nginx/README.md`

### ❌ 不应提交的文件
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/application-dev.yml`
- `backend/src/main/resources/application-prod.yml`
- `backend/src/main/resources/application-dev-local.yml`
- `backend/src/main/resources/application-prod-local.yml`
- `server-setup/` 目录
- `docs/` 目录
- `deploy.md`
- `nginx/nginx-prod.conf`
- `nginx/nginx-prod-v2.conf`

### 🔑 敏感信息包括
- 数据库密码
- JWT 密钥
- 邮件服务授权码
- 第三方 API 密钥
- 任何生产环境凭据

## 版本控制策略

请按照以下规则管理版本控制：

- `backend/src/main/resources/application-dev-local.yml.example`
- `backend/src/main/resources/application-prod-local.yml.example`
  - 仅提交这两个本地配置模板
- 其他 `backend/src/main/resources/application*.yml` 文件不应提交
- `docs/` 目录不应提交
- `server-setup/` 目录不应提交
- `deploy.md` 不应提交
- `nginx/` 目录仅保留 `nginx/nginx-dev.conf` 和 `nginx/README.md`
  - `nginx/nginx-prod.conf` 与 `nginx/nginx-prod-v2.conf` 不应提交

相关 `.gitignore` 规则示例：

```gitignore
backend/src/main/resources/application*.yml
backend/src/main/resources/application*.yaml
!backend/src/main/resources/application-dev-local.yml.example
!backend/src/main/resources/application-prod-local.yml.example

docs/
server-setup/
deploy.md

nginx/*.conf
!nginx/nginx-dev.conf
```

## 故障排查

### 问题：启动时提示找不到配置

```
Could not resolve placeholder 'DB_PASSWORD'
```

**解决**：
1. 检查是否创建了 `application-dev-local.yml`
2. 检查启动命令是否包含 `dev-local` profile
3. 确认 `application-dev-local.yml` 中包含所需配置项

### 问题：配置未生效

**解决**：
1. 确认 profile 激活顺序正确（多个 profile 用逗号分隔）
2. 检查 YAML 缩进是否正确（使用空格，不能用 Tab）
3. 使用 `--debug` 启动查看配置加载过程

## 为什么不使用 .env？

虽然 12-Factor App 推荐使用环境变量，但本项目选择 `*-local.yml` 方式的原因：

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| `.env` 文件 | 符合 12-Factor；跨语言通用 | Spring Boot 原生不支持；需要额外工具加载 | 多语言项目 |
| `*-local.yml` | Spring Boot 原生支持；类型安全；YAML 格式清晰 | 不符合 12-Factor 标准 | 纯 Java/Spring 项目 |
| 环境变量 | 完全符合 12-Factor；生产环境标准 | 本地开发不便；难以管理多个配置 | 生产环境 |

**本项目策略**：
- **开发环境**：使用 `application-dev-local.yml`（方便本地开发）
- **生产环境**：使用环境变量（符合 12-Factor，安全性高）
- **CI/CD**：使用密钥管理服务（如 Kubernetes Secrets、AWS Secrets Manager）

## 参考资料

- [Spring Boot Profiles](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.profiles)
- [Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [12-Factor App](https://12factor.net/)
