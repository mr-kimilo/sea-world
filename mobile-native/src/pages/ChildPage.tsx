import { useState, useCallback, useRef } from "react";
import { Button, Field, Slider, Toast } from "vant";
import {
  calculate,
  getItemsByAgeBand,
  ageToBand,
  speakText,
  AGE_BANDS,
  CATEGORY_LABELS,
  type CalcResult,
  type Category,
} from "../utils/childCalculator";

export default function ChildPage() {
  const [amount, setAmount] = useState(100);
  const [age, setAge] = useState(8);
  const [gender, setGender] = useState<"boy" | "girl">("boy");
  const [results, setResults] = useState<CalcResult[]>([]);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleCalc = useCallback(() => {
    if (locked) return;
    const band = ageToBand(age);
    const items = getItemsByAgeBand(band);
    const r = calculate(amount, items);
    setResults(r);

    // 3 秒锁定
    setLocked(true);
    timerRef.current = setTimeout(() => setLocked(false), 3000);
  }, [amount, age, locked]);

  const handleSpeak = useCallback(
    (r: CalcResult) => {
      if (!("speechSynthesis" in window)) {
        Toast("浏览器不支持语音");
        return;
      }
      const text = speakText(r.item, r.count, "zh");
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "zh-CN";
      u.rate = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    },
    []
  );

  // 按类别分组
  const grouped: Record<Category, CalcResult[]> = {
    drink: [],
    food: [],
    fruit: [],
    toy: [],
    clothes: [],
    stationery: [],
  };
  for (const r of results) {
    grouped[r.item.category].push(r);
  }

  const band = ageToBand(age);

  return (
    <div className="page">
      <h2>🧒 价值观纠正器</h2>
      <p className="subtitle">
        {amount} 块能买多少东西？
      </p>

      {/* 输入区 */}
      <div className="calc-form">
        <div className="calc-row">
          <label>💰 金额</label>
          <Field
            type="number"
            value={String(amount)}
            onChange={(v) => setAmount(Number(v) || 0)}
          />
        </div>

        <div className="calc-row">
          <label>🎂 年龄：{age} 岁</label>
          <Slider
            min={1}
            max={15}
            value={age}
            onChange={(v) => setAge(v as number)}
            barHeight={4}
            activeColor="#f59e0b"
          />
          <span className="age-band">{AGE_BANDS.find((b) => b.id === band)?.label}</span>
        </div>

        <div className="calc-row gender-row">
          <label>性别</label>
          <div className="gender-toggle">
            <button
              className={gender === "boy" ? "active" : ""}
              onClick={() => setGender("boy")}
            >
              👦 男孩
            </button>
            <button
              className={gender === "girl" ? "active" : ""}
              onClick={() => setGender("girl")}
            >
              👧 女孩
            </button>
          </div>
        </div>

        <Button
          type="primary"
          round
          block
          loading={locked}
          loadingText="计算中…"
          onClick={handleCalc}
        >
          {locked ? "请稍等 3 秒" : "算一算"}
        </Button>
      </div>

      {/* 结果 */}
      {results.length > 0 && (
        <div className="calc-results">
          {(["food", "drink", "fruit", "stationery", "toy", "clothes"] as Category[]).map(
            (cat) => {
              const items = grouped[cat];
              if (items.length === 0) return null;
              return (
                <div key={cat} className="calc-cat">
                  <h4>{CATEGORY_LABELS[cat]}</h4>
                  {items.map((r) => (
                    <div key={r.item.id} className="calc-item" onClick={() => handleSpeak(r)}>
                      <span className="calc-icon">{r.item.icon}</span>
                      <span className="calc-name">{r.item.nameZh}</span>
                      <span className="calc-price">
                        {r.item.price} 元/{r.item.unitZh}
                      </span>
                      <span className="calc-count">
                        {r.count} {r.item.unitZh}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
