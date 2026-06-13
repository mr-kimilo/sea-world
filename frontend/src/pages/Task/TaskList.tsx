import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFamilyStore } from '../../store/familyStore';
import { taskApi, type ChildTaskResponse, type TaskTemplateResponse } from '../../api/task';
import { trophyApi } from '../../api/trophy';
import TaskForm from './TaskForm';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import './TaskList.css';

type ModalMode = 'create' | 'edit' | null;

export default function TaskList() {
  const { t } = useTranslation(['task', 'common']);
  const { currentFamily, selectedChild, children } = useFamilyStore();

  const [tasks, setTasks] = useState<ChildTaskResponse[]>([]);
  const [templates, setTemplates] = useState<TaskTemplateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingTask, setEditingTask] = useState<ChildTaskResponse | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmComplete, setConfirmComplete] = useState<string | null>(null);
  const [showTrophies, setShowTrophies] = useState(false);
  const [trophies, setTrophies] = useState<any[]>([]);

  const fid = currentFamily?.id;

  const loadTasks = useCallback(async () => {
    if (!fid) return;
    setLoading(true);
    setError('');
    try {
      const [tasksRes, templatesRes] = await Promise.all([
        taskApi.getFamilyTasks(fid),
        taskApi.getTemplates(),
      ]);
      if (tasksRes.data.success) setTasks(tasksRes.data.data ?? []);
      if (templatesRes.data.success) setTemplates(templatesRes.data.data ?? []);
    } catch (err) {
      setError(t('task:errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [fid, t]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = () => {
    setEditingTask(null);
    setModalMode('create');
  };

  const handleEdit = (task: ChildTaskResponse) => {
    setEditingTask(task);
    setModalMode('edit');
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await taskApi.deleteTask(confirmDelete);
      setTasks((prev) => prev.filter((t) => t.id !== confirmDelete));
    } catch {
      setError(t('task:errors.deleteFailed'));
    }
    setConfirmDelete(null);
  };

  const handleComplete = async () => {
    if (!confirmComplete) return;
    try {
      const res = await taskApi.completeTask(confirmComplete);
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === confirmComplete ? { ...t, status: 'COMPLETED' as const } : t
          )
        );
      }
    } catch {
      setError(t('task:errors.completeFailed'));
    }
    setConfirmComplete(null);
  };

  const handleCancel = async (taskId: string) => {
    try {
      const res = await taskApi.cancelTask(taskId);
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: 'CANCELLED' as const } : t
          )
        );
      }
    } catch {
      setError(t('task:errors.cancelFailed'));
    }
  };

  const handleFormSaved = () => {
    setModalMode(null);
    loadTasks();
  };

  const handleShowTrophies = async () => {
    if (!selectedChild) return;
    try {
      const res = await trophyApi.getTrophies(selectedChild.id);
      if (res.data.success) setTrophies(res.data.data ?? []);
    } catch {
      // ignore
    }
    setShowTrophies(true);
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return t('task:pending');
      case 'COMPLETED': return t('task:completed');
      case 'CANCELLED': return t('task:cancelled');
      default: return status;
    }
  };

  const currentChildId = selectedChild?.id;

  return (
    <div className="task-page">
      <div className="task-header">
        <h2>{t('task:title')}</h2>
        <div className="task-header-actions">
          <button className="btn-secondary" onClick={handleShowTrophies}>
            🏆 {t('task:trophies')}
          </button>
          <button className="btn-primary" onClick={handleCreate}>
            + {t('task:create')}
          </button>
        </div>
      </div>

      {error && <div className="task-error">{error}</div>}

      {/* Task Templates Section */}
      {templates.length > 0 && (
        <div className="task-section">
          <h3>{t('task:templates')}</h3>
          <div className="template-grid">
            {templates.map((tmpl) => (
              <div key={tmpl.id} className="template-card" onClick={() => {
                setEditingTask(null);
                setModalMode('create');
              }}>
                <span className="template-icon">{tmpl.icon}</span>
                <span className="template-name">{tmpl.name}</span>
                <span className="template-points">+{tmpl.points}⭐</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Child Tasks List */}
      <div className="task-section">
        <h3>{t('task:myTasks')}</h3>
        {loading ? (
          <div className="task-loading">{t('common:loading')}</div>
        ) : tasks.length === 0 ? (
          <div className="task-empty">{t('task:empty')}</div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className={`task-card task-${task.status.toLowerCase()}`}>
                <div className="task-card-left">
                  <span className="task-icon">{task.icon || '📋'}</span>
                  <div className="task-info">
                    <span className="task-name">{task.name}</span>
                    {task.description && <span className="task-desc">{task.description}</span>}
                    <span className="task-child">
                      {children.find((c) => c.id === task.childId)?.name || t('common:unknown')}
                    </span>
                  </div>
                </div>
                <div className="task-card-right">
                  <span className="task-points">+{task.points}⭐</span>
                  <span className={`task-status status-${task.status.toLowerCase()}`}>
                    {statusLabel(task.status)}
                  </span>
                  {task.status === 'PENDING' && (
                    <div className="task-actions">
                      <button className="btn-icon" onClick={() => setConfirmComplete(task.id)} title={t('task:complete')}>
                        👍
                      </button>
                      <button className="btn-icon" onClick={() => handleEdit(task)} title={t('common:edit')}>
                        ✏️
                      </button>
                      <button className="btn-icon" onClick={() => handleCancel(task.id)} title={t('task:cancel')}>
                        ⏸️
                      </button>
                      <button className="btn-icon" onClick={() => setConfirmDelete(task.id)} title={t('common:delete')}>
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalMode && fid && (
        <TaskForm
          mode={modalMode}
          familyId={fid}
          task={editingTask}
          onSaved={handleFormSaved}
          onClose={() => setModalMode(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        message={t('task:deleteConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        type="danger"
      />

      {/* Complete Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmComplete}
        message={t('task:completeConfirm')}
        onConfirm={handleComplete}
        onCancel={() => setConfirmComplete(null)}
        type="success"
      />

      {/* Trophy Modal */}
      {showTrophies && (
        <div className="modal-overlay" onClick={() => setShowTrophies(false)}>
          <div className="modal-content trophy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏆 {t('task:trophies')}</h3>
              <button className="modal-close" onClick={() => setShowTrophies(false)}>✕</button>
            </div>
            <div className="trophy-list">
              {trophies.length === 0 ? (
                <div className="trophy-empty">{t('task:noTrophies')}</div>
              ) : (
                trophies.map((tr) => (
                  <div key={tr.id} className="trophy-item">
                    <span className="trophy-icon">{tr.icon || '🏆'}</span>
                    <div className="trophy-info">
                      <span className="trophy-name">{tr.name}</span>
                      <span className="trophy-points">+{tr.points}⭐</span>
                    </div>
                    <span className="trophy-date">
                      {new Date(tr.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
