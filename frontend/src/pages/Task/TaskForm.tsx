import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFamilyStore } from '../../store/familyStore';
import { taskApi, type ChildTaskRequest, type ChildTaskResponse } from '../../api/task';
import './TaskForm.css';

interface Props {
  mode: 'create' | 'edit';
  familyId: string;
  task: ChildTaskResponse | null;
  onSaved: () => void;
  onClose: () => void;
}

export default function TaskForm({ mode, familyId, task, onSaved, onClose }: Props) {
  const { t } = useTranslation(['task', 'common']);
  const { children, selectedChild } = useFamilyStore();

  const [form, setForm] = useState<ChildTaskRequest>({
    name: task?.name ?? '',
    description: task?.description ?? '',
    points: task?.points ?? 5,
    icon: task?.icon ?? '📋',
    trophyName: task?.trophyName ?? '',
    childId: task?.childId ?? selectedChild?.id ?? children[0]?.id ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const ICON_OPTIONS = ['📋', '📖', '🧹', '🎹', '🎨', '🏃', '🧮', '🔬', '🌱', '💪', '🎯', '⭐'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError(t('task:errors.nameRequired'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (mode === 'create') {
        await taskApi.createTask(familyId, form);
      } else if (task) {
        await taskApi.updateTask(task.id, form);
      }
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message || t('task:errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{mode === 'create' ? t('task:create') : t('task:edit')}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>{t('task:form.name')}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('task:form.namePlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('task:form.description')}</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t('task:form.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('task:form.points')}</label>
              <input
                type="number"
                min={0}
                value={form.points}
                onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label>{t('task:form.child')}</label>
              <select
                value={form.childId}
                onChange={(e) => setForm({ ...form, childId: e.target.value })}
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{t('task:form.icon')}</label>
            <div className="icon-picker">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-option ${form.icon === icon ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>{t('task:form.trophyName')}</label>
            <input
              type="text"
              value={form.trophyName ?? ''}
              onChange={(e) => setForm({ ...form, trophyName: e.target.value })}
              placeholder={t('task:form.trophyNamePlaceholder')}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t('common:cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? t('common:saving') : (mode === 'create' ? t('common:create') : t('common:save'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
