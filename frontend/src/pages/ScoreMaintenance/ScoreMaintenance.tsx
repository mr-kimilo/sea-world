import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { customCategoryApi, type CustomCategoryResponse } from '../../api/customCategory';
import { useConfirm } from '../../hooks/useConfirm';
import { useDeviceType } from '../../hooks/useDeviceType';

import LanguageSwitcher from '../../components/LanguageSwitcher';
import MobileSidebar from '../../components/MobileSidebar';
import { Button } from '../../components/ui/button';

import './ScoreMaintenance.css';
import './ScoreMaintenance.mobile.css';

export default function ScoreMaintenance() {
  const { t } = useTranslation(['profile', 'common', 'home']);
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { currentFamily } = useFamilyStore();
  const { isMobile } = useDeviceType();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<CustomCategoryResponse[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('⭐');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryIcon, setEditingCategoryIcon] = useState('⭐');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);

  const iconOptions = [
    '⭐', '🌟', '✨', '💫', '🎯', '🏆', '🥇', '🥈', '🥉',
    '📚', '📖', '✏️', '🎨', '🎭', '🎬', '🎤', '🎧',
    '⚽', '🏀', '⚾', '🎾', '🏐', '🏓', '🏸', '🥊',
    '🎮', '🎲', '🧩', '🖌️', '🖍️', '✂️',
    '🌈', '🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🍀', '🌿',
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒',
    '💪', '🧠', '❤️', '💚', '💙', '💛', '🧡', '💜', '🖤',
    '🔥', '💧', '⚡', '☀️', '🌙',
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadCustomCategories = async () => {
    if (!currentFamily) return;
    setIsLoadingCategories(true);
    try {
      const res = await customCategoryApi.getCategories();
      if (res.data.success && res.data.data) setCustomCategories(res.data.data);
    } catch (e) {
      console.error('Failed to load custom categories:', e);
      setCustomCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadCustomCategories();
  }, [currentFamily?.id]);

  const handleCreateCategory = async () => {
    if (!currentFamily || !newCategoryName.trim()) {
      await confirm({
        title: t('common:error'),
        message: t('profile:categoryNameRequired'),
        type: 'danger',
        confirmText: t('common:confirm'),
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await customCategoryApi.createCategory({
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
      });

      if (res.data.success) {
        await confirm({
          title: t('common:success'),
          message: t('profile:categoryCreated'),
          type: 'success',
          confirmText: t('common:confirm'),
        });
        await loadCustomCategories();
        setShowAddCategory(false);
        setNewCategoryName('');
        setNewCategoryIcon('⭐');
      }
    } catch (error: unknown) {
      console.error('Failed to create category:', error);
      const maybeData = axios.isAxiosError(error) ? error.response?.data : null;
      const message =
        typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
          ? String((maybeData as { message?: unknown }).message ?? '')
          : '';
      await confirm({
        title: t('common:error'),
        message: message || t('profile:createCategoryFailed'),
        type: 'danger',
        confirmText: t('common:confirm'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string, scoreCount: number) => {
    if (!currentFamily) return;

    const message = scoreCount > 0
      ? t('profile:deleteCategoryWithScoresConfirm', { name: categoryName, count: scoreCount })
      : t('profile:deleteCategoryConfirm', { name: categoryName });

    const confirmed = await confirm({
      title: t('profile:deleteCategoryTitle'),
      message,
      type: 'danger',
      confirmText: t('common:confirm'),
      cancelText: t('common:cancel'),
    });
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await customCategoryApi.deleteCategory(categoryId);
      await confirm({
        title: t('common:success'),
        message: t('profile:categoryDeleted'),
        type: 'success',
        confirmText: t('common:confirm'),
      });
      await loadCustomCategories();
    } catch (error: unknown) {
      console.error('Failed to delete category:', error);
      const maybeData = axios.isAxiosError(error) ? error.response?.data : null;
      const message2 =
        typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
          ? String((maybeData as { message?: unknown }).message ?? '')
          : '';
      await confirm({
        title: t('common:error'),
        message: message2 || t('profile:deleteCategoryFailed'),
        type: 'danger',
        confirmText: t('common:confirm'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const startEditCategory = (category: CustomCategoryResponse) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setEditingCategoryIcon(category.icon);
    setShowEditIconPicker(false);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
    setEditingCategoryIcon('⭐');
    setShowEditIconPicker(false);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryId) return;
    if (!editingCategoryName.trim()) {
      await confirm({
        title: t('common:error'),
        message: t('profile:categoryNameRequired'),
        type: 'danger',
        confirmText: t('common:confirm'),
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await customCategoryApi.updateCategory(editingCategoryId, {
        name: editingCategoryName.trim(),
        icon: editingCategoryIcon,
      });

      if (res.data.success) {
        await confirm({
          title: t('common:success'),
          message: t('profile:categoryUpdated'),
          type: 'success',
          confirmText: t('common:confirm'),
        });
        await loadCustomCategories();
        cancelEditCategory();
      }
    } catch (error: unknown) {
      console.error('Failed to update category:', error);
      const maybeData = axios.isAxiosError(error) ? error.response?.data : null;
      const message2 =
        typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
          ? String((maybeData as { message?: unknown }).message ?? '')
          : '';
      await confirm({
        title: t('common:error'),
        message: message2 || t('profile:updateCategoryFailed'),
        type: 'danger',
        confirmText: t('common:confirm'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="score-maintenance-page">
      <header className="score-maintenance-header">
        <div className="header-left">
          {isMobile && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="mob-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label={t('common:menu')}
            >
              <span aria-hidden="true">≡</span>
            </Button>
          )}
          <h1>🐠 {t('common:appName')}</h1>
          <p className="header-slogan">{t('home:slogan')}</p>
        </div>
        <div className="header-right">
          <LanguageSwitcher />
          <Button onClick={handleLogout} className="logout-btn" type="button" variant="ghost">
            {t('common:logout')}
          </Button>
        </div>
      </header>

      {isMobile && <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      <main className="score-maintenance-content">
        <section className="score-maintenance-section">
          <div className="section-header">
            <h2 className="section-title">{t('profile:customCategories')}</h2>
            <Button
              type="button"
              className="btn-primary"
              onClick={() => setShowAddCategory((v) => !v)}
              variant="outline"
              size="sm"
            >
              {showAddCategory ? t('common:cancel') : `+ ${t('profile:addCategory')}`}
            </Button>
          </div>

          {showAddCategory && (
            <div className="category-form info-card">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">
                    {t('profile:categoryName')} <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t('profile:categoryNamePlaceholder')}
                  />
                </div>
                <div className="form-group" style={{ width: '180px' }}>
                  <label className="form-label">{t('profile:categoryIcon')}</label>
                  <div className="icon-input-wrapper">
                    <button
                      type="button"
                      className="icon-display-btn"
                      onClick={() => setShowIconPicker((v) => !v)}
                    >
                      <span className="selected-icon">{newCategoryIcon}</span>
                      <span className="icon-arrow">▼</span>
                    </button>
                    {showIconPicker && (
                      <div className="icon-picker-dropdown">
                        {iconOptions.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            className={`icon-option ${newCategoryIcon === icon ? 'selected' : ''}`}
                            onClick={() => {
                              setNewCategoryIcon(icon);
                              setShowIconPicker(false);
                            }}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                className="btn-primary"
                onClick={handleCreateCategory}
                disabled={isSaving || !newCategoryName.trim()}
              >
                {isSaving ? t('common:saving') : t('common:save')}
              </Button>
            </div>
          )}

          {isLoadingCategories ? (
            <div className="empty-state">
              <p className="empty-text">{t('common:loading')}</p>
            </div>
          ) : customCategories.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📦</span>
              <p className="empty-text">{t('profile:noCustomCategories')}</p>
            </div>
          ) : (
            <div className="categories-grid">
              {customCategories.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="category-icon">{category.icon}</div>
                  <div className="category-info">
                    <h3 className="category-name">{category.name}</h3>
                    <p className="category-score-count">
                      {t('profile:scoreCount', { count: category.scoreCount })}
                    </p>
                  </div>
                  <button
                    className="btn-edit-category"
                    onClick={() => startEditCategory(category)}
                    disabled={isSaving}
                    aria-label={t('common:edit')}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete-category"
                    onClick={() => handleDeleteCategory(category.id, category.name, category.scoreCount)}
                    disabled={isSaving}
                    aria-label={t('common:delete')}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {editingCategoryId && (
          <section className="score-maintenance-section">
            <div className="section-header">
              <h2 className="section-title">{t('profile:editCategory')}</h2>
              <Button type="button" variant="outline" size="sm" onClick={cancelEditCategory}>
                {t('common:cancel')}
              </Button>
            </div>

            <div className="category-form info-card">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">
                    {t('profile:categoryName')} <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    placeholder={t('profile:categoryNamePlaceholder')}
                  />
                </div>
                <div className="form-group" style={{ width: '180px' }}>
                  <label className="form-label">{t('profile:categoryIcon')}</label>
                  <div className="icon-input-wrapper">
                    <button
                      type="button"
                      className="icon-display-btn"
                      onClick={() => setShowEditIconPicker((v) => !v)}
                    >
                      <span className="selected-icon">{editingCategoryIcon}</span>
                      <span className="icon-arrow">▼</span>
                    </button>
                    {showEditIconPicker && (
                      <div className="icon-picker-dropdown">
                        {iconOptions.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            className={`icon-option ${editingCategoryIcon === icon ? 'selected' : ''}`}
                            onClick={() => {
                              setEditingCategoryIcon(icon);
                              setShowEditIconPicker(false);
                            }}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                className="btn-primary"
                onClick={handleUpdateCategory}
                disabled={isSaving || !editingCategoryName.trim()}
              >
                {isSaving ? t('common:saving') : t('common:save')}
              </Button>
            </div>
          </section>
        )}
      </main>

      {ConfirmDialogComponent}
    </div>
  );
}
