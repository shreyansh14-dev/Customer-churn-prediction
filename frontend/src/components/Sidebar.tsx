import React from 'react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (v: string) => void;
  onStartAnalysis?: () => void;
  onLoadDemo?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isOverlay?: boolean;
}

/* ── Inline SVG Icons ─────────────────────────────────── */
const icons: Record<string, React.ReactNode> = {
  home: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  churn: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  commerce: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.97-1.67L23 6H6"/>
    </svg>
  ),
  retail: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  credit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  model: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  explain: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4M12 16h.01"/>
    </svg>
  ),
  features: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  datasets: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  monitor: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  api: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  wizard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

const NAV_SECTIONS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Navigation',
    items: [
      { id: 'landing',      label: 'Home',             icon: icons.home },
      { id: 'wizard',       label: 'Analyze Business', icon: icons.wizard, badge: 'Wizard' },
    ],
  },
  {
    section: 'Core Products',
    items: [
      { id: 'churniq',      label: 'ChurnIQ Flagship', icon: icons.churn,    badge: 'Flagship', badgeColor: 'var(--cobalt)' },
      { id: 'commerceiq',   label: 'CommerceIQ',       icon: icons.commerce },
      { id: 'retailiq',     label: 'RetailIQ CLV',     icon: icons.retail },
      { id: 'creditriskiq', label: 'CreditRiskIQ',     icon: icons.credit },
    ],
  },
  {
    section: 'ML Engineering',
    items: [
      { id: 'modellab',      label: '7 Models Lab',    icon: icons.model,    badge: '7 Models', badgeColor: 'var(--emerald)' },
      { id: 'explainability',label: 'SHAP Explain',    icon: icons.explain },
      { id: 'features',      label: 'Feature Store',   icon: icons.features, badge: '38 Feat' },
      { id: 'monitoring',    label: 'PSI Monitoring',  icon: icons.monitor },
    ],
  },
  {
    section: 'Developer Tools',
    items: [
      { id: 'datasets', label: 'Datasets (7)',  icon: icons.datasets },
      { id: 'api',      label: 'FastAPI Spec',  icon: icons.api, badge: '200 OK', badgeColor: 'var(--emerald)' },
    ],
  },
];

export function Sidebar({
  currentView,
  setCurrentView,
  isOpen = true,
  onClose,
  isOverlay = false
}: SidebarProps) {
  const handleItemClick = (id: string) => {
    setCurrentView(id);
    if (isOverlay && onClose) {
      onClose();
    }
  };

  // If overlay mode and closed, do not render
  if (isOverlay && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay for drawer mode */}
      {isOverlay && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 199,
            transition: 'opacity 0.25s ease',
          }}
        />
      )}

      <aside
        className="sidebar"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: 240,
          zIndex: isOverlay ? 200 : 50,
          boxShadow: isOverlay ? '6px 0 35px rgba(0, 0, 0, 0.35)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top Header Bar with Close Button (M / MLVerse / Intelligence Platform removed) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 18px 12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase' }}>
            Navigation
          </div>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                color: '#ffffff',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 14,
                lineHeight: 1,
                transition: 'all 0.2s ease',
              }}
              title="Close Menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {NAV_SECTIONS.map(({ section, items }) => (
            <div key={section} style={{ marginBottom: 14 }}>
              <div className="sidebar-section-label" style={{ fontSize: 10, letterSpacing: '0.06em' }}>
                {section}
              </div>
              {items.map((item) => {
                const isActive =
                  currentView === item.id || (currentView === 'customers' && item.id === 'churniq');
                return (
                  <div
                    key={item.id}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      className="sidebar-icon"
                      style={{
                        color: isActive ? '#ffffff' : item.badgeColor || 'var(--graphite)',
                        opacity: isActive ? 1 : 0.85,
                      }}
                    >
                      {item.icon}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          padding: '2px 7px',
                          borderRadius: 9999,
                          background: isActive
                            ? 'rgba(255,255,255,0.18)'
                            : item.badgeColor
                            ? 'var(--cobalt-soft)'
                            : 'var(--mist)',
                          color: isActive ? '#ffffff' : item.badgeColor || 'var(--slate)',
                          border: `1px solid ${
                            isActive
                              ? 'rgba(255,255,255,0.2)'
                              : item.badgeColor
                              ? '#bfdbfe'
                              : 'var(--ash)'
                          }`,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
