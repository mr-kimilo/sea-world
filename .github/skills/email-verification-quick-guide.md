# 邮箱验证功能快速实施指南

## 核心步骤（200字精简版）

### 后端配置（Spring Boot）
1. **SMTP配置**：使用587端口+STARTTLS（QQ邮箱：smtp.qq.com）
2. **关键配置**：`spring.mail.*`、`app.email.from`、授权码（非QQ密码）
3. **API接口**：`POST /verify-email?token={token}`

### 前端实现（React）
1. **创建页面**：`VerifyEmail.tsx`（三态：验证中/成功/失败）
2. **添加路由**：`<Route path="/verify-email" element={<VerifyEmail />} />`
3. **核心逻辑**：提取URL的token参数 → 调用API → 显示结果 → 跳转登录

### 关键检查点
- ✅ 587端口比465更稳定
- ✅ 必须配置`app.email.from`
- ✅ 前端路由必须匹配验证链接路径
- ✅ 三态显示提升用户体验

### 测试
注册 → 查看邮件 → 点击链接 → 验证成功/失败显示 → 跳转登录

---

**完整文档**：`.github/skills/email-verification-setup.md`
