import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFamilyStore } from '../../store/familyStore';
import { familyApi } from '../../api/family';
import ManageMembers from './ManageMembers';
import JoinFamily from './JoinFamily';
import './FamilySettings.css';

export default function FamilySettings() {
  const { t } = useTranslation(['family', 'common']);
  const { currentFamily, families, setFamilies, setCurrentFamily } = useFamilyStore();

  const [showJoin, setShowJoin] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const loadFamily = useCallback(async () => {
    try {
      const res = await familyApi.getMyFamilies();
      if (res.data.success && res.data.data) {
        setFamilies(res.data.data);
        if (!currentFamily && res.data.data.length > 0) {
          setCurrentFamily(res.data.data[0]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadFamily();
  }, [showJoin]);

  const handleCopyCode = async () => {
    if (!currentFamily?.shareCode) return;
    try {
      await navigator.clipboard.writeText(currentFamily.shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = currentFamily.shareCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateName = async () => {
    if (!currentFamily || !newName.trim()) return;
    try {
      const res = await familyApi.updateFamily(currentFamily.id, { name: newName });
      if (res.data.success) {
        setCurrentFamily({ ...currentFamily, name: newName });
        setEditingName(false);
      }
    } catch {
      // ignore
    }
  };

  const handleFamilySwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const family = families.find((f) => f.id === e.target.value);
    if (family) setCurrentFamily(family);
  };

  if (!currentFamily) {
    return (
      <div className="family-settings-page">
        <h2>{t('family:title')}</h2>
        <div className="family-empty">{t('family:noFamily')}</div>
        <div className="family-actions">
          <button className="btn-primary" onClick={() => setShowJoin(true)}>
            {t('family:joinFamily')}
          </button>
        </div>
        {showJoin && <JoinFamily onClose={() => setShowJoin(false)} onJoined={() => setShowJoin(false)} />}
      </div>
    );
  }

  return (
    <div className="family-settings-page">
      <h2>{t('family:title')}</h2>

      {/* Family Selector */}
      {families.length > 1 && (
        <div className="family-selector">
          <label>{t('family:switchFamily')}</label>
          <select value={currentFamily.id} onChange={handleFamilySwitch}>
            {families.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Family Info Card */}
      <div className="family-info-card">
        <div className="family-info-header">
          {editingName ? (
            <div className="family-name-edit">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <button className="btn-primary btn-sm" onClick={handleUpdateName}>
                {t('common:save')}
              </button>
              <button className="btn-secondary btn-sm" onClick={() => setEditingName(false)}>
                {t('common:cancel')}
              </button>
            </div>
          ) : (
            <div className="family-name-display">
              <h3>{currentFamily.name}</h3>
              <button className="btn-text" onClick={() => { setNewName(currentFamily.name); setEditingName(true); }}>
                ✏️
              </button>
            </div>
          )}
        </div>

        {/* Share Code */}
        <div className="share-code-section">
          <label>{t('family:shareCode')}</label>
          <div className="share-code-display">
            <code className="share-code-value">{currentFamily.shareCode || '-'}</code>
            {currentFamily.shareCode && (
              <button className="btn-secondary btn-sm" onClick={handleCopyCode}>
                {copied ? '✅' : '📋'}
              </button>
            )}
          </div>
          {copied && <span className="copy-hint">{t('family:codeCopied')}</span>}
        </div>
      </div>

      {/* Join Family */}
      <div className="family-section">
        <button className="btn-secondary" onClick={() => setShowJoin(!showJoin)}>
          {showJoin ? t('common:cancel') : t('family:joinOtherFamily')}
        </button>
        {showJoin && <JoinFamily onJoined={() => setShowJoin(false)} />}
      </div>

      {/* Manage Members */}
      <div className="family-section">
        <ManageMembers familyId={currentFamily.id} />
      </div>
    </div>
  );
}
