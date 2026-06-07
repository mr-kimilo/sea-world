import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import './DownloadApp.css';

const SCREENSHOTS = [
  { src: '/screenshots/record-home.png', label: '积分管理首页' },
  { src: '/screenshots/record-history.png', label: '积分历史' },
  { src: '/screenshots/point-store.png', label: '积分商城' },
  { src: '/screenshots/my-orders.png', label: '我的订单' },
];

export default function DownloadApp() {
  const { t } = useTranslation('child');
  const downloadUrl = `${window.location.origin}/apk/HyperOne-latest.apk`;

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
          <a href={downloadUrl} className="download-btn" download>
            📥 下载 APK
          </a>
          {/* Real QR Code */}
          <div className="download-qr">
            <div className="qr-placeholder">
              <QRCodeSVG value={downloadUrl} size={140} level="M" />
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
