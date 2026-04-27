# 代码审查自动化检查脚本

## 概述

这些脚本用于在部署前自动检查后端代码质量，确保符合生产环境标准。

## 使用方法

### Windows (PowerShell)

```powershell
cd backend
.\code-review-check.ps1
```

### Linux/Mac (Bash)

```bash
cd backend
chmod +x code-review-check.sh
./code-review-check.sh
```

## 检查内容

脚本会自动执行以下 8 项检查：

### 1. Controller 检查
- ✅ 所有 Controller 类是否有 `@Validated` 注解
- ✅ 所有 `@RequestBody` 参数是否有 `@Valid` 校验

### 2. Service 检查
- ✅ 是否有硬编码的异常消息（应使用 `ErrorMessages` 枚举）
- ✅ Service 是否错误地返回 `ResponseEntity`（应返回 DTO）

### 3. 实体类检查
- ✅ 敏感字段（`password`、`token` 等）是否有 `@JsonIgnore` 注解

### 4. 无用代码检查
- ✅ 是否有遗留的 `TODO` 或 `FIXME` 注释

### 5. 调试代码检查
- ✅ 是否有 `System.out.println`
- ✅ 是否有 `printStackTrace()`

### 6. 敏感信息日志检查
- ✅ 日志中是否包含密码、Token 等敏感信息

### 7. 配置文件检查
- ✅ 生产配置是否使用环境变量（不包含明文密码）

### 8. 单元测试
- ✅ 运行 Maven 测试，确保所有测试通过

## 输出说明

### 成功输出
```
✅ 所有检查通过！代码已准备好部署。
```

### 错误输出
```
❌ 发现 2 个错误
⚠️  发现 3 个警告
请修复以上问题后再部署。
```

## 注意事项

1. **执行权限**：Linux/Mac 用户需要先给脚本添加执行权限
2. **Maven 环境**：需要先安装 Maven 才能运行测试
3. **工作目录**：必须在 `backend` 目录下执行脚本
4. **修复后重跑**：修复问题后，重新运行脚本验证

## 与文档对照

详细的检查说明和修复指南请参考：
- [BACKEND_PRODUCTION_REVIEW.md](../docs/BACKEND_PRODUCTION_REVIEW.md)

## 持续集成

建议将此脚本集成到 CI/CD 流程中：

```yaml
# 示例：GitHub Actions
- name: Code Review Check
  run: |
    cd backend
    chmod +x code-review-check.sh
    ./code-review-check.sh
```

## 问题反馈

如果脚本检测到误报或漏报，请：
1. 检查代码是否符合项目规范
2. 查看文档中的详细说明
3. 必要时手动验证

## 版本历史

- v1.0 (2026-04-18): 初始版本
  - 8 项自动检查
  - PowerShell 和 Bash 双版本支持
