import { useTranslation } from 'react-i18next';
import './PageShellHeader.css';

export type PageShellSection = { id: string; label: string };

type PageShellHeaderProps = {
  /** When "navOnly", only the horizontal section pills are shown (e.g. under mobile page header). */
  variant?: 'full' | 'navOnly';
  title?: string;
  sections: PageShellSection[];
};

export default function PageShellHeader({
  variant = 'full',
  title,
  sections,
}: PageShellHeaderProps) {
  const { t } = useTranslation('common');

  const getCssPxVar = (varName: string): number => {
    const raw = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    const n = Number.parseFloat(raw.replace('px', ''));
    return Number.isFinite(n) ? n : 0;
  };

  const isScrollable = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    return el.scrollHeight > el.clientHeight + 1;
  };

  const getScrollParent = (node: HTMLElement | null): HTMLElement | null => {
    let el: HTMLElement | null = node;
    while (el) {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  };

  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    const isMobile = document.documentElement.getAttribute('data-device') === 'mobile';
    const mobileHeaderOffset = isMobile ? getCssPxVar('--mob-header-height') : 0;
    const baseOffset = 12;
    const totalOffset = baseOffset + mobileHeaderOffset + (isMobile ? 8 : 0);

    // Prefer scrolling the app's main container (prevents window-level jitter),
    // but fall back to document scrolling if the container isn't actually scrollable.
    const candidateParent = getScrollParent(target);
    const parent = isScrollable(candidateParent) ? candidateParent : document.scrollingElement;
    if (!parent) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const parentRect = parent.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const top = parent.scrollTop + (targetRect.top - parentRect.top) - totalOffset;
    parent.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className={`page-shell-header${variant === 'navOnly' ? ' page-shell-header--nav-only' : ''}`}>
      {variant === 'full' && title ? (
        <h1 className="page-shell-title">{title}</h1>
      ) : null}
      <nav className="page-shell-nav" aria-label={t('pageSectionNavAria')}>
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            className="page-shell-nav-btn"
            // Prevent focus/scroll jitter on click (esp. inside overflow containers)
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              (document.activeElement as HTMLElement | null)?.blur?.();
              scrollTo(s.id);
            }}
          >
            {s.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
