#!/usr/bin/env bash
#
# Git 钩子安装脚本
# 用途：安装敏感信息检测钩子
#

set -euo pipefail

readonly HOOKS_DIR=".git/hooks"
readonly PRE_COMMIT_HOOK="$HOOKS_DIR/pre-commit"
readonly PATTERNS_FILE="$HOOKS_DIR/sensitive-patterns.txt"
readonly WHITELIST_FILE="$HOOKS_DIR/sensitive-whitelist.txt"

# 颜色定义
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# 检查是否在 Git 仓库中
check_git_repo() {
    if [[ ! -d ".git" ]]; then
        log_error "错误：当前目录不是 Git 仓库"
        exit 1
    fi
}

# 创建钩子目录
create_hooks_dir() {
    if [[ ! -d "$HOOKS_DIR" ]]; then
        mkdir -p "$HOOKS_DIR"
        log_info "创建钩子目录: $HOOKS_DIR"
    fi
}

# 安装 pre-commit 钩子
install_pre_commit_hook() {
    cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/usr/bin/env bash
#
# Git pre-commit hook: 敏感信息检测
#

set -euo pipefail

# 颜色定义
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# 配置
readonly SENSITIVE_PATTERNS_FILE=".git/hooks/sensitive-patterns.txt"

detect_sensitive_info() {
    local file="$1"
    local found_sensitive=false

    [[ ! -f "$file" ]] && return 0

    if [[ -f "$SENSITIVE_PATTERNS_FILE" ]]; then
        while IFS= read -r pattern || [[ -n "$pattern" ]]; do
            [[ "$pattern" =~ ^[[:space:]]*# ]] && continue
            [[ -z "$pattern" ]] && continue

            if grep -q "$pattern" "$file" 2>/dev/null; then
                echo -e "${RED}❌ 发现敏感信息: $pattern${NC}"
                echo -e "${YELLOW}   文件: $file${NC}"
                found_sensitive=true
            fi
        done < "$SENSITIVE_PATTERNS_FILE"
    else
        # 默认模式
        local patterns=(
            "password.*[=:].*[A-Za-z0-9]{8,}"
            "secret.*[=:].*[A-Za-z0-9]{8,}"
            "key.*[=:].*[A-Za-z0-9]{8,}"
            "[A-Za-z0-9+/=]{32,}"
        )

        for pattern in "${patterns[@]}"; do
            if grep -q "$pattern" "$file" 2>/dev/null; then
                echo -e "${RED}❌ 发现敏感信息模式: $pattern${NC}"
                echo -e "${YELLOW}   文件: $file${NC}"
                found_sensitive=true
            fi
        done
    fi

    [[ "$found_sensitive" == true ]] && return 1
    return 0
}

is_whitelisted() {
    local file="$1"

    if git check-ignore "$file" 2>/dev/null; then
        return 0
    fi

    local whitelist_file=".git/hooks/sensitive-whitelist.txt"
    if [[ -f "$whitelist_file" ]]; then
        while IFS= read -r pattern || [[ -n "$pattern" ]]; do
            [[ "$pattern" =~ ^[[:space:]]*# ]] && continue
            [[ -z "$pattern" ]] && continue

            if [[ "$file" =~ $pattern ]]; then
                return 0
            fi
        done < "$whitelist_file"
    fi

    return 1
}

main() {
    echo -e "\n${BLUE}=== 敏感信息检测 ===${NC}\n"

    local staged_files
    local has_sensitive=false
    local checked_files=0

    staged_files=$(git diff --cached --name-only)

    for file in $staged_files; do
        [[ ! -f "$file" ]] && continue

        case "$file" in
            *.yml|*.yaml|*.properties|*.env|*.json|*.config|*.conf)
                if ! is_whitelisted "$file"; then
                    if ! detect_sensitive_info "$file"; then
                        has_sensitive=true
                    fi
                    ((checked_files++))
                fi
                ;;
        esac
    done

    if [[ $checked_files -eq 0 ]]; then
        echo -e "${GREEN}[INFO]${NC} 没有需要检查的配置文件"
        return 0
    fi

    if [[ "$has_sensitive" == true ]]; then
        echo
        echo -e "${RED}🚫 提交被阻止！${NC}"
        echo
        echo -e "${YELLOW}修复建议：${NC}"
        echo "1. 检查上述文件中的敏感信息"
        echo "2. 如果是测试数据，请确保使用占位符"
        echo "3. 如果是真实配置，请将其移到环境变量或本地配置文件"
        echo "4. 确认 .gitignore 已正确配置"
        echo
        echo -e "${BLUE}如何继续提交：${NC}"
        echo "- 修复敏感信息后重新提交"
        echo "- 或使用 --no-verify 跳过检查（仅在紧急情况下）"
        echo
        return 1
    fi

    echo -e "${GREEN}[INFO]${NC} 安全检查通过 ($checked_files 个文件已检查)"
}

main "$@"
EOF

    chmod +x "$PRE_COMMIT_HOOK"
    log_info "安装 pre-commit 钩子: $PRE_COMMIT_HOOK"
}

# 创建敏感信息模式文件
create_patterns_file() {
    cat > "$PATTERNS_FILE" << 'EOF'
# 敏感信息检测模式
password.*[=:].*[A-Za-z0-9]{8,}
pwd.*[=:].*[A-Za-z0-9]{8,}
secret.*[=:].*[A-Za-z0-9]{8,}
key.*[=:].*[A-Za-z0-9]{8,}
token.*[=:].*[A-Za-z0-9]{16,}
[A-Za-z0-9+/=]{32,}
mail.*password.*[A-Za-z0-9]{8,}
smtp.*password.*[A-Za-z0-9]{8,}
jwt.*secret.*[A-Za-z0-9]{16,}
EOF

    log_info "创建敏感信息模式文件: $PATTERNS_FILE"
}

# 创建白名单文件
create_whitelist_file() {
    cat > "$WHITELIST_FILE" << 'EOF'
# 白名单文件模式
.*\.example$
.*\.template$
.*\.sample$
.*/test/.*
.*/tests/.*
.*Test\.java$
.*Test\.ts$
.*\.md$
README.*
CHANGELOG.*
EOF

    log_info "创建白名单文件: $WHITELIST_FILE"
}

# 主函数
main() {
    log_info "开始安装 Git 安全钩子..."

    check_git_repo
    create_hooks_dir
    install_pre_commit_hook
    create_patterns_file
    create_whitelist_file

    log_info "✅ Git 安全钩子安装完成！"
    echo
    echo -e "${YELLOW}测试钩子：${NC}"
    echo "git add . && git commit -m 'test'"
    echo
    echo -e "${YELLOW}跳过检查：${NC}"
    echo "git commit --no-verify -m '紧急提交'"
}

main "$@"
