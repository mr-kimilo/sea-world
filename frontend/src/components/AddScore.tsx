import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { scoreApi, type ScoreRequest } from '../api/score';
import { useFamilyStore } from '../store/familyStore';
import { useOfflineStore } from '../store/offlineStore';
import type { ScoreCategory } from '../types';
import { useDeviceType } from '../hooks/useDeviceType';
import { customCategoryApi, type CustomCategoryResponse } from '../api/customCategory';
import './AddScore.css';
import './AddScore.mobile.css';

const DEFAULT_SCORE = 2;
const MIN_SCORE = -10;
const MAX_SCORE = 10;

interface AddScoreProps {
  onScoreAdded?: () => void;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normalizeScore(next: number, prev: number) {
  const clamped = clamp(next, MIN_SCORE, MAX_SCORE);
  if (clamped === 0) {
    // 0 is not allowed; keep direction consistent with previous value
    return prev >= 0 ? 1 : -1;
  }
  return clamped;
}

function stepScoreValue(prev: number, delta: 1 | -1) {
  const next = normalizeScore(prev + delta, prev);
  // If stepping crosses 0, skip it
  if (prev === 1 && delta === -1) return -1;
  if (prev === -1 && delta === 1) return 1;
  return next;
}

function ScoreStepper({
  value,
  onChange,
  increaseLabel,
  decreaseLabel,
  disabled,
  allowManualInput,
}: {
  value: number;
  onChange: (next: number) => void;
  increaseLabel: string;
  decreaseLabel: string;
  disabled?: boolean;
  allowManualInput: boolean;
}) {
  return (
    <div className="score-stepper" aria-label={increaseLabel}>
      <button
        type="button"
        className="score-step-btn score-step-btn--dec"
        onClick={() => onChange(stepScoreValue(value, -1))}
        aria-label={decreaseLabel}
        disabled={disabled}
      >
        −
      </button>
      {allowManualInput ? (
        <input
          className="score-step-input"
          type="number"
          inputMode="numeric"
          min={MIN_SCORE}
          max={MAX_SCORE}
          step={1}
          value={value}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value, 10);
            if (!Number.isFinite(parsed)) return;
            onChange(normalizeScore(parsed, value));
          }}
          disabled={disabled}
          aria-label="score"
        />
      ) : (
        <div className="score-step-value" aria-hidden="true">
          {value > 0 ? `+${value}` : value}
        </div>
      )}
      <button
        type="button"
        className="score-step-btn score-step-btn--inc"
        onClick={() => onChange(stepScoreValue(value, 1))}
        aria-label={increaseLabel}
        disabled={disabled}
      >
        +
      </button>
    </div>
  );
}

export default function AddScore({ onScoreAdded }: AddScoreProps) {
  const { t } = useTranslation(['score', 'common']);
  const { isMobile } = useDeviceType();
  const { currentFamily, selectedChild, updateChildScore } = useFamilyStore();
  const { addPendingScore, isOnline } = useOfflineStore();

  const [form, setForm] = useState<ScoreRequest>({
    score: DEFAULT_SCORE,
    category: 'intelligence',
    customCategoryId: undefined,
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAllReasons, setShowAllReasons] = useState(false);
  const [customCategories, setCustomCategories] = useState<CustomCategoryResponse[]>([]);

  const categories: ScoreCategory[] = ['intelligence', 'physical', 'moral', 'hygiene', 'handcraft'];
  const quickReasons: string[] = t('score:quickReasons', { returnObjects: true }) as string[];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await customCategoryApi.getCategories();
        if (res.data.success && res.data.data) {
          setCustomCategories(res.data.data);
        }
      } catch {
        // Non-blocking: scoring still works with built-in categories
        setCustomCategories([]);
      }
    };
    // Only load when we have a family context
    if (currentFamily) load();
  }, [currentFamily?.id]);

  const setScore = (next: number) => {
    setForm((prev) => ({ ...prev, score: normalizeScore(next, prev.score) }));
  };

  const appendQuickReason = (reason: string) => {
    setForm((prev) => ({
      ...prev,
      reason: prev.reason ? `${prev.reason}，${reason}` : reason,
    }));
  };

  const visibleQuickReasons = useMemo(() => {
    if (!isMobile) return quickReasons;
    if (showAllReasons) return quickReasons;
    return quickReasons.slice(0, 6);
  }, [isMobile, quickReasons, showAllReasons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentFamily || !selectedChild) {
      setError(t('score:errors.addFailed'));
      return;
    }

    if (form.score < -10 || form.score > 10 || form.score === 0) {
      setError(t('score:errors.invalidScore'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!isOnline) {
        addPendingScore({
          familyId: currentFamily.id,
          childId: selectedChild.id,
          score: form.score,
          category: form.category,
          customCategoryId: form.customCategoryId,
          reason: form.reason,
          rawVoiceText: form.rawVoiceText,
        });
        const newTotal = selectedChild.totalScore + form.score;
        const newAvailable = selectedChild.availableScore + form.score;
        updateChildScore(selectedChild.id, newTotal, newAvailable);
        setSuccess(t('score:success.addedOffline'));
        setForm({ score: DEFAULT_SCORE, category: form.category, customCategoryId: form.customCategoryId, reason: '' });
        if (onScoreAdded) onScoreAdded();
        setTimeout(() => setSuccess(''), 3000);
        setLoading(false);
        return;
      }

      const res = await scoreApi.addScore(currentFamily.id, selectedChild.id, form);
      if (res.data.success) {
        setSuccess(t('score:success.added'));
        const newTotal = selectedChild.totalScore + form.score;
        const newAvailable = selectedChild.availableScore + form.score;
        updateChildScore(selectedChild.id, newTotal, newAvailable);
        setForm({ score: DEFAULT_SCORE, category: form.category, customCategoryId: form.customCategoryId, reason: '' });
        if (onScoreAdded) onScoreAdded();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.data.message || t('score:errors.addFailed'));
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || t('score:errors.addFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!selectedChild) {
    return (
      <div className="add-score-disabled">
        {t('family:selectChild')}
      </div>
    );
  }

  return (
    <div className="add-score">
      <div className="add-score-title">
        {t('score:addScore')}
        {!isOnline && <span className="offline-badge">{t('score:offlineBadge')}</span>}
      </div>

      <form onSubmit={handleSubmit} className="add-score-form">
        {error && <div className="add-score-error">{error}</div>}
        {success && <div className="add-score-success">{success}</div>}

        <div className="form-group">
          <label>{t('score:form.category')}</label>
          <div className="category-cards" role="tablist" aria-label={t('score:form.category')}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-card category-card--${cat} ${form.category === cat ? 'active' : ''}`}
                onClick={() => setForm({ ...form, category: cat, customCategoryId: undefined })}
                role="tab"
                aria-selected={form.category === cat}
              >
                <span className="category-emoji" aria-hidden="true">
                  {cat === 'intelligence'
                    ? '🧠'
                    : cat === 'physical'
                      ? '💪'
                      : cat === 'moral'
                        ? '❤️'
                        : cat === 'hygiene'
                          ? '🫧'
                          : '🛠️'}
                </span>
                <span className="category-text">{t(`score:categories.${cat}`)}</span>
              </button>
            ))}
            {customCategories.map((c) => {
              const isActive = form.category === 'custom' && form.customCategoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`category-card category-card--custom ${isActive ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, category: 'custom', customCategoryId: c.id })}
                  role="tab"
                  aria-selected={isActive}
                >
                  <span className="category-emoji" aria-hidden="true">
                    {c.icon}
                  </span>
                  <span className="category-text">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label>
            {t('score:form.score')}
            <span className={`score-display ${form.score > 0 ? 'positive' : form.score < 0 ? 'negative' : 'zero'}`}>
              {form.score > 0 ? `+${form.score}` : form.score}
            </span>
          </label>
          <ScoreStepper
            value={form.score}
            onChange={setScore}
            increaseLabel={t('score:increase')}
            decreaseLabel={t('score:decrease')}
            disabled={loading}
            allowManualInput={isMobile}
          />
        </div>

        <div className="form-group">
          <label>{t('score:form.reason')}</label>
          <div className="quick-reasons quick-reasons--grid">
            {visibleQuickReasons.map((r) => (
              <button
                key={r}
                type="button"
                className="quick-reason-tag"
                onClick={() => appendQuickReason(r)}
              >
                {r}
              </button>
            ))}
          </div>
          {isMobile && quickReasons.length > 6 ? (
            <button
              type="button"
              className="quick-reasons-toggle"
              onClick={() => setShowAllReasons((v) => !v)}
            >
              {showAllReasons ? t('common:less') : t('common:more')}
            </button>
          ) : null}
          <textarea
            id="reason"
            placeholder={t('score:form.reasonPlaceholder')}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={2}
            required
          />
        </div>

        <div className="add-score-submit-bar">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? t('common:loading') : t('score:form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
