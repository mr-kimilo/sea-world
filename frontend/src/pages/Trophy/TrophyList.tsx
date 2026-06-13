import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFamilyStore } from '../../store/familyStore';
import { trophyApi, type TrophyResponse } from '../../api/trophy';
import TrophyCard from './TrophyCard';
import './TrophyList.css';

export default function TrophyList() {
  const { t } = useTranslation(['task', 'common']);
  const { currentFamily, selectedChild } = useFamilyStore();

  const [trophies, setTrophies] = useState<TrophyResponse[]>([]);
  const [top3, setTop3] = useState<TrophyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'top3'>('all');

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    setError('');

    Promise.all([
      trophyApi.getTrophies(selectedChild.id),
      trophyApi.getTop3(selectedChild.id),
    ])
      .then(([allRes, topRes]) => {
        if (allRes.data.success) setTrophies(allRes.data.data ?? []);
        if (topRes.data.success) setTop3(topRes.data.data ?? []);
      })
      .catch(() => setError(t('task:errors.loadFailed')))
      .finally(() => setLoading(false));
  }, [selectedChild, t]);

  const displayList = filter === 'top3' ? top3 : trophies;

  return (
    <div className="trophy-page">
      <div className="trophy-header">
        <h2>🏆 {t('task:trophies')}</h2>
      </div>

      {/* Top 3 Highlight */}
      {top3.length > 0 && (
        <div className="top3-section">
          <h3>{t('task:top3')}</h3>
          <div className="top3-list">
            {top3.map((tr, idx) => (
              <TrophyCard key={tr.id} trophy={tr} rank={idx + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="trophy-tabs">
        <button
          className={`trophy-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('task:allTrophies')} ({trophies.length})
        </button>
        <button
          className={`trophy-tab ${filter === 'top3' ? 'active' : ''}`}
          onClick={() => setFilter('top3')}
        >
          {t('task:top3')} ({top3.length})
        </button>
      </div>

      {/* Trophy List */}
      {loading ? (
        <div className="trophy-loading">{t('common:loading')}</div>
      ) : error ? (
        <div className="trophy-error">{error}</div>
      ) : displayList.length === 0 ? (
        <div className="trophy-empty">{t('task:noTrophies')}</div>
      ) : (
        <div className="trophy-list">
          {displayList.map((tr) => (
            <TrophyCard key={tr.id} trophy={tr} />
          ))}
        </div>
      )}
    </div>
  );
}
