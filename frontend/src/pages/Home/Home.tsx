import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { familyApi } from '../../api/family';
import ChildSelector from '../../components/ChildSelector';
import AddScore from '../../components/AddScore';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import PageShellHeader from '../../components/PageShellHeader';
import MobileSidebar from '../../components/MobileSidebar';
import ChildSlider from '../../components/ChildSlider';
import { useDeviceType } from '../../hooks/useDeviceType';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useUiStore } from '../../store/uiStore';
import './Home.css';
import './Home.mobile.css';

export default function Home() {
  const { t } = useTranslation(['home', 'common', 'family']);
  const { isMobile } = useDeviceType();
  const { user, logout } = useAuthStore();
  const { setFamilies, setCurrentFamily } = useFamilyStore();
  const navigate = useNavigate();
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  const loadFamilies = async () => {
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
    }
  };

  useEffect(() => {
    // 加载家庭信息
    loadFamilies();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScoreAdded = () => {
    // Mobile: keep user on current page after recording
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
          <Button onClick={handleLogout} className="logout-btn" type="button" variant="ghost">
            {t('common:logout')}
          </Button>
        </div>
      </header>
      {isMobile && (
        <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      )}

      <main className="home-content">
        {/* Mobile: remove in-page section nav per ui.md task #11 */}
        {!isMobile && (
          <PageShellHeader
            variant="full"
            title={t('home:pageMenuTitle')}
            sections={homePageSections}
          />
        )}
        <Card className="welcome-card" id="page-home-welcome">
          <h2>{t('home:welcomeBack', { name: user?.nickname || user?.email })}</h2>
        </Card>

        {/* 选择孩子 */}
        <div className="child-section" id="page-home-children">
          {isMobile ? <ChildSlider /> : <ChildSelector layout="grid" />}
        </div>

        {/* 积分操作 Tab */}
        {user?.role === 'parent' && (
          <div className="score-tabs-section" id="page-home-score">
            <div className="score-tab-content">
              <AddScore onScoreAdded={handleScoreAdded} />
            </div>
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

    </div>
  );
}
