import { useEffect, useState, useCallback } from "react";
import { useFamilyStore } from "../../store";
import { familyApi, familyJoinApi, type FamilyInfo, type FamilyMemberInfo } from "../../api";
import { t } from "../../i18n";
import JoinFamilyPage from "./JoinFamilyPage";
import "./FamilyPage.css";

export default function FamilyPage() {
  const { families, selectedFamilyId, selectFamily, setFamilies } = useFamilyStore();
  const [members, setMembers] = useState<FamilyMemberInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FamilyMemberInfo[]>([]);
  const [showJoin, setShowJoin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fid = selectedFamilyId;
  const currentFamily = families.find((f) => f.id === fid) || families[0];

  const loadData = useCallback(async () => {
    if (!currentFamily?.id) return;
    try {
      const [membersRes, pendingRes] = await Promise.all([
        familyJoinApi.getMembers(currentFamily.id),
        familyJoinApi.getPendingRequests(currentFamily.id),
      ]);
      setMembers(membersRes.data ?? []);
      setPendingRequests(pendingRes.data ?? []);
    } catch {
      setError(t("family.loadFailed"));
    }
  }, [currentFamily?.id]);

  useEffect(() => {
    if (families.length === 0) {
      familyApi.mine().then((res) => {
        const fams = (res.data ?? []) as FamilyInfo[];
        setFamilies(fams);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (currentFamily?.id) loadData();
  }, [currentFamily?.id, loadData]);

  const handleCopyCode = () => {
    if (!currentFamily?.shareCode) return;
    navigator.clipboard.writeText(currentFamily.shareCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleApprove = async (userId: string) => {
    if (!currentFamily) return;
    try {
      await familyJoinApi.approveJoin(currentFamily.id, userId);
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || t("family.approveFailed"));
    }
  };

  const handleReject = async (userId: string) => {
    if (!currentFamily) return;
    try {
      await familyJoinApi.rejectJoin(currentFamily.id, userId);
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || t("family.rejectFailed"));
    }
  };

  const handleJoined = () => {
    setShowJoin(false);
    familyApi.mine().then((res) => {
      setFamilies((res.data ?? []) as FamilyInfo[]);
    }).catch(() => {});
  };

  if (!currentFamily) {
    return (
      <div className="home-v2">
        <nav className="home-nav-v2"><span className="home-nav-title">👨‍👩‍👧‍👦 {t("family.title")}</span></nav>
        <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
          <p>{t("family.noFamily")}</p>
          <button className="btn-primary" onClick={() => setShowJoin(true)}>{t("family.joinFamily")}</button>
          {showJoin && <JoinFamilyPage onJoined={handleJoined} onClose={() => setShowJoin(false)} />}
        </div>
        <div className="ocean-wave" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="home-v2">
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>

      <nav className="home-nav-v2">
        <span className="home-nav-title">👨‍👩‍👧‍👦 {t("family.title")}</span>
      </nav>

      {error && <div className="error-banner">{error}</div>}

      <div style={{ position: "relative", zIndex: 1, padding: "0 16px 80px" }}>
        {/* Family Info */}
        <div className="family-info-card">
          <h3>{currentFamily.name}</h3>
          <div className="share-code-row">
            <span className="share-code-label">{t("family.shareCode")}:</span>
            <code className="share-code">{currentFamily.shareCode || "-"}</code>
            {currentFamily.shareCode && (
              <button className="copy-btn" onClick={handleCopyCode}>
                {copied ? "✅" : "📋"}
              </button>
            )}
          </div>
        </div>

        {/* Join Family Button */}
        <button className="btn-secondary" style={{ width: "100%", marginBottom: 16 }}
          onClick={() => setShowJoin(!showJoin)}>
          {t("family.joinOtherFamily")}
        </button>
        {showJoin && <JoinFamilyPage onJoined={handleJoined} onClose={() => setShowJoin(false)} />}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="family-section">
            <h4>{t("family.pendingRequests")} ({pendingRequests.length})</h4>
            {pendingRequests.map((req) => (
              <div key={req.id} className="pending-card">
                <span>{req.userEmail}</span>
                <div className="pending-actions">
                  <button className="btn-approve" onClick={() => handleApprove(req.userId)}>✅ {t("family.approve")}</button>
                  <button className="btn-reject" onClick={() => handleReject(req.userId)}>❌ {t("family.reject")}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Members */}
        <div className="family-section">
          <h4>{t("family.members")} ({members.length})</h4>
          {members.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.3)" }}>{t("family.noMembers")}</div>
          ) : (
            members.map((m) => (
              <div key={m.id} className="member-card">
                <span>{m.role === "owner" ? "👑" : "👤"}</span>
                <div className="member-info">
                  <span className="member-email">{m.userEmail}</span>
                  <span className="member-role">{m.role === "owner" ? t("family.roleOwner") : t("family.roleMember")}</span>
                </div>
                <span className={`member-status status-${m.status.toLowerCase()}`}>
                  {m.status === "ACTIVE" ? t("family.statusActive") : t("family.statusPending")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
