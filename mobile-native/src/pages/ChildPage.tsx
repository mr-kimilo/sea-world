import { useState, useCallback, useRef } from "react";
import { calculate, getItemsByAgeBand, ageToBand, speakText, AGE_BANDS, CATEGORY_LABELS, type CalcResult, type Category } from "../utils/childCalculator";
import { t, getLang } from "../i18n";

/** Get display name based on current language */
function itemName(item: CalcResult["item"]) {
  return getLang() === "zh" ? item.nameZh : item.nameEn;
}
function itemUnit(item: CalcResult["item"]) {
  return getLang() === "zh" ? item.unitZh : item.unitEn;
}
function categoryLabel(cat: Category) {
  return getLang() === "zh" ? CATEGORY_LABELS[cat] : (CATEGORY_LABELS_EN as Record<Category, string>)[cat] || CATEGORY_LABELS[cat];
}
function ageBandLabel(bandId: string) {
  const b = AGE_BANDS.find(b => b.id === bandId);
  if (!b) return "";
  return getLang() === "zh" ? b.label : b.labelEn;
}

// English category labels
const CATEGORY_LABELS_EN: Record<Category, string> = {
  drink: "🥤 Drinks",
  food: "🍔 Food",
  fruit: "🍎 Fruit",
  toy: "🎮 Toys",
  clothes: "👕 Clothes",
  stationery: "✏️ Stationery",
};

export default function ChildPage() {
  const [amount, setAmount] = useState(100);
  const [age, setAge] = useState(8);
  const [gender, setGender] = useState<"boy" | "girl">("boy");
  const [results, setResults] = useState<CalcResult[]>([]);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const u = new SpeechSynthesisUtterance(speakText(r.item, r.count, getLang()));
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
          <label>{t("calc.age")}: {age} {t("calc.yearOld")}</label>
          <input type="range" className="calc-slider" min={1} max={15} value={age} onChange={e => setAge(Number(e.target.value))} style={{width:"100%"}} />
          <span className="age-tag">{ageBandLabel(band)}</span>
        </div>
        <div className="calc-row">
          <label>{t("calc.gender")}</label>
          <div className="gender-row">
            <button className={"gender-btn" + (gender==="boy" ? " on" : "")} onClick={()=>setGender("boy")}>{t("calc.boy")}</button>
            <button className={"gender-btn" + (gender==="girl" ? " on" : "")} onClick={()=>setGender("girl")}>{t("calc.girl")}</button>
          </div>
        </div>
        <button className="calc-submit" disabled={locked} onClick={handleCalc}>
          {locked ? t("calc.waiting") : t("calc.calc")}
        </button>
      </div>

      {results.length > 0 && (
        <div className="calc-results">
          {cats.map(cat => {
            const items = grouped[cat];
            if (!items.length) return null;
            return (
              <div key={cat}>
                <div className="calc-cat-title">{categoryLabel(cat)}</div>
                {items.map(r => (
                  <div key={r.item.id} className="calc-item" onClick={() => speak(r)}>
                    <span className="calc-icon">{r.item.icon}</span>
                    <span className="calc-name">{itemName(r.item)}</span>
                    <span className="calc-price">{r.item.price}{t("calc.currency")}/{itemUnit(r.item)}</span>
                    <span className="calc-qty">{r.count} {itemUnit(r.item)}</span>
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
