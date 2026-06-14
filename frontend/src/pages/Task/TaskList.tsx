import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFamilyStore } from '../../store/familyStore';
import { familyApi } from '../../api/family';
import { taskApi, type ChildTaskResponse, type TaskTemplateResponse } from '../../api/task';
import { trophyApi } from '../../api/trophy';
import TaskForm from './TaskForm';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import ChildSelector from '../../components/ChildSelector';
import ChildSlider from '../../components/ChildSlider';
import { useDeviceType } from '../../hooks/useDeviceType';
import './TaskList.css';

type ModalMode = 'pick-template' | 'form' | 'edit' | null;

// 维度图标映射
const DIMENSION_ICONS: Record<string, string> = {
  intelligence: '🧠',
  physical: '💪',
  moral: '🌟',
  hygiene: '🧼',
  handcraft: '✂️',
};

// 奖杯名称最大显示长度
const TROPHY_NAME_MAX_LENGTH = 20;
// 奖杯每页显示数量 - 初始只展示前3个
const TROPHIES_PER_PAGE = 3;

export default function TaskList() {
  const { t } = useTranslation(['task', 'common']);
  const { currentFamily, selectedChild, children } = useFamilyStore();
  const { isMobile } = useDeviceType();

  const [tasks, setTasks] = useState<ChildTaskResponse[]>([]);
  const [templates, setTemplates] = useState<TaskTemplateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // modalMode: null=closed, 'pick-template'=选模板, 'form'=显示表单, 'edit'=编辑
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingTask, setEditingTask] = useState<ChildTaskResponse | null>(null);
  const [templateForCreate, setTemplateForCreate] = useState<TaskTemplateResponse | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmComplete, setConfirmComplete] = useState<string | null>(null);
  const [showTrophies, setShowTrophies] = useState(false);
  const [trophies, setTrophies] = useState<any[]>([]);
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set());
  const [trophyPage, setTrophyPage] = useState(0);

  const fid = currentFamily?.id;

  // 初始化家庭数据（如果 store 中没有）
  const loadFamilies = useCallback(async () => {
    if (currentFamily) return; // 已有数据
    try {
      const res = await familyApi.getMyFamilies();
      if (res.data.success && res.data.data) {
        const { setFamilies, setCurrentFamily } = useFamilyStore.getState();
        const families = res.data.data;
        setFamilies(families);
        if (families.length > 0) {
          setCurrentFamily(families[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load families:', err);
    }
  }, [currentFamily]);

  useEffect(() => {
    loadFamilies();
  }, [loadFamilies]);

  const loadTasks = useCallback(async () => {
    if (!fid) return;
    setLoading(true);
    setError('');
    try {
      if (selectedChild?.id) {
        const [tasksRes, templatesRes] = await Promise.all([
          taskApi.getChildTasks(selectedChild.id),
          taskApi.getTemplates(),
        ]);
        if (tasksRes.data.success) setTasks(tasksRes.data.data ?? []);
        if (templatesRes.data.success) setTemplates(templatesRes.data.data ?? []);
      } else {
        const [tasksRes, templatesRes] = await Promise.all([
          taskApi.getFamilyTasks(fid),
          taskApi.getTemplates(),
        ]);
        if (tasksRes.data.success) setTasks(tasksRes.data.data ?? []);
        if (templatesRes.data.success) setTemplates(templatesRes.data.data ?? []);
      }
    } catch (err) {
      setError(t('task:errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [fid, selectedChild?.id, t]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // 按维度分组模板
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, TaskTemplateResponse[]> = {};
    templates.forEach((tmpl) => {
      const dim = tmpl.dimension || 'other';
      if (!groups[dim]) groups[dim] = [];
      groups[dim].push(tmpl);
    });
    return groups;
  }, [templates]);

  const dimensionKeys = useMemo(() => Object.keys(groupedTemplates), [groupedTemplates]);

  // 维度切换：只保留一个展开，且默认全部收起

  const toggleDimension = (dim: string) => {
    setExpandedDimensions((prev) => {
      // 只保留一个展开：如果点击已展开的则收起，否则切换到新维度
      if (prev.has(dim)) {
        return new Set();
      }
      return new Set([dim]);
    });
  };

  // 点击创建任务 → 先展示模板选择器
  const handleCreate = () => {
    setEditingTask(null);
    setTemplateForCreate(null);
    setModalMode('pick-template');
  };

  // 选择一个模板 → 预填表单
  const handleTemplateSelect = (tmpl: TaskTemplateResponse) => {
    setTemplateForCreate(tmpl);
    setModalMode('form');
  };

  // 不使用模板，自定义创建
  const handleCustomCreate = () => {
    setTemplateForCreate(null);
    setModalMode('form');
  };

  const handleEdit = (task: ChildTaskResponse) => {
    setEditingTask(task);
    setTemplateForCreate(null);
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

  // 刷新孩子积分（完成任务后积分会变）
  const refreshChildScores = useCallback(async () => {
    if (!fid) return;
    try {
      const res = await familyApi.getChildren(fid);
      if (res.data.success && res.data.data) {
        const { setChildren } = useFamilyStore.getState();
        setChildren(res.data.data);
      }
    } catch {
      // 静默失败，不影响用户体验
    }
  }, [fid]);

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
        // 刷新孩子积分显示
        await refreshChildScores();
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

  const handleCloseModal = () => {
    setModalMode(null);
    setTemplateForCreate(null);
  };

  const handleFormSaved = () => {
    setModalMode(null);
    setTemplateForCreate(null);
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
    setTrophyPage(0);
    setShowTrophies(true);
  };

  const trophyTotalPages = Math.ceil(trophies.length / TROPHIES_PER_PAGE);
  const displayTrophies = trophies.slice(0, (trophyPage + 1) * TROPHIES_PER_PAGE);

  const truncateName = (name: string, maxLen: number = TROPHY_NAME_MAX_LENGTH) => {
    if (!name) return '';
    return name.length > maxLen ? name.slice(0, maxLen) + '…' : name;
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return t('task:pending');
      case 'COMPLETED': return t('task:completed');
      case 'CANCELLED': return t('task:cancelled');
      default: return status;
    }
  };

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

      {/* 孩子选择器 - 放在任务列表上方 */}
      <div className="task-section">
        {isMobile ? <ChildSlider /> : <ChildSelector layout="column" />}
      </div>

      {/* Child Tasks List */}
      <div className="task-section">
        <h3>
          {t('task:myTasks')}
          {selectedChild && <span className="task-child-name"> - {selectedChild.nickname || selectedChild.name}</span>}
        </h3>
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
                      {task.dimension && (
                        <span className="task-dimension-tag">
                          {t(`task:dimensions.${task.dimension}`, task.dimension)}
                        </span>
                      )}
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

      {/* ===== 模板选择器 Modal ===== */}
      {modalMode === 'pick-template' && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content template-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('task:selectTemplate') || '选择任务模板'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <div className="template-picker-hint">
              {t('task:templateHint') || '选择一个模板快速创建任务，或自定义创建'}
            </div>
            {templates.length > 0 ? (
              <div className="dimension-groups template-picker-groups">
                {dimensionKeys.map((dim) => {
                  const items = groupedTemplates[dim];
                  const isExpanded = expandedDimensions.has(dim);
                  return (
                    <div key={dim} className="dimension-group">
                      <div
                        className="dimension-header"
                        onClick={() => toggleDimension(dim)}
                      >
                        <span className="dimension-icon">
                          {DIMENSION_ICONS[dim] || '📁'}
                        </span>
                        <span className="dimension-label">
                          {t(`task:dimensions.${dim}`, dim)}
                        </span>
                        <span className="dimension-count">{items.length}</span>
                        <span className={`dimension-arrow ${isExpanded ? 'expanded' : ''}`}>
                          ▶
                        </span>
                      </div>
                      {isExpanded && (
                        <div className="template-grid template-grid--picker">
                          {items.map((tmpl) => (
                            <div
                              key={tmpl.id}
                              className="template-card"
                              onClick={() => handleTemplateSelect(tmpl)}
                            >
                              <span className="template-icon">{tmpl.icon}</span>
                              <span className="template-name">{tmpl.name}</span>
                              <span className="template-points">+{tmpl.points}⭐</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="template-picker-empty">{t('task:noTemplates') || '暂无模板'}</div>
            )}
            <div className="template-picker-footer">
              <button className="btn-secondary" onClick={handleCloseModal}>
                {t('common:cancel')}
              </button>
              <button className="btn-primary" onClick={handleCustomCreate}>
                {t('task:customCreate') || '自定义创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 创建/编辑表单 ===== */}
      {(modalMode === 'form' || modalMode === 'edit') && fid && (
        <TaskForm
          mode={modalMode === 'form' ? 'create' : 'edit'}
          familyId={fid}
          task={editingTask}
          template={templateForCreate}
          onSaved={handleFormSaved}
          onClose={handleCloseModal}
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

      {/* Trophy Modal with Pagination */}
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
                <>
                  {displayTrophies.map((tr) => (
                    <div key={tr.id} className="trophy-item">
                      <span className="trophy-icon">{tr.icon || '🏆'}</span>
                      <div className="trophy-info">
                        <span className="trophy-name" title={tr.name}>
                          {truncateName(tr.name)}
                        </span>
                        <span className="trophy-points">+{tr.points}⭐</span>
                      </div>
                      <span className="trophy-date">
                        {new Date(tr.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {trophyPage + 1 < trophyTotalPages && (
                    <div className="trophy-pagination">
                      <button
                        className="btn-secondary trophy-show-more"
                        onClick={() => setTrophyPage((p) => p + 1)}
                      >
                        {t('task:showMore')} ({trophies.length - displayTrophies.length})
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            {trophies.length > 0 && (
              <div className="trophy-footer">
                共 {trophies.length} 个奖杯
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
