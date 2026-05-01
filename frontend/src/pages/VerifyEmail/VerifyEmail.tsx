import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { authApi } from '../../api/auth';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState(t('verify.verifyingMessage'));

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage(t('verify.invalidToken'));
      return;
    }

    authApi.verifyEmail(token)
      .then((response) => {
        setStatus('success');
        setMessage(response.data.message || t('verify.successMessage'));
      })
      .catch((error: unknown) => {
        setStatus('error');
        const msg = axios.isAxiosError(error)
          ? error.response?.data?.message
          : undefined;
        setMessage(typeof msg === 'string' ? msg : t('verify.errorMessage'));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <div className={`verify-icon ${status}`}>
          {status === 'verifying' && (
            <div className="spinner"></div>
          )}
          {status === 'success' && '✓'}
          {status === 'error' && '✕'}
        </div>
        
        <h2 className="verify-title">
          {status === 'verifying' && t('verify.verifying')}
          {status === 'success' && t('verify.success')}
          {status === 'error' && t('verify.error')}
        </h2>
        
        <p className="verify-message">{message}</p>
        
        {status !== 'verifying' && (
          <button 
            className="verify-btn" 
            onClick={handleGoToLogin}
          >
            {status === 'success' ? t('verify.goToLogin') : t('verify.backToLogin')}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
