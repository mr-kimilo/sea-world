import { useEffect, useState } from "react";
import { Button, Dialog, Field, Popup, Toast } from "vant";
import { scoreApi } from "../api";

type ScoreRecord = {
  id: string;
  category: string;
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
};

const COLORS: Record<string, string> = {
  STUDY: "#3b82f6", CHORE: "#10b981", BEHAVIOR: "#f59e0b", CUSTOM: "#8b5cf6",
};

export default function PointsPage() {
  const [records, setRecords] = useState<ScoreRecord[]>([]);
  const [balance, setBalance] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState("5");
  const [category, setCategory] = useState("CHORE");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const familyId = "demo-family";
  const childId = "demo-child";

  const loadScores = async () => {
    try {
      const res = await scoreApi.list(familyId, childId);
      const data = res.data;
      if (data?.content) {
        setRecords(data.content);
        setBalance(data.content[0]?.balanceAfter ?? 0);
      }
    } catch { setRecords([]); }
  };

  useEffect(() => { loadScores(); }, []);

  const handleAdd = async () => {
    setLoading(true);
    try {
      const amt = Number(amount);
      await scoreApi.add(familyId, childId, category, amt, desc || `${category} +${amt}`);
      Toast.success(`+${amt} 分`);
      setShowAdd(false);
      loadScores();
    } catch { Toast.fail("操作失败"); }
    finally { setLoading(false); }
  };

  return (
    <div className="page points-page">
      <div className="balance-card">
        <p className="balance-label">当前积分</p>
        <h2 className="balance-number">{balance}</h2>
      </div>

      <div className="action-row">
        <Button type="primary" round onClick={() => setShowAdd(true)}>加分</Button>
      </div>

      <h3>最近记录</h3>
      {records.length === 0 && <p className="empty">暂无积分记录，点"加分"开始</p>}
      {records.slice(0, 10).map((r) => (
        <div key={r.id} className="record-row">
          <span className="record-dot" style={{ background: COLORS[r.category] || "#ccc" }} />
          <span className="record-desc">{r.description}</span>
          <span className="record-amount" style={{ color: r.amount > 0 ? "#10b981" : "#ef4444" }}>
            {r.amount > 0 ? "+" : ""}{r.amount}
          </span>
        </div>
      ))}

      <Popup visible={showAdd} position="bottom" round onClose={() => setShowAdd(false)}>
        <div className="popup-form">
          <h3>添加积分</h3>
          <Field label="数量" value={amount} type="number" onInput={(e) => setAmount((e.target as HTMLInputElement).value)} />
          <Field label="说明" placeholder="做了什么" value={desc} onInput={(e) => setDesc((e.target as HTMLInputElement).value)} />
          <Button type="primary" block round loading={loading} onClick={handleAdd} style={{ marginTop: 12 }}>确认</Button>
        </div>
      </Popup>
    </div>
  );
}
