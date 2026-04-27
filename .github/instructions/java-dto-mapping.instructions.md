---
description: "Use when writing DTO classes, converting between Request/Response and Entity, or mapping data between layers in Java backend. Covers DTO factory methods, builder pattern, and banned copy tools."
applyTo: "backend/**/*.java"
---

# Java DTO ↔ Entity Mapping

## 禁止使用的工具

❌ `BeanUtils.copyProperties(source, target)` — 反射拷贝，有以下问题：
- 编译期无法发现字段名不匹配
- 重构时 rename 字段不会报错
- 可能静默拷贝 `password` 等敏感字段
- 类型不匹配时无任何提示

## Entity → DTO（Response）

在 DTO 类中提供静态工厂方法 `from(Entity)`：

```java
// ✅ Record DTO（推荐，不可变）
public record ChildResponse(
    String id,
    String name,
    String nickname,
    int totalScore,
    int availableScore
) {
    public static ChildResponse from(Child child) {
        return new ChildResponse(
            child.getId().toString(),
            child.getName(),
            child.getNickname(),
            child.getTotalScore(),
            child.getAvailableScore()
        );
    }
}

// ✅ Class DTO（需要继承或复杂构建时）
public class ShopItemResponse {
    // fields...

    public static ShopItemResponse from(ShopItem item) {
        ShopItemResponse res = new ShopItemResponse();
        res.setId(item.getId().toString());
        res.setName(item.getName());
        res.setPrice(item.getPrice());
        res.setRarity(item.getRarity());
        return res;
    }
}
```

## DTO → Entity（Request 创建）

在 Service 层使用 Entity 的 `@Builder` 手动赋值：

```java
// ✅
Child child = Child.builder()
    .familyId(familyId)
    .name(request.getName())
    .nickname(request.getNickname())
    .birthDate(request.getBirthDate())
    .build();

// ❌
Child child = new Child();
BeanUtils.copyProperties(request, child);
```

## DTO → 已存在 Entity（Update）

只修改允许变更的字段，不整体替换：

```java
// ✅ 精细更新
child.setName(request.getName());
child.setNickname(request.getNickname());
child.setBirthDate(request.getBirthDate());
childRepository.save(child);

// ❌ 不要用 request 覆盖 entity 再保存（会丢失 id、score 等字段）
```

## 批量转换

```java
// ✅ Stream + 方法引用
List<ChildResponse> result = children.stream()
    .map(ChildResponse::from)
    .toList();
```

## 敏感字段保护

- `User` → 任何 Response：**绝对不能**包含 `password`、`emailVerifyToken` 字段
- 每个 DTO 只暴露当前场景必要的字段，遵循最小暴露原则
