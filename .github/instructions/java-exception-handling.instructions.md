---
description: "Use when writing Java service, controller, or exception classes. Covers GlobalExceptionHandler, ServiceException hierarchy, ApiResponse, and error handling patterns."
applyTo: "backend/**/*.java"
---

# Java Global Exception Handling

所有异常通过 `@RestControllerAdvice` 统一拦截，**禁止** 在 Controller 或 Service 内 catch 后吞掉异常。

## 分层职责

| 层 | 职责 | 消息来源 |
|----|------|---------|
| Controller | `@Validated` + `@Valid` 参数校验，调用 Service，组装成功响应 | `ResponseMessages` 枚举 |
| Service | 业务逻辑 + 事务边界，遇到问题直接 `throw new XxxException(...)` | `ErrorMessages` 枚举 |
| GlobalExceptionHandler | 统一拦截所有异常，转为 `ApiResponse` 响应 | 从异常对象获取 |
| Config (`@ConfigurationProperties`) | 邮件/通知模板等可变文本 | `application.yml` |

## 异常类层级

所有自定义异常继承 `ServiceException`（基类，继承 `RuntimeException`）：

```
ServiceException (base)
├── ResourceNotFoundException   → 404
├── DuplicateResourceException  → 409
├── AuthenticationException     → 401
├── ForbiddenException          → 403
├── RateLimitException          → 429
└── BusinessException           → 4xx（向后兼容，默认 400）
```

## 异常类型映射

| 异常 | HTTP 状态 | 场景 |
|------|-----------|------|
| `ResourceNotFoundException` | 404 | 资源不存在 |
| `DuplicateResourceException` | 409 | 重复创建（如邮箱已注册） |
| `AuthenticationException` | 401 | 认证失败（凭证无效） |
| `ForbiddenException` | 403 | 权限不足（已认证但无权） |
| `RateLimitException` | 429 | 频率限制 |
| `BusinessException` | 4xx（可指定） | 其他可预期业务错误 |
| `MethodArgumentNotValidException` | 400 | `@Valid` 字段校验失败 |
| `Exception` | 500 | 未知错误，不暴露堆栈 |

## 消息集中管理规则

**禁止**在 Java 代码中直接写硬编码消息字符串。所有消息必须通过枚举或配置管理：

| 消息类型 | 存放位置 | 枚举/配置 |
|---------|---------|-----------|
| 异常消息（抛出给用户） | `util/ErrorMessages` 枚举 | `ErrorMessages.XXX.getMessage()` |
| 带占位符的异常消息 | `util/ErrorMessages` 枚举 | `ErrorMessages.XXX.format(args)` |
| 成功响应消息 | `util/ResponseMessages` 枚举 | `ResponseMessages.XXX.getMessage()` |
| 邮件/通知模板 | `application.yml` + `@ConfigurationProperties` | 通过 Properties 类注入 |

```java
// ✅ 使用 ErrorMessages 枚举
throw new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND.getMessage());
throw new DuplicateResourceException(ErrorMessages.EMAIL_ALREADY_REGISTERED.getMessage());
throw new BusinessException(ErrorMessages.DAILY_POSITIVE_LIMIT_EXCEEDED.format(limit), HttpStatus.UNPROCESSABLE_ENTITY);

// ✅ Controller 成功响应使用 ResponseMessages
return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.LOGIN_SUCCESS.getMessage(), data));

// ❌ 禁止硬编码消息
throw new ResourceNotFoundException("User not found");
return ResponseEntity.ok(ApiResponse.ok("登录成功", data));
```

## 输入校验规则

Controller **必须**对所有外部输入做校验，Service 层不做重复校验：

| 注解 | 位置 | 说明 |
|------|------|------|
| `@Validated` | Controller 类级别 | 启用方法参数校验（`@RequestParam` 等） |
| `@Valid` | `@RequestBody` 参数前 | 触发 DTO 内部字段校验 |
| `@NotBlank` / `@Email` | `@RequestParam` | 单个参数约束 |
| `@PositiveOrZero` / `@Min` / `@Max` | 分页参数 | 分页参数范围约束 |

```java
// ✅ Controller 类上加 @Validated
@RestController
@RequestMapping("/api/xxx")
@Validated
public class XxxController {

    // ✅ RequestBody 用 @Valid
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> create(@Valid @RequestBody CreateRequest request) { ... }

    // ✅ RequestParam 用具体约束
    @GetMapping
    public ResponseEntity<ApiResponse<Page<XxxResponse>>> list(
            @RequestParam(defaultValue = "0") @PositiveOrZero int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) { ... }
}
```

## 必须遵守的模式

```java
// ✅ 使用语义化的具体子类 + ErrorMessages 枚举
throw new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND.getMessage());
throw new DuplicateResourceException(ErrorMessages.EMAIL_ALREADY_REGISTERED.getMessage());
throw new AuthenticationException(ErrorMessages.INVALID_EMAIL_OR_PASSWORD.getMessage());
throw new ForbiddenException(ErrorMessages.EMAIL_NOT_VERIFIED.getMessage());
throw new RateLimitException(ErrorMessages.DAILY_REGISTRATION_LIMIT.getMessage());

// ✅ 通用业务异常兜底
throw new BusinessException(ErrorMessages.INSUFFICIENT_SCORE.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);

// ❌ 禁止 Controller 里手动构造错误响应
try {
    service.doSomething();
} catch (Exception e) {
    return ResponseEntity.badRequest().body(...);
}
```

## 统一响应格式

所有接口（含错误）必须使用 `ApiResponse<T>` 包装：

```java
// 成功
ApiResponse.ok(data)
ApiResponse.ok("操作成功", data)

// 失败（由 GlobalExceptionHandler 生成）
ApiResponse.error("Email is already registered")
```

## GlobalExceptionHandler 结构

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Handles all ServiceException subclasses (including BusinessException)
    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<ApiResponse<Void>> handleService(ServiceException e) {
        return ResponseEntity.status(e.getStatus()).body(ApiResponse.error(e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(ApiResponse.error(msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnknown(Exception e) {
        log.error("Unhandled exception", e);
        return ResponseEntity.internalServerError().body(ApiResponse.error("Internal server error"));
    }
}
```
