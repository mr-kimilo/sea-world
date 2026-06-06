import { t } from "../i18n";
export default function TasksPage() { return <div><h1 className="page-title">{t("tasks.title")}</h1><div className="empty-state">{t("tasks.empty")}</div></div>; }
