import { useState } from "react";
import { familyJoinApi, type FamilyInfo } from "../../api";
import { t } from "../../i18n";
import "./JoinFamilyPage.css";

interface Props {
  onJoined?: () => void;
  onClose?: () => void;
}

export default function JoinFamilyPage({ onJoined, onClose }: Props) {
  const [shareCode, setShareCode] = useState("");
  const [searchedFamily, setSearchedFamily] = useState<FamilyInfo | null>(null);
  const [step, setStep] = useState<"search" | "confirm">("search");
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = async () => {
    if (!shareCode.trim()) return;
    setSearching(true);
    setError("");
    setSearchedFamily(null);
    try {
      const res = await familyJoinApi.searchByCode(shareCode.trim());
      if (res.data?.id) {
        setSearchedFamily(res.data);
        setStep("confirm");
      } else {
        setError(t("family.invalidCode"));
      }
    } catch {
      setError(t("family.invalidCode"));
    } finally {
      setSearching(false);
    }
  };

  const handleJoin = async () => {
    if (!shareCode.trim()) return;
    setJoining(true);
    setError("");
    try {
      await familyJoinApi.requestJoin(shareCode.trim());
      setSuccess(t("family.joinRequestSent"));
      onJoined?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || t("family.joinFailed"));
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="join-family-modal">
      {onClose && (
        <div className="join-modal-header">
          <h3>{t("family.joinFamily")}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
      )}

      {step === "search" && (
        <div>
          <p className="join-hint">{t("family.joinHint")}</p>
          <div className="join-search">
            <input
              type="text" value={shareCode}
              onChange={(e) => setShareCode(e.target.value.toUpperCase())}
              placeholder={t("family.shareCodePlaceholder")} maxLength={20}
            />
            <button className="btn-primary" onClick={handleSearch} disabled={searching || !shareCode.trim()}>
              {searching ? t("common.searching") : t("common.search")}
            </button>
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>
      )}

      {step === "confirm" && searchedFamily && (
        <div>
          <div className="found-family">
            <span>🏠</span>
            <div>
              <div className="found-family-name">{searchedFamily.name}</div>
              <div className="found-family-code">{t("family.shareCode")}: {searchedFamily.shareCode}</div>
            </div>
          </div>
          <div className="join-actions">
            <button className="btn-cancel" onClick={() => setStep("search")}>{t("common.back")}</button>
            <button className="btn-primary" onClick={handleJoin} disabled={joining}>
              {joining ? t("common.joining") : t("family.requestJoin")}
            </button>
          </div>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
        </div>
      )}
    </div>
  );
}
