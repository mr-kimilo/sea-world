import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { scoreApi, type ScoreResponse } from '../api/score';
import { customCategoryApi, type CustomCategoryResponse } from '../api/customCategory';
import { useFamilyStore } from '../store/familyStore';
import type { ScoreCategory } from '../types';
import './ScoreHistory.css';
import './ScoreHistory.mobile.css';

interface ScoreHistoryProps {
  refreshTrigger?: number;
}

export default function ScoreHistory({ refreshTrigger }: ScoreHistoryProps) {
  const { t } = useTranslation(['score', 'common']);
  const { currentFamily, selectedChild } = useFamilyStore();

  const [records, setRecords] = useState<ScoreResponse[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState<ScoreCategory | 'all' | string>('all');
  const [period, setPeriod] = useState('month');

  const loadingRef = useRef(false);

  const loadHistory = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (!currentFamily || !selectedChild || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const params: any = {
        page: pageNum,
        size: 10,
      };

      if (category !== 'all') {
        params.category = category;
      }

      if (period !== 'all') {
        params.period = period;
      }

      const res = await scoreApi.getHistory(currentFamily.id, selectedChild.id, params);

      if (res.data.success && res.data.data) {
        const pageData = res.data.data;
        
        if (reset) {
          setRecords(pageData.content);
        } else {
          setRecords((prev) => [...prev, ...pageData.content]);
        }

        setHasMore(!pageData.last);
        setPage(pageNum);
      } else {
        setError(res.data.message || t('score:errors.loadFailed'));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('score:errors.loadFailed'));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [currentFamily, selectedChild, category, period, t]);

  useEffect(() => {
    const loadCustom = async () => {
      try {
        const res = await customCategoryApi.getCategories();
        if (res.data.success && res.data.data) {
          setCustomCategories(res.data.data);
        }
      } catch {
        setCustomCategories([]);
      }
    };
    if (currentFamily) loadCustom();
  }, [currentFamily?.id]);

  useEffect(() => {
    setRecords([]);
    setPage(0);
    setHasMore(true);
    loadHistory(0, true);
  }, [selectedChild, category, period, refreshTrigger]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadHistory(page + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!selectedChild) {
    return (
      <div className="score-history-disabled">
        {t('family:selectChild')}
      </div>
    );
  }

  return (
    <div className="score-history">
      <h2 className="score-history-title">{t('score:history')}</h2>

      <div className="score-filters">
        <div className="filter-group">
          <label>{t('score:form.category')}</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">{t('score:filters.all')}</option>
            <option value="intelligence">{t('score:categories.intelligence')}</option>
            <option value="physical">{t('score:categories.physical')}</option>
            <option value="moral">{t('score:categories.moral')}</option>
            <option value="hygiene">{t('score:categories.hygiene')}</option>
            <option value="handcraft">{t('score:categories.handcraft')}</option>
            {customCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>{t('score:filters.period')}</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="all">{t('score:filters.all')}</option>
            <option value="today">{t('score:filters.today')}</option>
            <option value="week">{t('score:filters.week')}</option>
            <option value="month">{t('score:filters.month')}</option>
            <option value="year">{t('score:filters.year')}</option>
          </select>
        </div>
      </div>

      {error && <div className="score-history-error">{error}</div>}

      {records.length === 0 && !loading && (
        <div className="score-history-empty">{t('score:noRecords')}</div>
      )}

      <div className="score-records">
        {records.map((record) => (
          <div key={record.id} className="score-record-card">
            <div className="record-header">
              <span className="record-category">
                {record.customCategoryName
                  ? `${record.customCategoryIcon ?? ''} ${record.customCategoryName}`.trim()
                  : t(`score:categories.${record.category}`)}
              </span>
              <span className={`record-score ${record.score > 0 ? 'positive' : 'negative'}`}>
                {record.score > 0 ? '+' : ''}{record.score}
              </span>
            </div>
            <div className="record-reason">{record.reason}</div>
            <div className="record-date">{formatDate(record.createdAt)}</div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="score-history-loading">{t('common:loading')}</div>
      )}

      {!loading && hasMore && records.length > 0 && (
        <button className="load-more-button" onClick={handleLoadMore}>
          {t('score:loadMore')}
        </button>
      )}

      {!loading && !hasMore && records.length > 0 && (
        <div className="no-more-hint">{t('score:noMore')}</div>
      )}
    </div>
  );
}
