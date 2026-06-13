import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { familyApi, type FamilyResponse } from '../../api/family';
import './JoinFamily.css';

interface Props {
  onJoined?: () => void;
  onClose?: () => void;
}

export default function JoinFamily({ onJoined, onClose }: Props) {
  const { t } = useTranslation(['family', 'common']);

  const [shareCode, setShareCode] = useState('');
  const [searchedFamily, setSearchedFamily] = useState<FamilyResponse | null>(null);
  const [step, setStep] = useState<'search' | 'confirm'>('search');
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async () => {
    if (!shareCode.trim()) return;
    setSearching(true);
    setError('');
    setSearchedFamily(null);
    try {
      const res = await familyApi.searchByShareCode(shareCode.trim());
      if (res.data.success && res.data.data) {
        setSearchedFamily(res.data.data);
        setStep('confirm');
      } else {
        setError(t('family:errors.invalidCode'));
      }
    } catch {
      setError(t('family:errors.invalidCode'));
    } finally {
      setSearching(false);
    }
  };

  const handleJoin = async () => {
    if (!shareCode.trim()) return;
    setJoining(true);
    setError('');
    try {
      await familyApi.requestJoin(shareCode.trim());
      setSuccess(t('family:joinRequestSent'));
      onJoined?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || t('family:errors.joinFailed'));
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="join-family-page">
      {onClose && (
        <div className="join-family-header">
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
      )}
      <h2>{t('family:joinFamily')}</h2>

      {/* Step 1: Search by Share Code */}
      {step === 'search' && (
        <div className="join-search-section">
          <p className="join-hint">{t('family:joinHint')}</p>
          <div className="join-search-input">
            <input
              type="text"
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value.toUpperCase())}
              placeholder={t('family:shareCodePlaceholder')}
              maxLength={20}
              autoFocus
            />
            <button className="btn-primary" onClick={handleSearch} disabled={searching || !shareCode.trim()}>
              {searching ? t('common:searching') : t('common:search')}
            </button>
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>
      )}

      {/* Step 2: Confirm Join */}
      {step === 'confirm' && searchedFamily && (
        <div className="join-confirm-section">
          <div className="found-family-card">
            <span className="found-family-icon">🏠</span>
            <div className="found-family-info">
              <span className="found-family-name">{searchedFamily.name}</span>
              <span className="found-family-code">{t('family:shareCode')}: {searchedFamily.shareCode}</span>
            </div>
          </div>

          <div className="join-confirm-actions">
            <button className="btn-secondary" onClick={() => setStep('search')}>
              {t('common:back')}
            </button>
            <button className="btn-primary" onClick={handleJoin} disabled={joining}>
              {joining ? t('common:joining') : t('family:requestJoin')}
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
        </div>
      )}
    </div>
  );
}
