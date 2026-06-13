import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { familyApi, type FamilyMemberResponse } from '../../api/family';
import './ManageMembers.css';

interface Props {
  familyId: string;
}

export default function ManageMembers({ familyId }: Props) {
  const { t } = useTranslation(['family', 'common']);

  const [members, setMembers] = useState<FamilyMemberResponse[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FamilyMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [membersRes, pendingRes] = await Promise.all([
        familyApi.getMembers(familyId),
        familyApi.getPendingRequests(familyId),
      ]);
      if (membersRes.data.success) setMembers(membersRes.data.data ?? []);
      if (pendingRes.data.success) setPendingRequests(pendingRes.data.data ?? []);
    } catch {
      setError(t('family:errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [familyId]);

  const handleApprove = async (userId: string) => {
    try {
      await familyApi.approveJoin(familyId, userId);
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || t('family:errors.approveFailed'));
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await familyApi.rejectJoin(familyId, userId);
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || t('family:errors.rejectFailed'));
    }
  };

  return (
    <div className="manage-members-page">
      <h2>{t('family:manageMembers')}</h2>

      {error && <div className="form-error">{error}</div>}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="pending-section">
          <h3>{t('family:pendingRequests')} ({pendingRequests.length})</h3>
          {pendingRequests.map((req) => (
            <div key={req.id} className="pending-card">
              <div className="pending-info">
                <span className="pending-email">{req.userEmail}</span>
                <span className="pending-status">{t('family:status.pending')}</span>
              </div>
              <div className="pending-actions">
                <button className="btn-approve" onClick={() => handleApprove(req.userId)}>
                  ✅ {t('family:approve')}
                </button>
                <button className="btn-reject" onClick={() => handleReject(req.userId)}>
                  ❌ {t('family:reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Members */}
      <div className="members-section">
        <h3>{t('family:activeMembers')} ({members.length})</h3>
        {loading ? (
          <div className="loading-text">{t('common:loading')}</div>
        ) : members.length === 0 ? (
          <div className="empty-text">{t('family:noMembers')}</div>
        ) : (
          members.map((m) => (
            <div key={m.id} className="member-card">
              <div className="member-avatar">
                {m.role === 'owner' ? '👑' : '👤'}
              </div>
              <div className="member-info">
                <span className="member-email">{m.userEmail}</span>
                <span className={`member-role role-${m.role}`}>
                  {m.role === 'owner' ? t('family:role.owner') : t('family:role.member')}
                </span>
              </div>
              <span className={`member-status status-${m.status.toLowerCase()}`}>
                {m.status === 'ACTIVE' ? t('family:status.active') : t('family:status.pending')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
