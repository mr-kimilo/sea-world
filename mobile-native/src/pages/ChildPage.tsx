import { useState, useCallback, useRef } from "react";
import { calculate, getItemsByAgeBand, ageToBand, speakText, AGE_BANDS, CATEGORY_LABELS, type CalcResult, type Category } from "../utils/childCalculator";
import { t } from "../i18n";

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
    setResults(calculate(amount, items));
    setLocked(true);
    timerRef.current = setTimeout(() => setLocked(false), 3000);
  }, [amount, age, locked]);

  const speak = (r: CalcResult) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(speakText(r.item, r.count, "zh"));
    u.lang = "zh-CN"; u.rate = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const grouped: Record<Category, CalcResult[]> = { drink: [], food: [], fruit: [], toy: [], clothes: [], stationery: [] };
  for (const r of results) grouped[r.item.category].push(r);

  const band = ageToBand(age);
  const cats = ["drink", "food", "fruit", "stationery", "toy", "clothes"] as Category[];

  return (
    <div>
      <h1 className="page-title">{t("calc.title")}</h1>
      <p style={{color:"var(--muted)",fontSize:14,marginBottom:16}}>{amount} {t("calc.prompt")}</p>

      <div className="calc-form">
        <div className="calc-row">
          <label>{t("calc.amount")}</label>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} />
        </div>
        <div className="calc-row">
          <label>{t("calc.age")}: {age} 岁</label>
          <input type="range" className="calc-slider" min={1} max={15} value={age} onChange={e => setAge(Number(e.target.value))} style={{width:"100%"}} />
          <span className="age-tag">{AGE_BANDS.find(b => b.id === band)?.label}</span>
        </div>
        <div className="calc-row">
          <label>{t("calc.gender")}</label>
          <div className="gender-row">
            <button className={"gender-btn" + (gender==="boy" ? " on" : "")} onClick={()=>setGender("boy")}>{t("calc.boy")}</button>
            <button className={"gender-btn" + (gender==="girl" ? " on" : "")} onClick={()=>setGender("girl")}>{t("calc.girl")}</button>
          </div>
        </div>
        <button className="calc-submit" disabled={locked} onClick={handleCalc}>
          {locked ? "请稍等..." : "算一算"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="calc-results">
          {cats.map(cat => {
            const items = grouped[cat];
            if (!items.length) return null;
            return (
              <div key={cat}>
                <div className="calc-cat-title">{CATEGORY_LABELS[cat]}</div>
                {items.map(r => (
                  <div key={r.item.id} className="calc-item" onClick={() => speak(r)}>
                    <span className="calc-icon">{r.item.icon}</span>
                    <span className="calc-name">{r.item.nameZh}</span>
                    <span className="calc-price">{r.item.price}元/{r.item.unitZh}</span>
                    <span className="calc-qty">{r.count} {r.item.unitZh}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
