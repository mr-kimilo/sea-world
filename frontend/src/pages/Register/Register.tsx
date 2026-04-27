import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/auth';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import OceanBackground from '../../components/OceanBackground';
import '../Login/Login.css';
import '../Login/Login.mobile.css';

export default function Register() {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError(t('auth:errors.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.register({ email: form.email, password: form.password });
      if (res.data.success) {
        setSuccess(res.data.message || t('auth:register.successMessage'));
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(res.data.message || t('auth:errors.registerFailed'));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth:errors.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <OceanBackground />
      <div className="auth-lang-btn">
        <LanguageSwitcher />
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <h1>🐠 {t('common:appName')}</h1>
          <p>{t('auth:createAccount')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="email">{t('auth:register.emailLabel')}</label>
            <input
              id="email"
              type="email"
              placeholder={t('auth:register.emailPlaceholder')}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth:register.passwordLabel')}</label>
            <input
              id="password"
              type="password"
              placeholder={t('auth:register.passwordPlaceholder')}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
            <span className="password-hint">{t('auth:register.passwordHint')}</span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth:register.confirmPasswordLabel')}</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder={t('auth:register.confirmPasswordPlaceholder')}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? t('auth:register.loading') : t('auth:register.submit')}
          </button>
        </form>

        <div className="auth-footer">
          <span>{t('auth:register.hasAccount')}</span>
          <Link to="/login">{t('auth:register.loginNow')}</Link>
        </div>
      </div>
    </div>
  );
}
