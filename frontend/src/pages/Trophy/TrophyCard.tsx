import type { TrophyResponse } from '../../api/trophy';
import './TrophyCard.css';

interface Props {
  trophy: TrophyResponse;
  rank?: number;
}

export default function TrophyCard({ trophy, rank }: Props) {
  return (
    <div className={`trophy-card ${rank && rank <= 3 ? `trophy-rank-${rank}` : ''}`}>
      {rank && rank <= 3 && (
        <div className="trophy-rank-badge">
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
        </div>
      )}
      <span className="trophy-card-icon">{trophy.icon || '🏆'}</span>
      <div className="trophy-card-info">
        <span className="trophy-card-name">{trophy.name}</span>
        <span className="trophy-card-points">+{trophy.points} ⭐</span>
      </div>
      <span className="trophy-card-date">
        {new Date(trophy.earnedAt).toLocaleDateString()}
      </span>
    </div>
  );
}
