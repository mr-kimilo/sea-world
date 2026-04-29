import { useTranslation } from 'react-i18next';
import { useFamilyStore } from '../store/familyStore';
import './PokerChildSelector.mobile.css';

export default function PokerChildSelector() {
  const { t } = useTranslation(['family']);
  const { children, selectedChild, setSelectedChild } = useFamilyStore();

  return (
    <div className="poker-child-root" aria-label={t('family:childrenList')}>
      <div className="poker-child-row" role="list">
        {children.map((c) => {
          const name = (c.nickname || c.name || '').trim();
          const face = name ? name.slice(0, 1) : '👶';
          const isSelected = selectedChild?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="listitem"
              className={`poker-child-card${isSelected ? ' is-selected' : ''}`}
              onClick={() => setSelectedChild(c)}
              aria-pressed={isSelected}
              aria-label={name}
            >
              <div className="poker-child-face" aria-hidden="true">
                {face}
              </div>
              <div className="poker-child-meta">
                <div className="poker-child-name">{name}</div>
                <div className="poker-child-scores">
                  <span className="poker-score-pill">⭐ {c.totalScore}</span>
                  <span className="poker-score-pill poker-score-pill--available">💎 {c.availableScore}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

