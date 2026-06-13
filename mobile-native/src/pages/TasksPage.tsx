import { useEffect, useState, useCallback } from "react";
import { useFamilyStore } from "../store";
import { familyApi, taskApi, type ChildInfo, type FamilyInfo, type TaskInfo } from "../api";
import { t } from "../i18n";
import "./TasksPage.css";

const ICON_OPTIONS = ['📋', '📖', '🧹', '🎹', '🎨', '🏃', '🧮', '🔬', '🌱', '💪', '🎯', '⭐'];

export default function TasksPage() {
  const { selectedFamilyId, selectedChildId, selectChild, setFamilies, children, setChildren } = useFamilyStore();
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskInfo | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPoints, setFormPoints] = useState(5);
  const [formIcon, setFormIcon] = useState("📋");
  const [formTrophy, setFormTrophy] = useState("");
  const [formChildId, setFormChildId] = useState("");
  const [saving, setSaving] = useState(false);

  const fid = selectedFamilyId;
  const cid = selectedChildId;
  const kids = fid ? (children[fid] || []) : [];
  const currentChild = kids.find((k: ChildInfo) => k.id === cid) || kids[0];

  const loadData = useCallback(async () => {
    if (!fid) return;
    try {
      const [tasksRes, templatesRes] = await Promise.all([
        taskApi.getFamilyTasks(fid),
        taskApi.getTemplates(),
      ]);
      setTasks(tasksRes.data ?? []);
      setTemplates(templatesRes.data ?? []);
    } catch {
      setError(t("tasks.loadFailed"));
    }
  }, [fid]);

  // Init: load families & children
  useEffect(() => {
    setInitializing(true);
    if (fid && kids.length > 0) {
      setInitializing(false);
      return;
    }
    if (fid && kids.length === 0) {
      familyApi.children(fid)
        .then((res) => {
          setChildren(fid, (res.data ?? []) as ChildInfo[]);
          const kidsData = res.data ?? [];
          if (kidsData.length > 0 && !useFamilyStore.getState().selectedChildId) {
            selectChild(kidsData[0].id);
          }
        })
        .catch(() => {})
        .finally(() => setInitializing(false));
      return;
    }
    familyApi.mine()
      .then((res) => {
        const loadedFamilies = (res.data ?? []) as FamilyInfo[];
        setFamilies(loadedFamilies);
        if (loadedFamilies.length > 0) {
          const activeFid = useFamilyStore.getState().selectedFamilyId || loadedFamilies[0].id;
          return familyApi.children(activeFid).then((r) => ({ fid: activeFid, res: r }));
        }
        return null;
      })
      .then((result) => {
        if (!result) return;
        setChildren(result.fid, (result.res.data ?? []) as ChildInfo[]);
        const kidsData = result.res.data ?? [];
        if (kidsData.length > 0 && !useFamilyStore.getState().selectedChildId) {
          selectChild(kidsData[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, []);

  // Load tasks when fid changes
  useEffect(() => {
    if (fid) loadData();
  }, [fid, loadData]);

  const openCreateForm = (template?: any) => {
    setEditingTask(null);
    setFormName(template?.name || "");
    setFormDesc(template?.description || "");
    setFormPoints(template?.points || 5);
    setFormIcon(template?.icon || "📋");
    setFormTrophy(template?.trophyName || "");
    setFormChildId(currentChild?.id || kids[0]?.id || "");
    setShowForm(true);
  };

  const openEditForm = (task: TaskInfo) => {
    setEditingTask(task);
    setFormName(task.name);
    setFormDesc(task.description || "");
    setFormPoints(task.points);
    setFormIcon(task.icon || "📋");
    setFormTrophy(task.trophyName || "");
    setFormChildId(task.childId);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !fid) return;
    setSaving(true);
    try {
      const data = { name: formName, description: formDesc, points: formPoints, icon: formIcon, trophyName: formTrophy, childId: formChildId };
      if (editingTask) {
        await taskApi.update(editingTask.id, data);
      } else {
        await taskApi.create(fid, data);
      }
      setShowForm(false);
      loadData();
    } catch {
      setError(t("tasks.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await taskApi.complete(taskId);
      loadData();
    } catch {
      setError(t("tasks.completeFailed"));
    }
  };

  const handleCancel = async (taskId: string) => {
    try {
      await taskApi.cancel(taskId);
      loadData();
    } catch {
      setError(t("tasks.cancelFailed"));
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm(t("tasks.deleteConfirm"))) return;
    try {
      await taskApi.delete(taskId);
      loadData();
    } catch {
      setError(t("tasks.deleteFailed"));
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "PENDING": return t("tasks.pending");
      case "COMPLETED": return t("tasks.completed");
      case "CANCELLED": return t("tasks.cancelled");
      default: return s;
    }
  };

  return (
    <div className="home-v2">
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>

      <nav className="home-nav-v2">
        <span className="home-nav-title">📋 {t("tasks.title")}</span>
        <button className="home-nav-btn" onClick={() => openCreateForm()}>+</button>
      </nav>

      {error && <div className="error-banner">{error}</div>}

      <div style={{ position: "relative", zIndex: 1, paddingBottom: 80 }}>
        {/* Child Switcher */}
        {kids.length > 0 && (
          <div className="shop-child-scroll-v2" style={{ paddingTop: 4 }}>
            {kids.map((c: ChildInfo) => (
              <button key={c.id} onClick={() => selectChild(c.id)}
                className={"shop-child-chip-v2" + (c.id === (cid || currentChild?.id) ? " active" : "")}>
                <span className="shop-child-chip-avatar-v2">{c.avatar || "🧒"}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Task Templates */}
        {templates.length > 0 && (
          <div className="task-section">
            <div className="task-section-title">{t("tasks.templates")}</div>
            <div className="template-scroll">
              {templates.map((tmpl) => (
                <div key={tmpl.id} className="template-chip" onClick={() => openCreateForm(tmpl)}>
                  <span>{tmpl.icon}</span>
                  <span>{tmpl.name}</span>
                  <span className="template-points">+{tmpl.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="task-section">
          <div className="task-section-title">{t("tasks.myTasks")}</div>
          {initializing ? (
            <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,0.4)" }}>
              <div className="spinner" style={{ margin: "0 auto 8px" }} />
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "rgba(255,255,255,0.3)" }}>
              {t("tasks.empty")}
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className={`task-item task-item-${task.status.toLowerCase()}`}>
                <div className="task-item-left">
                  <span className="task-item-icon">{task.icon || "📋"}</span>
                  <div className="task-item-info">
                    <span className="task-item-name">{task.name}</span>
                    {task.description && <span className="task-item-desc">{task.description}</span>}
                    <span className="task-item-status">{statusLabel(task.status)}</span>
                  </div>
                </div>
                <div className="task-item-right">
                  <span className="task-item-points">+{task.points}</span>
                  {task.status === "PENDING" && (
                    <div className="task-item-actions">
                      <button className="task-action-btn complete" onClick={() => handleComplete(task.id)}>👍</button>
                      <button className="task-action-btn" onClick={() => openEditForm(task.id)}>✏️</button>
                      <button className="task-action-btn" onClick={() => handleCancel(task.id)}>⏸️</button>
                      <button className="task-action-btn delete" onClick={() => handleDelete(task.id)}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content task-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTask ? t("tasks.edit") : t("tasks.create")}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="task-form">
              <input placeholder={t("tasks.formName")} value={formName} onChange={(e) => setFormName(e.target.value)} />
              <textarea placeholder={t("tasks.formDesc")} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} />
              <div className="task-form-row">
                <div className="task-form-field">
                  <label>{t("tasks.points")}</label>
                  <input type="number" min={0} value={formPoints} onChange={(e) => setFormPoints(parseInt(e.target.value) || 0)} />
                </div>
                <div className="task-form-field">
                  <label>{t("tasks.child")}</label>
                  <select value={formChildId} onChange={(e) => setFormChildId(e.target.value)}>
                    {kids.map((c: ChildInfo) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="task-form-field">
                <label>{t("tasks.icon")}</label>
                <div className="icon-picker">
                  {ICON_OPTIONS.map((icon) => (
                    <button key={icon} type="button"
                      className={`icon-opt ${formIcon === icon ? "selected" : ""}`}
                      onClick={() => setFormIcon(icon)}>{icon}</button>
                  ))}
                </div>
              </div>
              <div className="task-form-field">
                <label>{t("tasks.formTrophy")}</label>
                <input placeholder={t("tasks.formTrophyPlaceholder")} value={formTrophy} onChange={(e) => setFormTrophy(e.target.value)} />
              </div>
              <div className="task-form-actions">
                <button className="btn-cancel" onClick={() => setShowForm(false)}>{t("common.cancel")}</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? t("common.saving") : t("common.save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
