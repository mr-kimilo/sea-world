import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { familyApi, type ChildResponse } from '../api/family';
import { useFamilyStore } from '../store/familyStore';
import './ChildSlider.mobile.css';

type ChildSliderVariant = 'stacked-overlap' | 'snap-row';

interface ChildSliderProps {
  variant?: ChildSliderVariant;
}

export default function ChildSlider({ variant = 'stacked-overlap' }: ChildSliderProps) {
  const { t } = useTranslation(['family']);
  const { currentFamily, children, selectedChild, setChildren, setSelectedChild } = useFamilyStore();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndexFallback, setActiveIndexFallback] = useState(0);
  const [dragX, setDragX] = useState(0);
  const dragStartXRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = useMemo(
    () =>
      children.map((c) => ({
        id: c.id,
        name: (c.nickname || c.name || '').trim(),
        face: ((c.nickname || c.name || '').trim() || '👶').slice(0, 1),
        totalScore: c.totalScore,
        availableScore: c.availableScore,
      })),
    [children],
  );

  const loadChildren = useCallback(async () => {
    if (!currentFamily) return;
    setLoading(true);
    setError('');
    try {
      const res = await familyApi.getChildren(currentFamily.id);
      if (res.data.success && res.data.data) {
        const list = res.data.data as ChildResponse[];
        setChildren(list);
        if (!selectedChild && list.length > 0) {
          setSelectedChild(list[0]);
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
  }, [currentFamily, selectedChild, setChildren, setSelectedChild, t]);

  useEffect(() => {
    if (!currentFamily) return;
    loadChildren();
  }, [currentFamily, loadChildren]);

  const activeIndex = useMemo(() => {
    if (!selectedChild) return activeIndexFallback;
    const idx = children.findIndex((c) => c.id === selectedChild.id);
    return idx >= 0 ? idx : activeIndexFallback;
  }, [activeIndexFallback, children, selectedChild]);

  // Keep the selected card aligned (snap) when selection changes externally.
  useEffect(() => {
    if (variant !== 'snap-row') return;
    const el = scrollerRef.current;
    if (!el || !selectedChild) return;
    const target = el.querySelector<HTMLButtonElement>(`[data-child-id="${selectedChild.id}"]`);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }, [selectedChild, variant]);

  const setActive = useCallback(
    (idx: number) => {
      if (items.length === 0) return;
      const next = ((idx % items.length) + items.length) % items.length;
      setActiveIndexFallback(next);
      const target = children[next];
      if (target) setSelectedChild(target);
    },
    [children, items.length, setSelectedChild],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (variant !== 'stacked-overlap') return;
    dragStartXRef.current = e.clientX;
    setDragX(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (variant !== 'stacked-overlap') return;
    if (dragStartXRef.current === null) return;
    const dx = e.clientX - dragStartXRef.current;
    // Clamp to avoid extreme transforms.
    setDragX(Math.max(-120, Math.min(120, dx)));
  };

  const endDrag = () => {
    if (dragStartXRef.current === null) return;
    const dx = dragX;
    dragStartXRef.current = null;
    setDragX(0);
    if (Math.abs(dx) < 40) return;
    // Left swipe → next card (reveal below). Right swipe → previous card (reveal above).
    if (dx < 0) setActive(activeIndex + 1);
    else setActive(activeIndex - 1);
  };

  const onPointerUp = () => {
    if (variant !== 'stacked-overlap') return;
    endDrag();
  };

  const onPointerCancel = () => {
    if (variant !== 'stacked-overlap') return;
    dragStartXRef.current = null;
    setDragX(0);
  };

  if (loading) return <div className="child-slider-loading">{t('common:loading')}</div>;
  if (error) return <div className="child-slider-error">{error}</div>;
  if (items.length === 0) return null;

  if (variant === 'stacked-overlap') {
    const order = [...items.slice(activeIndex), ...items.slice(0, activeIndex)];
    const peek = 0.2; // 20% visible

    return (
      <div className="child-slider-root child-slider-root--stacked" aria-label={t('family:childrenList')}>
        <div
          className="child-slider-stack"
          role="list"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          {order.map((c, pos) => {
            const isTop = pos === 0;
            const translateX = `calc(-50% + ${pos * peek} * var(--child-slider-card-w))`;
            const actualIndex = (activeIndex + pos) % items.length;
            return (
              <button
                key={c.id}
                type="button"
                role="listitem"
                data-child-id={c.id}
                className={`child-slider-card child-slider-card--stacked${isTop ? ' is-selected' : ''}`}
                style={{
                  transform: isTop ? `translateX(calc(-50% + ${dragX}px))` : `translateX(${translateX})`,
                  zIndex: order.length - pos,
                }}
                onClick={() => setActive(actualIndex)}
                aria-pressed={isTop}
                aria-label={c.name}
              >
                <div className="child-slider-face" aria-hidden="true">
                  {c.face}
                </div>
                <div className="child-slider-meta">
                  <div className="child-slider-name">{c.name}</div>
                  <div className="child-slider-scores">
                    <span className="child-slider-pill">⭐ {c.totalScore}</span>
                    <span className="child-slider-pill child-slider-pill--available">💎 {c.availableScore}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="child-slider-root child-slider-root--snap" aria-label={t('family:childrenList')}>
      <div ref={scrollerRef} className="child-slider-row" role="list">
        {items.map((c) => {
          const isSelected = selectedChild?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="listitem"
              data-child-id={c.id}
              className={`child-slider-card${isSelected ? ' is-selected' : ''}`}
              onClick={() => {
                const target = children.find((x) => x.id === c.id);
                if (target) setSelectedChild(target);
              }}
              aria-pressed={isSelected}
              aria-label={c.name}
            >
              <div className="child-slider-face" aria-hidden="true">
                {c.face}
              </div>
              <div className="child-slider-meta">
                <div className="child-slider-name">{c.name}</div>
                <div className="child-slider-scores">
                  <span className="child-slider-pill">⭐ {c.totalScore}</span>
                  <span className="child-slider-pill child-slider-pill--available">💎 {c.availableScore}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

