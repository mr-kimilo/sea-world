import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCategories, fetchItems, calculateValue, type ValueItem, type ValueCalculateResult } from '../../api/value';

const CATEGORY_ICONS: Record<string, string> = {
  drink: '🥤',
  food: '🍜',
  fruit: '🍎',
  toy: '🧸',
  clothes: '👕',
  stationery: '✏️',
};

/** Speak text using Web Speech API (Chinese voice preferred) */
function speakText(text: string): void {
  if (!('speechSynthesis' in window)) return;
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  // Try to pick a Chinese voice
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find((v) => v.lang.startsWith('zh')) ?? voices.find((v) => v.lang.startsWith('zh-CN'));
  if (zhVoice) utterance.voice = zhVoice;
  window.speechSynthesis.speak(utterance);
}

export default function ChildValuePage() {
  const { t } = useTranslation('child');

  // Data
  const [categories, setCategories] = useState<string[]>([]);
  const [allItems, setAllItems] = useState<ValueItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Input
  const [amount, setAmount] = useState('');
  const [selectedItem, setSelectedItem] = useState<ValueItem | null>(null);

  // Result
  const [result, setResult] = useState<ValueCalculateResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  // TTS auto-speak tracking
  const prevResultRef = useRef<ValueCalculateResult | null>(null);

  // Speak handler (memoized)
  const handleSpeak = useCallback((text: string) => {
    speakText(text);
  }, []);

  // Init
  useEffect(() => {
    Promise.all([fetchCategories(), fetchItems()])
      .then(([cats, items]) => {
        setCategories(cats);
        setAllItems(items);
      })
      .catch(() => setError(t('valueCorrector.error')))
      .finally(() => setLoading(false));
  }, [t]);

  // Filter items by category
  const items = selectedCategory
    ? allItems.filter((i) => i.category === selectedCategory)
    : allItems;

  // Calculate
  const handleCalculate = async () => {
    if (!selectedItem || !amount) return;
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    setCalculating(true);
    setResult(null);
    setError('');
    try {
      const res = await calculateValue(num, selectedItem.id);
      setResult(res);
    } catch {
      setError(t('valueCorrector.calcError'));
    } finally {
      setCalculating(false);
    }
  };

  // Auto-speak when result changes
  useEffect(() => {
    if (!result || result === prevResultRef.current) return;
    prevResultRef.current = result;
    const text = result.voiceText || (result.tooExpensive
      ? t('valueCorrector.ttsFallbackTooExpensive', { name: result.name, price: result.price, amount: result.amount })
      : t('valueCorrector.ttsFallbackCanBuy', { amount: result.amount, count: result.count, unit: result.unit, name: result.name }));
    handleSpeak(text);
  }, [result, handleSpeak, t]);

  if (loading) {
    return (
      <div className="child-value-page">
        <div className="child-value-loading">
          <span style={{ fontSize: 32 }}>⏳</span>
          <span>{t('valueCorrector.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="child-value-page" style={{ overflow: 'auto' }}>
      <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header */}
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          💰 {t('valueCorrector.title')}
        </h1>
        <p style={{ color: '#888', marginBottom: 20, fontSize: 14 }}>
          {t('valueCorrector.subtitle')}
        </p>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <button
            className={`value-cat-btn ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            {t('valueCorrector.categoryAll')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`value-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_ICONS[cat] || '📦'} {t(`valueCorrector.category.${cat}`, cat)}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: 16, background: '#fff0f0', borderRadius: 12, color: '#e44', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Items grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {items.map((item) => (
            <button
              key={item.id}
              className={`value-item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
              onClick={() => { setSelectedItem(item); setResult(null); }}
            >
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</span>
              <span style={{ fontSize: 12, color: '#667eea', fontWeight: 700 }}>
                ¥{item.price}/{item.unit}
              </span>
            </button>
          ))}
        </div>

        {/* Input + Calculate */}
        {selectedItem && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, marginBottom: 8, color: '#666' }}>
              {t('valueCorrector.howMuchMoney')}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>💰</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('valueCorrector.amountPlaceholder')}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd',
                  fontSize: 16, outline: 'none',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              />
              <span style={{ fontSize: 14, color: '#888' }}>{t('valueCorrector.unitYuan')}</span>
              <button
                onClick={handleCalculate}
                disabled={calculating || !amount}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: calculating ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {calculating ? t('valueCorrector.calculating') : t('valueCorrector.calculate')}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            marginTop: 20, background: '#fff', borderRadius: 16, padding: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center',
            position: 'relative',
          }}>
            {/* Speak button */}
            <button
              onClick={() => handleSpeak(result.voiceText || (result.tooExpensive
                ? t('valueCorrector.ttsFallbackTooExpensive', { name: result.name, price: result.price, amount: result.amount })
                : t('valueCorrector.ttsFallbackCanBuy', { amount: result.amount, count: result.count, unit: result.unit, name: result.name })))}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(102,126,234,0.1)', border: 'none',
                borderRadius: 20, padding: '6px 14px', cursor: 'pointer',
                fontSize: 13, color: '#667eea', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
              title={t('valueCorrector.speakTitle')}
            >
              🔊 {t('valueCorrector.speakLabel')}
            </button>
            {result.tooExpensive ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 8 }}>😅</div>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {t('valueCorrector.cannotAfford')} {result.icon} {result.name}
                </p>
                <p style={{ color: '#888' }}>
                  {result.icon} {result.name} {t('valueCorrector.needMoney_one')} <strong>¥{result.price}</strong>
                  {t('valueCorrector.needMoney_two')} <strong>¥{result.amount}</strong>
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {result.voiceText}
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 4, fontSize: 14, color: '#888', flexWrap: 'wrap', marginTop: 8,
                }}>
                  {result.icon} <strong>{result.name}</strong> ¥{result.price}/{result.unit}
                  <span style={{ margin: '0 8px' }}>×</span>
                  {result.count} {result.unit}
                  {result.remainder > 0 && (
                    <span style={{ marginLeft: 8 }}>
                      {t('valueCorrector.remainder')} <strong style={{ color: '#22c55e' }}>¥{result.remainder}</strong>
                    </span>
                  )}
                </div>
                {result.useStack && (
                  <p style={{ marginTop: 12, fontSize: 13, color: '#eab308' }}>
                    💡 数量较多，建议用堆叠方式展示
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
