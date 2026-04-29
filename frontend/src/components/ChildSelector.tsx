import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { familyApi, type ChildResponse } from '../api/family';
import { useFamilyStore } from '../store/familyStore';
import { getAvatarById } from '../constants/avatars';
import './ChildSelector.css';
import './ChildSelector.mobile.css';

// A palette of distinct background gradients for child cards
const CHILD_PALETTES = [
  { bg: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', border: '#00acc1' },
  { bg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)', border: '#e91e63' },
  { bg: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', border: '#9c27b0' },
  { bg: 'linear-gradient(135deg, #fff8e1 0%, #ffe082 100%)', border: '#f9a825' },
  { bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', border: '#43a047' },
];

interface ChildSelectorProps {
  layout?: 'grid' | 'column' | 'carousel';
}

export default function ChildSelector({ layout = 'grid' }: ChildSelectorProps) {
  const { t } = useTranslation(['family', 'common']);
  const {
    currentFamily,
    children,
    selectedChild,
    setChildren,
    setSelectedChild,
  } = useFamilyStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentFamily) {
      loadChildren();
    }
  }, [currentFamily]);

  const loadChildren = async () => {
    if (!currentFamily) return;
    setLoading(true);
    setError('');
    try {
      const res = await familyApi.getChildren(currentFamily.id);
      if (res.data.success && res.data.data) {
        const childrenData = res.data.data;
        setChildren(childrenData);
        if (!selectedChild && childrenData.length > 0) {
          setSelectedChild(childrenData[0]);
        }
      } else {
        setError(res.data.message || t('family:errors.loadFailed'));
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const maybeData = err.response?.data;
        const message =
          typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
            ? String((maybeData as { message?: unknown }).message ?? '')
            : '';
        setError(message || t('family:errors.loadFailed'));
      } else {
        setError(t('family:errors.loadFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = (child: ChildResponse) => {
    setSelectedChild(child);
  };

  if (loading) {
    return <div className="child-selector-loading">{t('common:loading')}</div>;
  }

  if (error) {
    return <div className="child-selector-error">{error}</div>;
  }

  if (children.length === 0) {
    return (
      <div className="child-selector-empty">
        <p>{t('family:noChildren')}</p>
      </div>
    );
  }

  return (
    <div
      className={`child-selector ${
        layout === 'column'
          ? 'child-selector--column'
          : layout === 'carousel'
            ? 'child-selector--carousel'
            : ''
      }`}
    >
      <div className="child-selector-grid">
        {children.map((child: ChildResponse, idx: number) => {
          const palette = CHILD_PALETTES[idx % CHILD_PALETTES.length];
          const isSelected = selectedChild?.id === child.id;
          return (
            <div
              key={child.id}
              className={`child-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectChild(child)}
              style={{
                background: isSelected ? palette.bg : '#fff',
                borderColor: isSelected ? palette.border : '#e0e0e0',
              }}
            >
              <div
                className="child-avatar"
                style={{ backgroundColor: getAvatarById(child.avatarUrl).color }}
              >
                <span className="child-avatar-emoji">
                  {getAvatarById(child.avatarUrl).emoji}
                </span>
              </div>
              <div className="child-info">
                <div className="child-name">{child.nickname || child.name}</div>
                <div className="child-score">
                  <span className="score-label">{t('family:child.totalScore')}:</span>
                  <span className="score-value">{child.totalScore}</span>
                </div>
                <div className="child-score">
                  <span className="score-label">{t('family:child.availableScore')}:</span>
                  <span className="score-value available">{child.availableScore}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
