# 前端对话框使用规范 (Frontend Dialog Guidelines)

## 📋 总则

**禁止使用浏览器原生对话框**：

- ❌ `window.confirm()` - 浏览器原生确认框
- ❌ `window.alert()` - 浏览器原生警告框
- ❌ `window.prompt()` - 浏览器原生输入框

**必须使用自定义对话框组件**：

- ✅ `useConfirm()` hook - 自定义确认对话框
- ✅ 带遮罩层的美化样式
- ✅ 支持国际化 (i18n)
- ✅ 响应式设计（适配手机和桌面）

---

## 🎯 使用场景

### 1. 确认操作 (Confirmation)

适用于需要用户二次确认的操作：

- ✅ 删除数据（商品、订单、用户等）
- ✅ 提交重要操作（购买、支付、确认消费）
- ✅ 取消操作（取消订单、取消修改）
- ✅ 不可逆操作（清空数据、重置设置）

### 2. 成功提示 (Success Notification)

操作成功后的提示：

- ✅ 创建成功
- ✅ 更新成功
- ✅ 删除成功
- ✅ 保存成功

### 3. 错误提示 (Error Notification)

操作失败或错误提示：

- ✅ 网络错误
- ✅ 服务器错误
- ✅ 表单验证失败
- ✅ 权限不足

### 4. 警告提示 (Warning)

需要用户注意的警告信息：

- ✅ 数据即将过期
- ✅ 余额不足
- ✅ 重要提醒

---

## 🔧 技术实现

### 1. 导入 `useConfirm` Hook

```typescript
import { useConfirm } from '../hooks/useConfirm';
// 或根据相对路径调整
// import { useConfirm } from '../../../hooks/useConfirm';
```

### 2. 在组件中使用

```typescript
export default function MyComponent() {
  const { confirm, ConfirmDialogComponent } = useConfirm();

  // 你的组件逻辑...

  return (
    <>
      {/* 你的 UI 组件 */}
      
      {/* 必须在返回的 JSX 中包含 ConfirmDialogComponent */}
      {ConfirmDialogComponent}
    </>
  );
}
```

### 3. 调用对话框

#### 示例 1：删除确认（危险操作）

```typescript
const handleDelete = async (product: Product) => {
  const confirmed = await confirm({
    title: t('deleteConfirm.title'),
    message: t('deleteConfirm.message', { name: product.name }),
    type: 'danger',
    confirmText: t('delete'),
    cancelText: t('cancel')
  });

  if (!confirmed) return; // 用户取消

  try {
    await deleteProduct(product.id);
    await confirm({
      title: t('success'),
      message: t('deleteSuccess'),
      type: 'success',
      confirmText: t('ok')
    });
  } catch (error) {
    await confirm({
      title: t('error'),
      message: t('deleteError'),
      type: 'danger',
      confirmText: t('ok')
    });
  }
};
```

#### 示例 2：购买确认（警告）

```typescript
const handleBuy = async (item: ShopItem) => {
  const confirmed = await confirm({
    title: t('buyDialog.title'),
    message: t('buyDialog.message', { itemName: item.name }),
    type: 'warning',
    confirmText: t('buy'),
    cancelText: t('cancel')
  });

  if (!confirmed) return;

  try {
    await createOrder(item.id);
    await confirm({
      title: t('success'),
      message: t('buySuccess'),
      type: 'success',
      confirmText: t('ok')
    });
  } catch (error) {
    await confirm({
      title: t('error'),
      message: t('buyError'),
      type: 'danger',
      confirmText: t('ok')
    });
  }
};
```

#### 示例 3：信息提示（仅确认）

```typescript
const handleInfo = async () => {
  await confirm({
    title: t('info'),
    message: t('pleaseSelectChild'),
    type: 'info',
    confirmText: t('ok')
  });
};
```

---

## 🎨 对话框类型 (Type)

| Type | 用途 | 按钮颜色 | 图标 |
|------|------|----------|------|
| `info` | 信息提示 | 紫色渐变 | ℹ️ |
| `warning` | 警告提示 | 粉红色渐变 | ⚠️ |
| `danger` | 危险操作 | 橙黄色渐变 | 🚫 |
| `success` | 成功提示 | 蓝色渐变 | ✅ |

---

## 📝 参数说明

### `confirm()` 方法参数

```typescript
interface ConfirmOptions {
  title?: string;          // 对话框标题（可选）
  message: string;         // 消息内容（必填）
  confirmText?: string;    // 确认按钮文字（默认使用 i18n 的 "confirm"）
  cancelText?: string;     // 取消按钮文字（默认使用 i18n 的 "cancel"）
  type?: 'info' | 'warning' | 'danger' | 'success'; // 对话框类型（默认 'info'）
}
```

### 返回值

```typescript
const confirmed: boolean = await confirm(options);

// confirmed === true  → 用户点击确认
// confirmed === false → 用户点击取消或点击遮罩层关闭
```

---

## ✅ 最佳实践

### 1. 总是使用 `await`

```typescript
// ✅ 正确
const confirmed = await confirm({ ... });
if (!confirmed) return;

// ❌ 错误（不要这样写）
confirm({ ... }).then(confirmed => {
  if (!confirmed) return;
});
```

### 2. 使用国际化 (i18n)

```typescript
// ✅ 正确
const confirmed = await confirm({
  title: t('deleteConfirm.title'),
  message: t('deleteConfirm.message', { name: product.name }),
  confirmText: t('delete'),
  cancelText: t('cancel')
});

// ❌ 错误（不要硬编码文字）
const confirmed = await confirm({
  title: '确认删除',
  message: `确定要删除 ${product.name} 吗？`,
  confirmText: '删除',
  cancelText: '取消'
});
```

### 3. 根据操作类型选择合适的 `type`

```typescript
// 删除操作 → danger
await confirm({ type: 'danger', ... });

// 购买/确认 → warning
await confirm({ type: 'warning', ... });

// 成功提示 → success
await confirm({ type: 'success', ... });

// 信息提示 → info
await confirm({ type: 'info', ... });
```

### 4. 提供清晰的消息

```typescript
// ✅ 正确 - 清晰明确
message: '确定要删除商品 "KFC 美食" 吗？此操作不可撤销。'

// ❌ 不好 - 信息不足
message: '确定删除吗？'
```

### 5. 成功/错误提示也要用自定义对话框

```typescript
// ✅ 正确
await confirm({
  title: t('success'),
  message: t('createSuccess'),
  type: 'success',
  confirmText: t('ok')
});

// ❌ 错误（不要用 alert）
alert(t('createSuccess'));
```

---

## 🎯 完整示例

```typescript
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirm } from '../hooks/useConfirm';
import { deleteProduct } from '../api/shop';

export default function ProductManager() {
  const { t } = useTranslation('shop');
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const [products, setProducts] = useState([]);

  const handleDelete = async (product) => {
    // 1. 确认删除
    const confirmed = await confirm({
      title: t('admin.deleteConfirm.title'),
      message: t('admin.deleteConfirm.message', { name: product.name }),
      type: 'danger',
      confirmText: t('admin.delete'),
      cancelText: t('common:cancel')
    });

    if (!confirmed) return;

    // 2. 执行删除
    try {
      await deleteProduct(product.id);
      
      // 3. 成功提示
      await confirm({
        title: t('admin.messages.success'),
        message: t('admin.messages.deleteSuccess'),
        type: 'success',
        confirmText: t('common:confirm')
      });
      
      // 4. 刷新列表
      loadProducts();
    } catch (error) {
      // 5. 错误提示
      await confirm({
        title: t('admin.messages.error'),
        message: t('admin.messages.deleteError') + ': ' + error.message,
        type: 'danger',
        confirmText: t('common:confirm')
      });
    }
  };

  return (
    <>
      {/* 你的 UI */}
      <button onClick={() => handleDelete(product)}>删除</button>
      
      {/* 必须包含 */}
      {ConfirmDialogComponent}
    </>
  );
}
```

---

## 🚫 常见错误

### 错误 1：忘记包含 `ConfirmDialogComponent`

```typescript
// ❌ 错误
return (
  <div>
    <button onClick={handleDelete}>删除</button>
  </div>
);

// ✅ 正确
return (
  <>
    <button onClick={handleDelete}>删除</button>
    {ConfirmDialogComponent}
  </>
);
```

### 错误 2：使用原生对话框

```typescript
// ❌ 错误
if (window.confirm('确定删除吗？')) {
  deleteProduct();
}

// ✅ 正确
const confirmed = await confirm({
  message: '确定删除吗？',
  type: 'danger'
});
if (confirmed) {
  deleteProduct();
}
```

### 错误 3：不使用 `await`

```typescript
// ❌ 错误（confirm 会立即返回 Promise，而不是布尔值）
const confirmed = confirm({ message: '确定吗？' });
if (confirmed) { ... } // confirmed 是 Promise，不是 boolean

// ✅ 正确
const confirmed = await confirm({ message: '确定吗？' });
if (confirmed) { ... } // confirmed 是 boolean
```

---

## 📦 相关文件

- `frontend/src/components/ConfirmDialog.tsx` - 对话框组件
- `frontend/src/components/ConfirmDialog.css` - 对话框样式
- `frontend/src/hooks/useConfirm.tsx` - Hook 实现
- `frontend/src/i18n/locales/zh-CN/common.json` - 中文翻译
- `frontend/src/i18n/locales/en-US/common.json` - 英文翻译

---

## 🔗 参考

- [React Hooks 官方文档](https://react.dev/reference/react)
- [react-i18next 文档](https://react.i18next.com/)
- 项目国际化规范：`.github/instructions/frontend-i18n.instructions.md`
- 组件模块化规范：`.github/instructions/frontend-component-modularity.instructions.md`

---

**最后更新**：2026-04-18
