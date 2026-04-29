import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useFamilyStore } from '../../store/familyStore';
import { useAuthStore } from '../../store/authStore';
import { familyApi, type ChildRequest, type ChildResponse } from '../../api/family';
import { customCategoryApi, type CustomCategoryResponse } from '../../api/customCategory';
import { useConfirm } from '../../hooks/useConfirm';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import PageShellHeader from '../../components/PageShellHeader';
import { useDeviceType } from '../../hooks/useDeviceType';
import MobileSidebar from '../../components/MobileSidebar';
import { Button } from '../../components/ui/button';
import './Profile.css';
import './Profile.mobile.css';

export default function Profile() {
  const { t } = useTranslation(['profile', 'common', 'family', 'home']);
  const { isMobile } = useDeviceType();
  const navigate = useNavigate();
  const { currentFamily, children, setCurrentFamily } = useFamilyStore();
  const { user, logout } = useAuthStore();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  const [familyName, setFamilyName] = useState('');
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editingChildData, setEditingChildData] = useState<ChildRequest>({
    name: '',
    nickname: '',
    birthDate: '',
    avatarUrl: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // 自定义积分维度状态
  const [customCategories, setCustomCategories] = useState<CustomCategoryResponse[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('⭐');
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 任务32：预定义图标列表
  const iconOptions = [
    '⭐', '🌟', '✨', '💫', '🎯', '🏆', '🥇', '🥈', '🥉', 
    '📚', '📖', '✏️', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🥊',
    '🎮', '🎲', '🧩', '🎯', '🎪', '🎨', '🖌️', '🖍️', '✂️',
    '🌈', '🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🍀', '🌿',
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒',
    '💪', '🧠', '❤️', '💚', '💙', '💛', '🧡', '💜', '🖤',
    '🔥', '💧', '⚡', '☀️', '🌙', '⭐', '🌟', '✨', '💫'
  ];

  useEffect(() => {
    if (currentFamily) {
      setFamilyName(currentFamily.name);
      loadCustomCategories();
    }
  }, [currentFamily]);

  const loadCustomCategories = async () => {
    if (!currentFamily) return;

    setIsLoadingCategories(true);
    try {
      const res = await customCategoryApi.getCategories();
      if (res.data.success && res.data.data) {
        setCustomCategories(res.data.data);
      }
    } catch (error: unknown) {
      console.error('Failed to load custom categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleSaveFamilyName = async () => {
    if (!currentFamily || !familyName.trim()) {
      await confirm({
        title: t('common:error'),
        message: t('profile:familyNameRequired'),
        type: 'danger',
        confirmText: t('common:confirm'),
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await familyApi.updateFamily(currentFamily.id, { name: familyName.trim() });
      if (res.data.success && res.data.data) {
        setCurrentFamily(res.data.data);
        await confirm({
          title: t('common:success'),
          message: t('profile:familyNameUpdated'),
          type: 'success',
          confirmText: t('common:confirm'),
        });
      }
    } catch (error: unknown) {
      console.error('Failed to update family name:', error);
      const maybeData = axios.isAxiosError(error) ? error.response?.data : null;
      const message =
        typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
          ? String((maybeData as { message?: unknown }).message ?? '')
          : '';
      await confirm({
        title: t('common:error'),
        message: message || t('profile:updateFailed'),
        type: 'danger',
        confirmText: t('common:confirm'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditChild = (child: ChildResponse) => {
    setEditingChildId(child.id);
    setEditingChildData({
      name: child.name,
      nickname: child.nickname || '',
      birthDate: child.birthDate || '',
      avatarUrl: child.avatarUrl || '',
    });
  };

  const handleSaveChild = async () => {
    if (!currentFamily || !editingChildId) return;

    if (!editingChildData.name.trim()) {
      await confirm({
        title: t('common:error'),
        message: t('family:childNameRequired'),
        type: 'danger',
        confirmText: t('common:confirm'),
      });
      return;
    }

    setIsSaving(true);
    try {
      await familyApi.updateChild(currentFamily.id, editingChildId, editingChildData);
      
      await confirm({
        title: t('common:success'),
        message: t('profile:childUpdated'),
        type: 'success',
        confirmText: t('common:confirm'),
      });

      // 刷新孩子列表
      const res = await familyApi.getChildren(currentFamily.id);
      if (res.data.success && res.data.data) {
        useFamilyStore.setState({ children: res.data.data });
      }

      setEditingChildId(null);
    } catch (error: unknown) {
      console.error('Failed to update child:', error);
      const maybeData = axios.isAxiosError(error) ? error.response?.data : null;
      const message =
        typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
          ? String((maybeData as { message?: unknown }).message ?? '')
          : '';
      await confirm({
        title: t('common:error'),
        message: message || t('profile:updateFailed'),
        type: 'danger',
        confirmText: t('common:confirm'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingChildId(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 创建自定义积分维度
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

        // 刷新列表
        loadCustomCategories();
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

  // 删除自定义积分维度
  const handleDeleteCategory = async (categoryId: string, categoryName: string, scoreCount: number) => {
    if (!currentFamily) return;

    // 如果有积分记录，提示用户
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

      // 刷新列表
      loadCustomCategories();
    } catch (error: unknown) {
      console.error('Failed to delete category:', error);
      const maybeData = axios.isAxiosError(error) ? error.response?.data : null;
      const message =
        typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
          ? String((maybeData as { message?: unknown }).message ?? '')
          : '';
      await confirm({
        title: t('common:error'),
        message: message || t('profile:deleteCategoryFailed'),
        type: 'danger',
        confirmText: t('common:confirm'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const profilePageSections = [
    { id: 'page-profile-family', label: t('profile:pageNav.family') },
    { id: 'page-profile-children', label: t('profile:pageNav.children') },
    { id: 'page-profile-categories', label: t('profile:pageNav.categories') },
  ];

  return (
    <div className="profile-container">
      {/* Header - 与首页一致 */}
      <header className="profile-header">
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

      {/* Mobile: remove in-page section nav (keep it simple like Home) */}

      <main className="profile-content">
        {!isMobile && (
          <PageShellHeader
            variant="full"
            title={t('profile:pageMenuTitle')}
            sections={profilePageSections}
          />
        )}
        {/* 家庭信息 */}
        <section className="profile-section" id="page-profile-family">
          <h2 className="section-title">{t('profile:familyInfo')}</h2>
          <div className="info-card">
            <div className="form-group">
              <label className="form-label">
                {t('profile:familyName')} <span className="required">*</span>
              </label>
              <div className="input-with-button">
                <input
                  type="text"
                  className="form-input"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder={t('profile:familyNamePlaceholder')}
                />
                <button
                  className="btn-primary"
                  onClick={handleSaveFamilyName}
                  disabled={isSaving || !familyName.trim()}
                >
                  {isSaving ? t('common:saving') : t('common:save')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 孩子列表 */}
        <section className="profile-section" id="page-profile-children">
          <h2 className="section-title">{t('profile:childrenList')}</h2>
          {children.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">👶</span>
              <p className="empty-text">{t('profile:noChildren')}</p>
            </div>
          ) : (
            <div className="profile-children-grid">
              {children.map((child) => (
                <div key={child.id} className="profile-child-card">
                  {editingChildId === child.id ? (
                    // 编辑模式
                    <div className="profile-child-edit-form">
                      <div className="form-group">
                        <label className="form-label">
                          {t('family:childName')} <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={editingChildData.name}
                          onChange={(e) =>
                            setEditingChildData({ ...editingChildData, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('family:nickname')}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editingChildData.nickname}
                          onChange={(e) =>
                            setEditingChildData({ ...editingChildData, nickname: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('family:birthDate')}</label>
                        <input
                          type="date"
                          className="form-input"
                          value={editingChildData.birthDate}
                          onChange={(e) =>
                            setEditingChildData({ ...editingChildData, birthDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('family:avatarUrl')}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editingChildData.avatarUrl}
                          onChange={(e) =>
                            setEditingChildData({ ...editingChildData, avatarUrl: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-actions">
                        <button
                          className="btn-primary"
                          onClick={handleSaveChild}
                          disabled={isSaving}
                        >
                          {isSaving ? t('common:saving') : t('common:save')}
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          {t('common:cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 查看模式 - 任务31：头像和编辑按钮同行，国际化分数标签
                    <div className="profile-child-view">
                      <div style={{ width: '100%' }}>
                        <div className="profile-child-view-header">
                          <div className="profile-child-avatar-wrapper">
                            <div className="profile-child-avatar">
                              {child.avatarUrl && child.avatarUrl.trim() ? (
                                <img 
                                  src={child.avatarUrl} 
                                  alt={child.name}
                                  onError={(e) => {
                                    // 如果图片加载失败，隐藏img并显示占位符
                                    const target = e.currentTarget;
                                    target.style.display = 'none';
                                    const placeholder = target.parentElement?.querySelector('.avatar-placeholder');
                                    if (placeholder) {
                                      (placeholder as HTMLElement).style.display = 'block';
                                    }
                                  }}
                                />
                              ) : null}
                              <span 
                                className="avatar-placeholder" 
                                style={{ display: child.avatarUrl && child.avatarUrl.trim() ? 'none' : 'block' }}
                              >
                                👶
                              </span>
                            </div>
                          </div>
                          <div className="profile-child-info">
                            <h3 className="profile-child-name">
                              {child.nickname || child.name}
                            </h3>
                            {child.nickname && (
                              <p className="profile-child-fullname">({child.name})</p>
                            )}
                            {child.birthDate && (
                              <p className="profile-child-birthdate">
                                🎂 {new Date(child.birthDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {user?.role === 'parent' && (
                            <button
                              className="btn-edit"
                              onClick={() => handleEditChild(child)}
                            >
                              ✏️ {t('common:edit')}
                            </button>
                          )}
                        </div>
                        <div className="profile-child-scores">
                          <div className="score-item">
                            <span className="score-label">⭐ {t('family:child.totalScore')}</span>
                            <span className="score-value">{child.totalScore}</span>
                          </div>
                          <div className="score-item">
                            <span className="score-label">💎 {t('family:child.availableScore')}</span>
                            <span className="score-value">{child.availableScore}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TODO: 任务29 - 自定义积分维度管理 */}
        {/* 将在下一步实现 */}
        
        {/* 自定义积分维度管理 */}
        <section className="profile-section" id="page-profile-categories">
          <div className="section-header">
            <h2 className="section-title">{t('profile:customCategories')}</h2>
            <button
              className="btn-primary"
              onClick={() => setShowAddCategory(!showAddCategory)}
            >
              {showAddCategory ? t('common:cancel') : '+ ' + t('profile:addCategory')}
            </button>
          </div>

          {/* 添加新维度表单 */}
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
                      onClick={() => setShowIconPicker(!showIconPicker)}
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
              <button
                className="btn-primary"
                onClick={handleCreateCategory}
                disabled={isSaving || !newCategoryName.trim()}
              >
                {isSaving ? t('common:saving') : t('common:save')}
              </button>
            </div>
          )}

          {/* 自定义维度列表 */}
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
                    className="btn-delete-category"
                    onClick={() => handleDeleteCategory(
                      category.id,
                      category.name,
                      category.scoreCount
                    )}
                    disabled={isSaving}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {ConfirmDialogComponent}
    </div>
  );
}
