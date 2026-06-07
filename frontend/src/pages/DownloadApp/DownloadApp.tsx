import { useTranslation } from 'react-i18next';
import './DownloadApp.css';

const SCREENSHOTS = [
  { src: '/screenshots/record-home.png', label: '积分管理首页' },
  { src: '/screenshots/record-history.png', label: '积分历史' },
  { src: '/screenshots/point-store.png', label: '积分商城' },
  { src: '/screenshots/my-orders.png', label: '我的订单' },
];

export default function DownloadApp() {
  const { t, i18n } = useTranslation('child');

  return (
    <div className="download-page">
      <div className="download-header">
        <h1>⚡ HyperOne</h1>
        <p className="download-subtitle">{t('portal.subtitle')}</p>
      </div>

      {/* Download Cards */}
      <div className="download-platforms">
        {/* Android */}
        <div className="download-card">
          <div className="download-card-icon">🤖</div>
          <h3>Android</h3>
          <p className="download-card-desc">下载 APK 安装包，支持 Android 7.0+</p>
          <a href="/api/app/download" className="download-btn" download>
            📥 下载 APK
          </a>
          {/* QR Code placeholder - inline SVG */}
          <div className="download-qr">
            <div className="qr-placeholder">
              <svg viewBox="0 0 100 100" width="120" height="120">
                <rect x="0" y="0" width="100" height="100" fill="white" rx="8"/>
                {/* QR pattern */}
                <rect x="5" y="5" width="25" height="25" fill="black" rx="2"/>
                <rect x="8" y="8" width="19" height="19" fill="white" rx="1"/>
                <rect x="11" y="11" width="13" height="13" fill="black"/>
                <rect x="70" y="5" width="25" height="25" fill="black" rx="2"/>
                <rect x="73" y="8" width="19" height="19" fill="white" rx="1"/>
                <rect x="76" y="11" width="13" height="13" fill="black"/>
                <rect x="5" y="70" width="25" height="25" fill="black" rx="2"/>
                <rect x="8" y="73" width="19" height="19" fill="white" rx="1"/>
                <rect x="11" y="76" width="13" height="13" fill="black"/>
                {/* Data dots */}
                <rect x="50" y="50" width="6" height="6" fill="black"/>
                <rect x="58" y="50" width="6" height="6" fill="black"/>
                <rect x="66" y="50" width="6" height="6" fill="black"/>
                <rect x="50" y="58" width="6" height="6" fill="black"/>
                <rect x="42" y="50" width="6" height="6" fill="black"/>
                <rect x="42" y="58" width="6" height="6" fill="black"/>
                <rect x="58" y="58" width="6" height="6" fill="black"/>
                <rect x="50" y="66" width="6" height="6" fill="black"/>
                <rect x="66" y="58" width="6" height="6" fill="black"/>
                <rect x="34" y="50" width="6" height="6" fill="black"/>
                <rect x="34" y="58" width="6" height="6" fill="black"/>
                <rect x="42" y="42" width="6" height="6" fill="black"/>
                <rect x="50" y="42" width="6" height="6" fill="black"/>
                <rect x="58" y="42" width="6" height="6" fill="black"/>
                <rect x="42" y="66" width="6" height="6" fill="black"/>
                <rect x="58" y="66" width="6" height="6" fill="black"/>
                <rect x="66" y="42" width="6" height="6" fill="black"/>
                <rect x="66" y="66" width="6" height="6" fill="black"/>
                <rect x="34" y="42" width="6" height="6" fill="black"/>
                <rect x="34" y="34" width="6" height="6" fill="black"/>
                <rect x="50" y="34" width="6" height="6" fill="black"/>
                <circle cx="50" cy="55" r="4" fill="white"/>
              </svg>
              <span className="qr-label">扫码下载</span>
            </div>
          </div>
        </div>

        {/* iOS */}
        <div className="download-card ios-coming">
          <div className="download-card-icon">🍎</div>
          <h3>iOS</h3>
          <p className="download-card-desc">iPhone / iPad 版本即将上线</p>
          <div className="coming-soon-badge">Coming Soon</div>
        </div>
      </div>

      {/* Feature Screenshots */}
      <div className="download-screenshots">
        <h2 className="screenshots-title">📱 功能预览</h2>
        <div className="screenshot-grid">
          {SCREENSHOTS.map((s, i) => (
            <div key={i} className="screenshot-card">
              <div className="screenshot-frame">
                <img src={s.src} alt={s.label} />
              </div>
              <span className="screenshot-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
