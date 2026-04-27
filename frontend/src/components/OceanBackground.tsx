import './OceanBackground.css';

type OceanBackgroundProps = {
  /** When true, covers the viewport (authenticated app shell). When false, fills positioned parent (e.g. login card area). */
  fixed?: boolean;
};

export default function OceanBackground({ fixed = false }: OceanBackgroundProps) {
  return (
    <div className={`ocean-bg ${fixed ? 'ocean-bg--fixed' : ''}`} aria-hidden="true">
      <div className="seaweed seaweed-1" />
      <div className="seaweed seaweed-2" />
      <div className="seaweed seaweed-3" />
      <div className="fish fish-1">🐠</div>
      <div className="fish fish-2">🐟</div>
      <div className="fish fish-3">🐡</div>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={`bubble bubble-${(i % 4) + 1}`}
          style={{ left: `${6 + i * 8}%`, animationDelay: `${i * 0.7}s` }}
        />
      ))}
    </div>
  );
}
