# 快速开始指南

## 🎯 两种运行方式

### 方式 1：使用 Nginx 反向代理（推荐 ⭐）

**优势**：无跨域问题、统一入口、模拟生产环境

#### 安装 Nginx

**Windows - 使用 Chocolatey**
```powershell
choco install nginx -y
```

**Windows - 手动安装**
```powershell
Invoke-WebRequest -Uri "http://nginx.org/download/nginx-1.24.0.zip" -OutFile "$env:TEMP\nginx.zip"
Expand-Archive -Path "$env:TEMP\nginx.zip" -DestinationPath "C:\" -Force
Rename-Item -Path "C:\nginx-1.24.0" -NewName "nginx"
```

**macOS**
```bash
brew install nginx
```

**Linux**
```bash
sudo apt update && sudo apt install nginx -y
```

#### 启动开发环境

**终端 1 - Nginx**
```powershell
# Windows
Copy-Item -Path ".\nginx\nginx-dev.conf" -Destination "C:\nginx\conf\nginx.conf" -Force
cd C:\nginx; start nginx

# macOS/Linux
sudo cp ./nginx/nginx-dev.conf /usr/local/etc/nginx/nginx.conf
sudo nginx
```

**终端 2 - 前端**
```powershell
cd frontend
npm run dev
```

**终端 3 - 后端**
```powershell
cd backend
mvn spring-boot:run
```

**访问**: http://localhost

---

### 方式 2：直接启动（不使用 Nginx）

**终端 1 - 后端**
```powershell
cd backend
mvn spring-boot:run
```
访问: http://localhost:8080/api

**终端 2 - 前端**
```powershell
cd frontend
npm run dev
```
访问: http://localhost:5173

⚠️ **此方式存在跨域问题**，后端已配置 CORS 允许

---

## 🔧 常用命令

### Nginx 管理

```powershell
# Windows
cd C:\nginx
start nginx          # 启动
.\nginx.exe -s quit  # 停止
.\nginx.exe -s reload # 重启
.\nginx.exe -t       # 测试配置

# macOS/Linux
sudo nginx           # 启动
sudo nginx -s quit   # 停止
sudo nginx -s reload # 重启
sudo nginx -t        # 测试配置
```

### 后端

```powershell
cd backend
mvn spring-boot:run                                        # 开发模式
mvn spring-boot:run -Dspring-boot.run.profiles=prod-local # 生产模式
mvn clean package                                          # 打包
```

### 前端

```powershell
cd frontend
npm run dev      # 开发服务器
npm run build    # 构建
npm run preview  # 预览构建结果
```

---

## 🔄 切换生产环境

```powershell
# 1. 构建前端
cd frontend; npm run build; cd ..

# 2. 切换 Nginx 配置
# Windows
Copy-Item -Path ".\nginx\nginx-prod.conf" -Destination "C:\nginx\conf\nginx.conf" -Force
cd C:\nginx; .\nginx.exe -s reload

# macOS/Linux
sudo cp ./nginx/nginx-prod.conf /usr/local/etc/nginx/nginx.conf
sudo nginx -s reload

# 3. 启动后端（生产模式）
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=prod-local
```

**访问**: http://localhost

---

## 📚 详细文档

- [NGINX_GUIDE.md](NGINX_GUIDE.md) - Nginx 配置详解
- [nginx/README.md](nginx/README.md) - Nginx 管理说明
- [docs/DEPLOY_GUIDE.md](docs/DEPLOY_GUIDE.md) - 生产部署指南

---

## 🆘 故障排查

**80 端口被占用**
```powershell
# Windows
Get-NetTCPConnection -LocalPort 80 | Format-Table

# macOS/Linux
sudo lsof -i :80
```

**Nginx 启动失败**
```powershell
# Windows
Get-Content C:\nginx\logs\error.log -Tail 20

# macOS/Linux
sudo tail -n 20 /usr/local/var/log/nginx/error.log
```

**API 请求失败**
- 确认后端运行在端口 8080
- 测试直连: http://localhost:8080/api/health
