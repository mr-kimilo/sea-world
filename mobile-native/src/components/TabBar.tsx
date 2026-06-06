import { Link, useLocation } from "react-router-dom";

type TabItem = {
  to: string;
  icon: string;
  label: string;
};

export default function TabBar({ items }: { items: TabItem[] }) {
  const location = useLocation();

  return (
    <nav className="tabbar">
      {items.map((item) => {
        const active = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`tabbar-item${active ? " active" : ""}`}
          >
            <span className="tabbar-icon">{item.icon}</span>
            <span className="tabbar-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
