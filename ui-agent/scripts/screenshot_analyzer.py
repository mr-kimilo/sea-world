"""
screenshot_analyzer.py — 截图 UI → Ollama 多模态分析 → 剪贴板自动复制

方案二（全链路自动化）核心中转脚本。
将截图发送到 Ollama 多模态模型进行 UI 分析，结果自动复制到剪贴板。

用法:
  python screenshot_analyzer.py <图片路径>                  # 单次分析
  python screenshot_analyzer.py <图片路径> --model qwen-vl  # 指定模型
  python screenshot_analyzer.py --watch                     # 监视模式
  python screenshot_analyzer.py --list-models               # 列出可用模型
  python screenshot_analyzer.py --interactive               # 交互式分析

依赖:
  pip install requests pyperclip pillow watchdog

环境变量:
  OLLAMA_HOST: Ollama 服务地址（默认 http://localhost:11434）
  OLLAMA_MODEL: 默认模型名（默认 llava:7b）
"""

import argparse
import base64
import json
import os
import sys
import time
from datetime import datetime
from io import BytesIO
from pathlib import Path

import pyperclip
import requests
from PIL import Image

# ── 配置 ─────────────────────────────────────────────────────────────────
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "llava:7b")
SCREENSHOT_DIR = Path(__file__).resolve().parent.parent / "screenshots"
LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "penpot"

# 确保目录存在
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)
TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)

# ── 工具函数 ─────────────────────────────────────────────────────────────


def image_to_base64(image_path: str) -> str:
    """将图片文件转为 base64 编码"""
    img = Image.open(image_path)
    # 压缩大图（Ollama 对超大图片有尺寸限制）
    max_size = 2048
    if max(img.size) > max_size:
        img.thumbnail((max_size, max_size), Image.Lanczos)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def get_available_models() -> list[str]:
    """查询 Ollama 已安装的模型列表"""
    try:
        resp = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=5)
        resp.raise_for_status()
        data = resp.json()
        return [m["name"] for m in data.get("models", [])]
    except requests.RequestException as e:
        print(f"⚠️  无法连接 Ollama: {e}")
        return []


def analyze_screenshot(
    image_path: str,
    model: str = DEFAULT_MODEL,
    prompt_template: str | None = None,
) -> dict:
    """
    调用 Ollama 多模态模型分析截图

    返回:
        {
            "success": bool,
            "model": str,
            "description": str,
            "raw_response": dict,
            "image_path": str,
            "timestamp": str
        }
    """
    if not os.path.isfile(image_path):
        return {"success": False, "error": f"文件不存在: {image_path}"}

    # 默认 UI 分析提示词
    default_prompt = """请详细分析这张UI截图，按以下结构输出：

## 布局结构
描述整体布局（上中下/左右分栏/网格等）

## 组件清单
逐一列出所有可见UI组件，包含：类型、位置、尺寸概览、颜色

## 配色方案
- 主色 / 辅助色 / 背景色 / 文字色

## 交互说明
按钮点击、表单提交、页面跳转、弹窗等交互行为

## 海洋主题元素
如果检测到海洋/波浪/气泡/游鱼等装饰元素，请特别说明

## 优化建议
对UI/UX的改进建议"""

    prompt = prompt_template or default_prompt

    try:
        # 编码图片
        b64 = image_to_base64(image_path)

        # 调用 Ollama API
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                    "images": [b64],
                }
            ],
            "stream": False,
        }

        print(f"🔍 正在调用 {model} 分析截图...")
        resp = requests.post(
            f"{OLLAMA_HOST}/api/chat",
            json=payload,
            timeout=120,
        )
        resp.raise_for_status()
        result = resp.json()

        description = result.get("message", {}).get("content", "")
        if not description:
            return {"success": False, "error": "模型返回内容为空", "raw_response": result}

        return {
            "success": True,
            "model": model,
            "description": description.strip(),
            "raw_response": result,
            "image_path": image_path,
            "timestamp": datetime.now().isoformat(),
        }

    except requests.Timeout:
        return {"success": False, "error": "请求超时（120s），模型推理可能过慢"}
    except requests.ConnectionError:
        return {"success": False, "error": f"无法连接 Ollama ({OLLAMA_HOST})，请确认服务已启动"}
    except requests.RequestException as e:
        return {"success": False, "error": f"API 请求失败: {e}"}
    except Exception as e:
        return {"success": False, "error": f"未知错误: {e}"}


def save_log(result: dict):
    """保存分析日志"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    image_name = Path(result.get("image_path", "unknown")).stem
    log_file = LOG_DIR / f"{timestamp}_{image_name}.md"

    content = f"""# UI 分析报告

- **模型**: {result.get('model', 'N/A')}
- **图片**: {result.get('image_path', 'N/A')}
- **时间**: {result.get('timestamp', 'N/A')}

---

{result.get('description', '无内容')}
"""
    log_file.write_text(content, encoding="utf-8")
    print(f"📝 分析日志已保存: {log_file}")
    return log_file


def copy_to_clipboard(text: str):
    """复制文本到剪贴板"""
    try:
        pyperclip.copy(text)
        print("📋 UI 描述已自动复制到剪贴板！")
        print("   直接粘贴到 Penpot AI Assistant 即可使用。")
    except Exception as e:
        print(f"⚠️  剪贴板复制失败: {e}")
        print("┌─ 请手动复制以下内容 ──────────────────────┐")
        print(text)
        print("└────────────────────────────────────────────┘")


def print_result(result: dict):
    """打印分析结果"""
    if result["success"]:
        desc = result["description"]
        # 截取前 200 字符预览
        preview = desc[:200] + ("..." if len(desc) > 200 else "")
        print(f"\n✅ 分析完成！（模型: {result['model']}）")
        print(f"📄 描述长度: {len(desc)} 字符")
        print(f"🔍 预览:\n{preview}\n")
    else:
        print(f"\n❌ 分析失败: {result.get('error', '未知错误')}\n")


# ── 交互式模式 ────────────────────────────────────────────────────────────


def interactive_mode():
    """
    交互式分析：列出可用模型 → 选择图片 → 选择模板 → 分析 → 复制
    """
    print("\n" + "=" * 50)
    print("  🐠 截图 UI 分析工具 — 交互模式")
    print("=" * 50)

    # Step 1: 选择模型
    models = get_available_models()
    if not models:
        print("\n⚠️  未检测到可用模型，使用默认: " + DEFAULT_MODEL)
        model = DEFAULT_MODEL
    else:
        print("\n📦 可用模型:")
        for i, m in enumerate(models, 1):
            # 检查是否多模态（粗略判断）
            is_mm = any(kw in m.lower() for kw in ["llava", "qwen", "bakllava", "gemini", "vision"])
            tag = "🖼️" if is_mm else "  "
            print(f"  {i}. {tag} {m}")
        try:
            choice = input("\n选择模型编号 (Enter 使用第一个): ").strip()
            idx = int(choice) - 1 if choice else 0
            model = models[idx] if 0 <= idx < len(models) else models[0]
        except (ValueError, IndexError):
            model = models[0]
        print(f"   → 已选择: {model}")

    # Step 2: 选择图片
    screenshots = list(SCREENSHOT_DIR.glob("*.*g"))  # png, jpg, jpeg, webp
    screenshots += list(SCREENSHOT_DIR.glob("*.webp"))
    screenshots.sort(key=lambda p: p.stat().st_mtime, reverse=True)

    if screenshots:
        print(f"\n📁 screenshots/ 目录中发现 {len(screenshots)} 张图片:")
        for i, p in enumerate(screenshots[:10], 1):
            size = p.stat().st_size / 1024
            print(f"  {i}. {p.name} ({size:.0f}KB)")
        if len(screenshots) > 10:
            print(f"  ... 还有 {len(screenshots) - 10} 张")
        choice = input("\n选择图片编号，或输入路径: ").strip()
        if choice:
            try:
                idx = int(choice) - 1
                image_path = str(screenshots[idx])
            except (ValueError, IndexError):
                image_path = choice
        else:
            image_path = str(screenshots[0]) if screenshots else ""
    else:
        print("\n⚠️  screenshots/ 目录为空")
        image_path = input("请输入截图路径: ").strip()

    if not image_path or not os.path.isfile(image_path):
        print("❌ 无效的图片路径")
        return

    # Step 3: 分析
    print(f"\n🔄 开始分析 {os.path.basename(image_path)} ...")
    result = analyze_screenshot(image_path, model=model)
    print_result(result)

    if result["success"]:
        save_log(result)
        copy_to_clipboard(result["description"])

        # 询问是否继续
        again = input("\n继续分析下一张？(y/n): ").strip().lower()
        if again == "y":
            interactive_mode()


# ── 监视模式 ─────────────────────────────────────────────────────────────


def watch_mode(model: str = DEFAULT_MODEL):
    """
    监视 screenshots/ 目录，自动处理新文件
    使用 watchdog 监听文件系统事件
    """
    try:
        from watchdog.events import FileSystemEventHandler
        from watchdog.observers import Observer
    except ImportError:
        print("❌ 需要安装 watchdog: pip install watchdog")
        sys.exit(1)

    print(f"\n👀 监视模式已启动")
    print(f"   目录: {SCREENSHOT_DIR}")
    print(f"   模型: {model}")
    print(f"   等待新截图文件... (Ctrl+C 停止)\n")

    # 处理已存在的文件
    existing = sorted(SCREENSHOT_DIR.glob("*.*g"), key=lambda p: p.stat().st_mtime)
    if existing:
        print(f"📁 发现 {len(existing)} 张已有截图，是否批量处理？")
        choice = input("   (y=全部处理, n=仅监视新文件, 数字=处理前N张): ").strip().lower()
        if choice == "y":
            _batch_process(existing, model)
        elif choice.isdigit():
            n = int(choice)
            _batch_process(existing[:n], model)

    class ScreenshotHandler(FileSystemEventHandler):
        def on_created(self, event):
            if event.is_directory:
                return
            if any(event.src_path.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp"]):
                print(f"\n📸 检测到新截图: {os.path.basename(event.src_path)}")
                # 等待文件写入完成
                time.sleep(0.5)
                result = analyze_screenshot(event.src_path, model=model)
                if result["success"]:
                    save_log(result)
                    copy_to_clipboard(result["description"])
                print_result(result)

    handler = ScreenshotHandler()
    observer = Observer()
    observer.schedule(handler, str(SCREENSHOT_DIR), recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 监视模式已停止")
        observer.stop()
    observer.join()


def _batch_process(files: list, model: str):
    """批量处理文件"""
    print(f"\n🔄 批量处理 {len(files)} 张截图...")
    for f in files:
        print(f"\n── {f.name} ──")
        result = analyze_screenshot(str(f), model=model)
        if result["success"]:
            save_log(result)
        print_result(result)
        time.sleep(0.3)


# ── 主入口 ───────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="截图 UI → Ollama 多模态分析 → 剪贴板自动复制",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s ui.png
  %(prog)s ui.png --model qwen-vl:7b
  %(prog)s --watch
  %(prog)s --interactive
  %(prog)s --list-models
        """,
    )
    parser.add_argument("image", nargs="?", help="截图文件路径")
    parser.add_argument("--model", "-m", default=DEFAULT_MODEL, help=f"Ollama 模型名（默认: {DEFAULT_MODEL}）")
    parser.add_argument("--watch", "-w", action="store_true", help="监视 screenshots/ 目录")
    parser.add_argument("--interactive", "-i", action="store_true", help="交互式模式")
    parser.add_argument("--list-models", "-l", action="store_true", help="列出可用模型")
    parser.add_argument("--save-only", "-s", action="store_true", help="仅保存日志，不复制到剪贴板")
    parser.add_argument("--prompt", "-p", help="自定义分析提示词文件路径")

    args = parser.parse_args()

    # 列出模型
    if args.list_models:
        models = get_available_models()
        if models:
            print("\n📦 已安装的 Ollama 模型:")
            for m in models:
                is_mm = any(kw in m.lower() for kw in ["llava", "qwen", "bakllava", "gemini", "vision"])
                tag = "🖼️ [多模态]" if is_mm else "  [文本]"
                print(f"  {tag} {m}")
        else:
            print("\n⚠️  无法获取模型列表，请确认 Ollama 服务已启动。")
        return

    # 加载自定义提示词
    custom_prompt = None
    if args.prompt and os.path.isfile(args.prompt):
        custom_prompt = Path(args.prompt).read_text(encoding="utf-8")
        print(f"📄 已加载自定义提示词: {args.prompt}")

    # 模式分发
    if args.watch:
        watch_mode(model=args.model)
    elif args.interactive:
        interactive_mode()
    elif args.image:
        result = analyze_screenshot(args.image, model=args.model, prompt_template=custom_prompt)
        print_result(result)
        if result["success"]:
            save_log(result)
            if not args.save_only:
                copy_to_clipboard(result["description"])
    else:
        parser.print_help()
        print("\n💡 提示: 将截图放到 screenshots/ 目录后，用 --watch 模式自动处理")
        print("   或使用 --interactive 进入交互模式")


if __name__ == "__main__":
    main()
