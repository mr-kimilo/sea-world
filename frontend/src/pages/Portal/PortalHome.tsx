import { useNavigate } from 'react-router-dom';

const PORTAL_CARDS = [
  {
    title: '🐠 积分管理',
    desc: '查看和管理孩子的积分、兑换奖品',
    path: '/portal/under-sea',
    color: '#0ea5e9',
    bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
  },
  {
    title: '💰 金钱价值观纠正',
    desc: '让孩子直观了解金钱的价值',
    path: '/portal/child-value',
    color: '#10b981',
    bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
  },
];

export default function PortalHome() {
  const navigate = useNavigate();

  return (
    <div className="portal-home">
      <div className="portal-hero">
        <h1 className="portal-hero-title">⚡ 超体 · 超级家庭</h1>
        <p className="portal-hero-sub">
          统一家庭数字入口 — 积分管理 · 金钱教育
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
              进入 →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
