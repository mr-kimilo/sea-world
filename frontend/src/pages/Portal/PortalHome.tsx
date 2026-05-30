import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PortalHome() {
  const { t } = useTranslation('child');
  const navigate = useNavigate();

  const PORTAL_CARDS = [
    {
      title: `🐠 ${t('portal.points')}`,
      desc: t('portal.pointsDesc'),
      path: '/portal/under-sea',
      color: '#0ea5e9',
      bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    },
    {
      title: `💰 ${t('portal.moneyValue')}`,
      desc: t('portal.moneyValueDesc'),
      path: '/portal/child-value',
      color: '#10b981',
      bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    },
  ];

  return (
    <div className="portal-home">
      <div className="portal-hero">
        <h1 className="portal-hero-title">⚡ {t('portal.brandTitle')}</h1>
        <p className="portal-hero-sub">
          {t('portal.subtitle')}
        </p>
      </div>

      <div className="portal-cards">
        {PORTAL_CARDS.map((card) => (
          <button
            key={card.path}
            className="portal-card"
            style={{ background: card.bg }}
            onClick={() => {
              if (card.path === '/portal/under-sea') {
                window.location.href = '/home';
              } else {
                navigate(card.path);
              }
            }}
          >
            <div className="portal-card-title" style={{ color: card.color }}>
              {card.title}
            </div>
            <p className="portal-card-desc">{card.desc}</p>
            <div className="portal-card-action" style={{ color: card.color }}>
              {t('portal.enterAction')} →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
