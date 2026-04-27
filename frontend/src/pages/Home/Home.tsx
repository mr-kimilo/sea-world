import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { familyApi } from '../../api/family';
import ChildSelector from '../../components/ChildSelector';
import AddScore from '../../components/AddScore';
import ScoreHistory from '../../components/ScoreHistory';
import AddChild from '../../components/AddChild';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import PageShellHeader from '../../components/PageShellHeader';
import { useDeviceType } from '../../hooks/useDeviceType';
import './Home.css';
import './Home.mobile.css';

type HomeTab = 'addScore' | 'history';

export default function Home() {
  const { t } = useTranslation(['home', 'common', 'family']);
  const { isMobile } = useDeviceType();
  const { user, logout } = useAuthStore();
  const { currentFamily, setFamilies, setCurrentFamily } = useFamilyStore();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddChild, setShowAddChild] = useState(false);
  const [isFamilyLoading, setIsFamilyLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<HomeTab>('addScore');

  useEffect(() => {
    // 加载家庭信息
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    setIsFamilyLoading(true);
    try {
      const res = await familyApi.getMyFamilies();
      if (res.data.success && res.data.data) {
        const families = res.data.data;
        setFamilies(families);
        
        // 自动选中第一个家庭
        if (families.length > 0) {
          setCurrentFamily(families[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load families:', err);
    } finally {
      setIsFamilyLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScoreAdded = () => {
    // 触发积分历史刷新
    setRefreshTrigger((prev) => prev + 1);
    // 切换到历史 tab 展示结果
    setActiveTab('history');
  };

  const handleAddChildSuccess = () => {
    // 关闭弹窗，触发刷新
    setShowAddChild(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const homePageSections =
    user?.role === 'parent'
      ? [
          { id: 'page-home-welcome', label: t('home:pageNav.welcome') },
          { id: 'page-home-children', label: t('home:pageNav.children') },
          { id: 'page-home-score', label: t('home:pageNav.score') },
        ]
      : [
          { id: 'page-home-welcome', label: t('home:pageNav.welcome') },
          { id: 'page-home-children', label: t('home:pageNav.children') },
          { id: 'page-home-history', label: t('home:tabs.history') },
        ];

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-left">
          <h1>🐠 {t('common:appName')}</h1>
          <p className="header-slogan">{t('home:slogan')}</p>
        </div>
        <div className="header-right">
          <LanguageSwitcher />
          <button onClick={handleLogout} className="logout-btn">
            {t('common:logout')}
          </button>
        </div>
      </header>

      <main className="home-content">
        {/* Mobile: remove in-page section nav per ui.md task #11 */}
        {!isMobile && (
          <PageShellHeader
            variant="full"
            title={t('home:pageMenuTitle')}
            sections={homePageSections}
          />
        )}
        <div className="welcome-card" id="page-home-welcome">
          <h2>{t('home:welcomeBack', { name: user?.nickname || user?.email })}</h2>
        </div>

        {/* 选择孩子 */}
        <div className="child-section" id="page-home-children">
          <div className="section-header">
            {user?.role === 'parent' && (
              <button
                className="btn-add-child"
                onClick={() => setShowAddChild(true)}
                disabled={isFamilyLoading || !currentFamily}
              >
                + {t('family:addChild')}
              </button>
            )}
          </div>
          <ChildSelector />
        </div>

        {/* 积分操作 Tab */}
        {user?.role === 'parent' && (
          <div className="score-tabs-section" id="page-home-score">
            <div className="score-tabs">
              <button
                className={`score-tab ${activeTab === 'addScore' ? 'active' : ''}`}
                onClick={() => setActiveTab('addScore')}
                type="button"
              >
                {t('home:tabs.addScore')}
              </button>
              <button
                className={`score-tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
                type="button"
              >
                {t('home:tabs.history')}
              </button>
            </div>
            <div className="score-tab-content">
              {activeTab === 'addScore' ? (
                <AddScore onScoreAdded={handleScoreAdded} />
              ) : (
                <ScoreHistory refreshTrigger={refreshTrigger} />
              )}
            </div>
          </div>
        )}

        {/* 孩子只看历史 */}
        {user?.role !== 'parent' && (
          <div className="section-card" id="page-home-history">
            <ScoreHistory refreshTrigger={refreshTrigger} />
          </div>
        )}

        {/* 快捷导航 (mobile removed — bottom tabbar already exists) */}
        {!isMobile && (
          <div className="nav-grid">
            <div className="nav-card" onClick={() => navigate('/shop')}>
              <span className="nav-icon">🏪</span>
              <span className="nav-label">{t('home:nav.shop')}</span>
            </div>
            <div className="nav-card" onClick={() => navigate('/profile')}>
              <span className="nav-icon">👤</span>
              <span className="nav-label">{t('home:nav.profile')}</span>
            </div>
          </div>
        )}
      </main>

      {/* 添加孩子弹窗 */}
      {showAddChild && (
        <AddChild
          onClose={() => setShowAddChild(false)}
          onSuccess={handleAddChildSuccess}
        />
      )}
    </div>
  );
}
