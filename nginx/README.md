# Nginx 本地反向代理配置

本目录包含用于本地开发和生产环境的 Nginx 配置文件。

## 📁 文件说明

- `nginx-dev.conf` - 开发环境配置（代理到 Vite 开发服务器，支持 HMR）
- `nginx-prod.conf` - 生产环境配置（静态文件托管 + Gzip + 缓存）

## 🚀 快速开始

### 1. 安装 Nginx

#### Windows
```powershell
# 使用 Chocolatey（推荐）
choco install nginx -y

# 或手动下载安装
Invoke-WebRequest -Uri "http://nginx.org/download/nginx-1.24.0.zip" -OutFile "$env:TEMP\nginx.zip"
Expand-Archive -Path "$env:TEMP\nginx.zip" -DestinationPath "C:\" -Force
Rename-Item -Path "C:\nginx-1.24.0" -NewName "nginx"
New-Item -Path "C:\nginx\logs" -ItemType Directory -Force
```

#### macOS
```bash
brew install nginx
```

#### Linux
```bash
sudo apt update && sudo apt install nginx -y
```

### 2. 配置和启动

#### 开发环境

**终端 1 - 配置并启动 Nginx**
```powershell
# Windows
Copy-Item -Path ".\nginx\nginx-dev.conf" -Destination "C:\nginx\conf\nginx.conf" -Force
cd C:\nginx
start nginx

# macOS
sudo cp ./nginx/nginx-dev.conf /usr/local/etc/nginx/nginx.conf
sudo nginx

# Linux
sudo cp ./nginx/nginx-dev.conf /etc/nginx/nginx.conf
sudo nginx
```

**终端 2 - 启动前端**
```powershell
cd frontend
npm run dev
```

**终端 3 - 启动后端**
```powershell
cd backend
mvn spring-boot:run
```

**访问**: http://localhost

#### 生产环境

**步骤 1 - 构建前端**
```powershell
cd frontend
npm run build
cd ..
```

**步骤 2 - 配置并启动 Nginx**
```powershell
# Windows
Copy-Item -Path ".\nginx\nginx-prod.conf" -Destination "C:\nginx\conf\nginx.conf" -Force
cd C:\nginx
start nginx

# macOS
sudo cp ./nginx/nginx-prod.conf /usr/local/etc/nginx/nginx.conf
sudo nginx

# Linux
sudo cp ./nginx/nginx-prod.conf /etc/nginx/nginx.conf
sudo nginx
```

**步骤 3 - 启动后端**
```powershell
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=prod-local
```

**访问**: http://localhost

## 🔧 Nginx 管理命令

### Windows
```powershell
cd C:\nginx

# 启动
start nginx

# 停止
.\nginx.exe -s quit

# 重启
.\nginx.exe -s reload

# 测试配置
.\nginx.exe -t

# 查看进程
Get-Process nginx

# 强制停止
Stop-Process -Name nginx -Force
```

### macOS/Linux
```bash
# 启动
sudo nginx

# 停止
sudo nginx -s quit

# 重启
sudo nginx -s reload

# 测试配置
sudo nginx -t

# 查看进程
ps aux | grep nginx

# 强制停止
sudo killall nginx
```

## 🔄 环境切换

### 切换到开发环境
```powershell
# Windows
Copy-Item -Path ".\nginx\nginx-dev.conf" -Destination "C:\nginx\conf\nginx.conf" -Force
cd C:\nginx; .\nginx.exe -s reload

# macOS/Linux
sudo cp ./nginx/nginx-dev.conf /usr/local/etc/nginx/nginx.conf
sudo nginx -s reload
```

### 切换到生产环境
```powershell
# 先构建前端
cd frontend; npm run build; cd ..

# Windows
Copy-Item -Path ".\nginx\nginx-prod.conf" -Destination "C:\nginx\conf\nginx.conf" -Force
cd C:\nginx; .\nginx.exe -s reload

# macOS/Linux
sudo cp ./nginx/nginx-prod.conf /usr/local/etc/nginx/nginx.conf
sudo nginx -s reload
```

## 🎯 工作原理

### 开发环境
```
浏览器 → http://localhost (Nginx :80)
  ├─ / → Vite Dev Server :5173 (热重载)
  └─ /api → Spring Boot :8080
```

### 生产环境
```
浏览器 → http://localhost (Nginx :80)
  ├─ / → frontend/dist/ (静态文件)
  └─ /api → Spring Boot :8080
```

## 📝 配置说明

### 开发环境配置亮点
- WebSocket 支持（Vite HMR 需要）
- 代理转发到 Vite 开发服务器
- 保留完整的开发体验

### 生产环境配置亮点
- React Router 支持（`try_files` 配置）
- Gzip 压缩（减少传输大小）
- 静态资源缓存（1年有效期）
- 安全头设置

## 🐛 故障排查

### Nginx 启动失败

**查看日志：**
```powershell
# Windows
Get-Content C:\nginx\logs\error.log -Tail 20

# macOS
tail -f /usr/local/var/log/nginx/error.log

# Linux
sudo tail -f /var/log/nginx/error.log
```

### 80 端口被占用

```powershell
# Windows
Get-NetTCPConnection -LocalPort 80

# macOS/Linux
sudo lsof -i :80
```

修改配置文件中的端口号（将 `listen 80` 改为 `listen 8000`）

### 前端 404 错误

**开发环境：**
- 确保 Vite 开发服务器正在运行（端口 5173）

**生产环境：**
- 确保已执行 `npm run build`
- 检查 `frontend/dist` 目录是否存在

### API 请求失败

- 确保后端正在运行（端口 8080）
- 测试直连：http://localhost:8080/api/health

## 💡 提示

1. **开发时使用开发环境配置** - 享受热重载
2. **部署前用生产环境测试** - 确保构建正常
3. **修改配置后需要重启** - `nginx -s reload`
4. **查看日志排查问题** - 见上述日志路径

## 📚 相关文档

- [Nginx 官方文档](http://nginx.org/en/docs/)
- [项目快速开始](../QUICK_START.md)
- [Nginx 使用指南](../NGINX_GUIDE.md)
