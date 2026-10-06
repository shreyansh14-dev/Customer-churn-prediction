import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
  activeModel?: string;
  onStartAnalysis: () => void;
  onExploreDemo: () => void;
}

export function Header({ title, subtitle, activeModel, onStartAnalysis, onExploreDemo }: HeaderProps) {
  return (
    <header className="app-header">
      {/* Left: Title + subtitle */}
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>
      </div>

      {/* Right: controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Active model chip */}
        {activeModel && (
          <span className="chip chip-cobalt" style={{ fontFamily: 'monospace', fontSize: 11.5, padding: '3px 10px' }}>
            <span className="live-dot" style={{ width: 6, height: 6 }} />
            {activeModel}
          </span>
        )}

        {/* CTA buttons */}
        <button className="btn btn-mist btn-sm" onClick={onStartAnalysis}>
          Run Analysis
        </button>
        <button className="btn btn-cobalt btn-sm" onClick={onExploreDemo} style={{ fontWeight: 600 }}>
          Launch ChurnIQ →
        </button>
      </div>
    </header>
  );
}

export default Header;
