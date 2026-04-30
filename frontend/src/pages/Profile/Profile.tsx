import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useFamilyStore } from '../../store/familyStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { familyApi, type ChildRequest, type ChildResponse } from '../../api/family';
import { useConfirm } from '../../hooks/useConfirm';
import AddChild from '../../components/AddChild';
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
  const { currentFamily, children, setChildren, setCurrentFamily } = useFamilyStore();
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
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const [showAddChild, setShowAddChild] = useState(false);

  useEffect(() => {
    if (currentFamily) {
      setFamilyName(currentFamily.name);
    }
  }, [currentFamily]);

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
        setChildren(res.data.data);
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

  const handleAddChildSuccess = async () => {
    setShowAddChild(false);
    if (!currentFamily) return;
    const res = await familyApi.getChildren(currentFamily.id);
    if (res.data.success && res.data.data) {
      setChildren(res.data.data);
    }
  };

  const profilePageSections = [
    { id: 'page-profile-family', label: t('profile:pageNav.family') },
    { id: 'page-profile-children', label: t('profile:pageNav.children') },
  ];

  return (
    <div className="profile-container">
      {/* Header - 与首页一致 */}
      {isMobile && (
        <header className="profile-header">
          <div className="header-left">
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
      )}
      {isMobile && (
        <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      )}

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
          {children.length === 0 && user?.role !== 'parent' ? (
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
              {user?.role === 'parent' && (
                <button
                  type="button"
                  className="profile-child-card profile-child-card--add"
                  onClick={() => setShowAddChild(true)}
                  aria-label={t('family:addChild')}
                >
                  <div className="add-child-card-inner">
                    <div className="add-child-icon" aria-hidden="true">
                      ＋
                    </div>
                    <div className="add-child-label">{t('family:addChild')}</div>
                  </div>
                </button>
              )}
            </div>
          )}
        </section>

      </main>

      {showAddChild && (
        <AddChild onClose={() => setShowAddChild(false)} onSuccess={handleAddChildSuccess} />
      )}

      {ConfirmDialogComponent}
    </div>
  );
}
