import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import OceanBackground from '../../components/OceanBackground';
import './Login.css';
import './Login.mobile.css';

export default function OAuthCallback() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const code = searchParams.get('code');
    const provider = searchParams.get('provider') || 'qq';
    const state = searchParams.get('state');

    // Verify state to prevent CSRF (if we stored it)
    // const savedState = sessionStorage.getItem('oauth_state');
    // if (state && savedState && state !== savedState) {
    //   setError('状态校验失败，请重新尝试');
    //   setStatus('error');
    //   return;
    // }

    if (!code) {
      setError(t('oauthNoCode', '未收到授权码，请重新尝试'));
      setStatus('error');
      return;
    }

    const redirectUri = `${window.location.origin}/oauth/callback?provider=${provider}`;

    authApi
      .oauthLogin(provider, code, redirectUri)
      .then((res) => {
        if (res.data.success && res.data.data) {
          const { accessToken, refreshToken, user } = res.data.data;
          login(accessToken, refreshToken, user);
          setStatus('success');
          // Clean up state
          // sessionStorage.removeItem('oauth_state');
          setTimeout(() => navigate('/', { replace: true }), 1000);
        } else {
          setError(res.data.message || t('oauthLoginFailed', '登录失败'));
          setStatus('error');
        }
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message || err?.message || t('oauthLoginFailed', '登录失败');
        setError(message);
        setStatus('error');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="auth-container">
      <OceanBackground />
      <div className="auth-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        {status === 'processing' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
            <h2>{t('oauthProcessing', '正在验证授权...')}</h2>
            <p style={{ color: '#888', marginTop: 8 }}>{t('oauthPleaseWait', '请稍候')}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2>{t('oauthSuccess', '登录成功！')}</h2>
            <p style={{ color: '#888', marginTop: 8 }}>{t('oauthRedirecting', '正在跳转...')}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2>{t('oauthFailed', '授权失败')}</h2>
            <p className="auth-error" style={{ marginTop: 8 }}>
              {error}
            </p>
            <button
              className="auth-button"
              onClick={() => navigate('/login', { replace: true })}
              style={{ marginTop: 16 }}
            >
              {t('backToLogin', '返回登录')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
