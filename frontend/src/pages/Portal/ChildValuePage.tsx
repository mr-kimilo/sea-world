import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const CHILD_SERVICE_URL = import.meta.env.VITE_CHILD_SERVICE_URL || 'http://127.0.0.1:18760';

export default function ChildValuePage() {
  const { t } = useTranslation('child');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  return (
    <div className="child-value-page">
      {loading && (
        <div className="child-value-loading">
          <span className="loading-spinner">⏳</span>
          <span>{t('valueCorrector.loading')}</span>
        </div>
      )}
      {error && (
        <div className="child-value-error">
          <span style={{ fontSize: '3rem' }}>😵</span>
          <p>{t('valueCorrector.error')}</p>
        </div>
      )}
      <iframe
        src={CHILD_SERVICE_URL}
        className="child-value-iframe"
        onLoad={handleLoad}
        onError={handleError}
        title={t('valueCorrector.title')}
        allow="microphone"
        style={{ display: error ? 'none' : undefined }}
      />
    </div>
  );
}
