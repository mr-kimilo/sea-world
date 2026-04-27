import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { familyApi, type ChildRequest } from '../api/family';
import { useFamilyStore } from '../store/familyStore';
import './AddChild.css';
import './AddChild.mobile.css';

interface AddChildProps {
  onClose: () => void;
  onSuccess: () => void;
}

// 默认卡通头像列表（使用 emoji + 渐变背景色）
const DEFAULT_AVATARS = [
  { id: 'fish',     emoji: '🐟', color: '#a8d8ea' },
  { id: 'star',     emoji: '⭐', color: '#ffd670' },
  { id: 'rabbit',   emoji: '🐰', color: '#f7c5d5' },
  { id: 'dragon',   emoji: '🐲', color: '#b5ead7' },
  { id: 'penguin',  emoji: '🐧', color: '#c7ceea' },
  { id: 'cat',      emoji: '🐱', color: '#ffdac1' },
  { id: 'dog',      emoji: '🐶', color: '#e2cfc4' },
  { id: 'panda',    emoji: '🐼', color: '#d5e8d4' },
];

// 计算日期限制
function getDateLimits() {
  const today = new Date();
  // 最大日期：今天（不能选未来）
  const maxDate = today.toISOString().split('T')[0];
  // 最小日期：12年前（不超过12岁）
  const minDate = new Date(
    today.getFullYear() - 12,
    today.getMonth(),
    today.getDate()
  ).toISOString().split('T')[0];
  return { maxDate, minDate };
}

export default function AddChild({ onClose, onSuccess }: AddChildProps) {
  const { t } = useTranslation(['child', 'common']);
  const { currentFamily, setChildren } = useFamilyStore();

  const [formData, setFormData] = useState<ChildRequest>({
    name: '',
    nickname: '',
    birthDate: '',
    avatarUrl: DEFAULT_AVATARS[0].id,
  });

  const [errors, setErrors] = useState<{ name?: string; birthDate?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { maxDate, minDate } = getDateLimits();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAvatarSelect = (avatarId: string) => {
    setFormData((prev) => ({ ...prev, avatarUrl: avatarId }));
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; birthDate?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = t('child:addChild.nameRequired');
    }

    if (formData.birthDate) {
      const birth = new Date(formData.birthDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (birth > today) {
        newErrors.birthDate = t('child:addChild.birthDateFuture');
      } else if (birth < new Date(minDate)) {
        newErrors.birthDate = t('child:addChild.birthDateTooOld');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[AddChild] handleSubmit triggered');
    console.log('[AddChild] isSubmitting:', isSubmitting);
    console.log('[AddChild] currentFamily:', currentFamily);
    console.log('[AddChild] formData:', formData);

    // 防止二次点击
    if (isSubmitting) {
      console.warn('[AddChild] Already submitting, ignoring duplicate click');
      return;
    }

    // 校验表单
    const isValid = validate();
    console.log('[AddChild] validation result:', isValid);
    if (!isValid) return;

    // 检查家庭是否已加载
    if (!currentFamily) {
      console.error('[AddChild] currentFamily is null — family not loaded yet');
      showToast('error', '未找到家庭信息，请刷新页面后重试');
      return;
    }

    setIsSubmitting(true);
    console.log('[AddChild] Calling API addChild, familyId:', currentFamily.id);

    try {
      const requestData: ChildRequest = {
        name: formData.name.trim(),
        ...(formData.nickname?.trim() && { nickname: formData.nickname.trim() }),
        ...(formData.birthDate && { birthDate: formData.birthDate }),
        ...(formData.avatarUrl && { avatarUrl: formData.avatarUrl }),
      };
      console.log('[AddChild] requestData:', requestData);

      const addRes = await familyApi.addChild(currentFamily.id, requestData);
      console.log('[AddChild] addChild response:', addRes.data);

      // 刷新子女列表
      const res = await familyApi.getChildren(currentFamily.id);
      console.log('[AddChild] getChildren response:', res.data);
      if (res.data.success && res.data.data) {
        setChildren(res.data.data);
      }

      showToast('success', t('child:addChild.successMessage'));
      setTimeout(onSuccess, 1200);
    } catch (error: any) {
      console.error('[AddChild] Submit failed:', error);
      console.error('[AddChild] Error response:', error.response?.data);
      showToast(
        'error',
        error.response?.data?.message || t('child:addChild.errorMessage')
      );
    } finally {
      setIsSubmitting(false);
      console.log('[AddChild] Submit finished, isSubmitting reset to false');
    }
  };

  return (
    <div className="add-child-overlay" onClick={onClose}>
      {/* Toast 通知 */}
      {toast && (
        <div className={`add-child-toast add-child-toast--${toast.type}`}>
          <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.message}
        </div>
      )}

      <div className="add-child-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-child-header">
          <h2>{t('child:addChild.title')}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="add-child-form" onSubmit={handleSubmit}>
          {/* 头像选择 */}
          <div className="form-group">
            <label>{t('child:addChild.avatarLabel')}</label>
            <div className="avatar-grid">
              {DEFAULT_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  className={`avatar-option${formData.avatarUrl === avatar.id ? ' selected' : ''}`}
                  style={{ backgroundColor: avatar.color }}
                  onClick={() => handleAvatarSelect(avatar.id)}
                  disabled={isSubmitting}
                  aria-label={avatar.id}
                >
                  <span>{avatar.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 姓名（必填） */}
          <div className="form-group">
            <label htmlFor="name">
              {t('child:addChild.nameLabel')} <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('child:addChild.namePlaceholder')}
              disabled={isSubmitting}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* 昵称（可选） */}
          <div className="form-group">
            <label htmlFor="nickname">{t('child:addChild.nicknameLabel')}</label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={formData.nickname}
              onChange={handleChange}
              placeholder={t('child:addChild.nicknamePlaceholder')}
              disabled={isSubmitting}
            />
          </div>

          {/* 生日（可选，日期范围限制） */}
          <div className="form-group">
            <label htmlFor="birthDate">{t('child:addChild.birthDateLabel')}</label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              min={minDate}
              max={maxDate}
              disabled={isSubmitting}
              className={errors.birthDate ? 'error' : ''}
            />
            {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
          </div>

          {/* 按钮组 */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              {t('child:addChild.cancelButton')}
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? t('child:addChild.loadingMessage') : t('child:addChild.submitButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

