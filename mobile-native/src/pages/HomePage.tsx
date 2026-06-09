import { useEffect, useRef, useState } from "react";
import { useAuthStore, useFamilyStore } from "../store";
import { familyApi, type ChildInfo, type FamilyInfo } from "../api";
import { t } from "../i18n";

const AVATARS = ["🧒", "👦", "👧", "🐱", "🐶", "🦊", "🐸", "🐼"];

// ── Mock activity data (replace with API call) ──
interface Activity {
  id: string;
  time: string;
  desc: string;
  score: number;
  childName: string;
}

// ── Ocean Bubbles Component ──
function OceanBubbles() {
  return (
    <div className="ocean-bubbles" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="ocean-bubble" />
      ))}
    </div>
  );
}

// ── Main HomePage ──
export default function HomePage() {
  const token = useAuthStore((s) => s.token);
  return token ? <Dashboard /> : <Landing />;
}

// ── Dashboard (Logged In) ──
function Dashboard() {
  const {
    selectedFamilyId: fid,
    selectedChildId: cid,
    selectChild,
    children,
    setFamilies,
    setChildren,
  } = useFamilyStore();
  const kids = fid ? children[fid] || [] : [];
  const currentChild = kids.find((c: ChildInfo) => c.id === cid) || kids[0];
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animPoints, setAnimPoints] = useState(0);
  const prevPoints = useRef(0);

  // Load families & children
  useEffect(() => {
    setIsLoading(true);
    if (!fid) {
      familyApi
        .mine()
        .then((res) => {
          const families: FamilyInfo[] = res.data ?? [];
          setFamilies(families);
          if (families.length > 0) {
            const f = families[0];
            familyApi
              .children(f.id)
              .then((r) => {
                setChildren(f.id, (r.data ?? []) as ChildInfo[]);
              })
              .catch(() => {});
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else if (kids.length === 0 && fid) {
      familyApi
        .children(fid)
        .then((r) => {
          setChildren(fid, (r.data ?? []) as ChildInfo[]);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Animate points on change
  useEffect(() => {
    const target = currentChild?.totalScore ?? 0;
    if (target === prevPoints.current) {
      setAnimPoints(target);
      return;
    }
    const duration = 800;
    const start = prevPoints.current;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimPoints(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else prevPoints.current = target;
    };
    requestAnimationFrame(animate);
  }, [currentChild?.totalScore]);

  // Load activities (mock for now — replace with real API)
  useEffect(() => {
    if (!currentChild) return;
    const mockActivities: Activity[] = [
      { id: "1", time: "10分钟前", desc: "完成数学作业", score: 10, childName: currentChild.name },
      { id: "2", time: "2小时前", desc: "整理房间", score: 5, childName: currentChild.name },
      { id: "3", time: "昨天 19:00", desc: "阅读课外书30分钟", score: 10, childName: currentChild.name },
    ];
    setActivities(mockActivities);
  }, [currentChild]);

  const progressPercent = currentChild
    ? Math.min(((currentChild.totalScore ?? 0) % 100) / 100, 1) * 100
    : 0;

  // Quick actions
  const quickActions = [
    { icon: "📊", label: t("home.pointsDetail"), href: "#/points" },
    { icon: "📅", label: t("home.checkIn"), href: "#/history" },
    { icon: "📋", label: t("home.tasks"), href: "#/tasks" },
    { icon: "🏆", label: t("home.achievements"), href: "#/child" },
  ];

  return (
    <div className="home-v2">
      {/* Ocean Background */}
      <div className="ocean-bg" aria-hidden="true">
        <OceanBubbles />
      </div>

      {/* Frosted Glass Nav */}
      <nav className="home-nav-v2">
        <span className="home-nav-title">🐠 {t("home.appName")}</span>
        <div className="home-nav-actions">
          <button className="home-nav-btn" aria-label="Notification">🔔</button>
          <button className="home-nav-btn" aria-label="Menu">☰</button>
        </div>
      </nav>

      {/* Child Switcher Bar — always visible */}
      <div className="child-switcher-v2">
        {kids.map((c: ChildInfo) => (
          <button
            key={c.id}
            onClick={() => selectChild(c.id)}
            className={"child-switcher-chip-v2" + (c.id === cid ? " active" : "")}
          >
            <span className="child-switcher-avatar-v2">{c.avatar || AVATARS[0]}</span>
            <span className="child-switcher-name-v2">{c.name}</span>
            <span className="child-switcher-points-v2">⭐{c.totalScore ?? "?"}</span>
          </button>
        ))}
      </div>

      {/* Child Card */}
      <div className="child-card-v2">
        {currentChild ? (
          <>
            <div className="child-card-top">
              <div className="child-avatar-v2">{currentChild.avatar || AVATARS[0]}</div>
              <div className="child-info-v2">
                <div className="child-name-v2">{currentChild.name}</div>
                <div className="child-role-v2">⭐ {t("home.currentPoints")}</div>
              </div>
              <button className="add-points-btn-v2" onClick={() => window.location.href = "#/points"}>
                {t("home.addPoints")}
              </button>
            </div>

            {/* Points Section */}
            <div className="points-section-v2">
              <div className="points-hero-v2">
                <span className="points-star-v2">⭐</span>
                <span className="points-number-v2">{animPoints}</span>
              </div>
              <div className="points-progress-v2">
                <div className="progress-bar-v2">
                  <div className="progress-fill-v2" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="progress-text-v2">{t("home.pointsProgress")}</div>
              </div>
            </div>
          </>
        ) : isLoading ? (
          <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,0.4)" }}>
            <div className="spinner" style={{ margin: "0 auto 8px" }} />
            <span style={{ fontSize: 13 }}>加载中...</span>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,0.4)" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👶</div>
            <div style={{ fontSize: 14 }}>{t("home.noChildren")}</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-v2">
        <div className="quick-actions-title">{t("home.quickActions")}</div>
        <div className="quick-grid-v2">
          {quickActions.map((action) => (
            <a key={action.href} href={action.href} className="quick-card-v2">
              <span className="quick-card-icon">{action.icon}</span>
              <span className="quick-card-label">{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="activity-feed-v2">
        <div className="activity-feed-title">{t("home.recentActivity")}</div>
        {activities.length > 0 ? (
          <>
            <div className="activity-list-v2">
              {activities.map((act) => (
                <div key={act.id} className="activity-item-v2">
                  <div className={`activity-dot-v2 ${act.score >= 0 ? "activity-dot-positive" : "activity-dot-negative"}`} />
                  <div className="activity-content-v2">
                    <div className="activity-time-v2">{act.time}</div>
                    <div className="activity-desc-v2">{act.desc}</div>
                  </div>
                  <div className={`activity-score-v2 ${act.score >= 0 ? "activity-score-positive" : "activity-score-negative"}`}>
                    {act.score >= 0 ? `+${act.score}` : act.score}
                  </div>
                </div>
              ))}
            </div>
            <a href="#/history" className="activity-view-all">{t("home.viewAll")} →</a>
          </>
        ) : (
          <div className="home-empty-v2">{t("points.noRecords")}</div>
        )}
      </div>

      {/* Wave Decoration */}
      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}

// ── Landing (Not Logged In) ──
function Landing() {
  return (
    <div className="home-v2">
      {/* Ocean Background */}
      <div className="ocean-bg" aria-hidden="true">
        <OceanBubbles />
      </div>

      <div className="home-landing-v2">
        <div className="home-landing-logo">🐠</div>
        <h1 className="home-landing-title">{t("home.appName")}</h1>
        <p className="home-landing-sub">{t("home.subtitle")}</p>

        <div className="home-landing-cards">
          <a href="#/login" className="home-landing-card">
            <span className="home-landing-card-icon">⭐</span>
            <div className="home-landing-card-title">{t("home.points")}</div>
            <div className="home-landing-card-desc">{t("home.pointsDesc")}</div>
          </a>
          <a href="#/child" className="home-landing-card">
            <span className="home-landing-card-icon">🧒</span>
            <div className="home-landing-card-title">{t("home.corrector")}</div>
            <div className="home-landing-card-desc">{t("home.correctorDesc")}</div>
          </a>
        </div>

        <a href="#/login" className="home-start-btn">
          🚀 {t("home.start")}
        </a>
      </div>

      {/* Wave Decoration */}
      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
