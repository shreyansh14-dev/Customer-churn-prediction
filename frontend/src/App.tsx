import React, { useState, useEffect, useCallback, useRef } from 'react';
import gsap from 'gsap';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { BusinessAnalysisWizard } from './components/BusinessAnalysisWizard';
import { ChurnIQDashboard } from './components/ChurnIQDashboard';
import { CommerceIQDashboard } from './components/CommerceIQDashboard';
import { RetailIQDashboard } from './components/RetailIQDashboard';
import { CreditRiskDashboard } from './components/CreditRiskDashboard';
import { ModelLab } from './components/ModelLab';
import { ExplainabilityView } from './components/ExplainabilityView';
import { FeatureExplorer } from './components/FeatureExplorer';
import { DatasetExplorer } from './components/DatasetExplorer';
import { ModelMonitoringView } from './components/ModelMonitoringView';
import { ApiExplorer } from './components/ApiExplorer';
import { PortfolioProfile } from './components/PortfolioProfile';
import { ReportModal } from './components/ReportModal';
import { CloudAtmosphere } from './components/CloudAtmosphere';

type View = 'landing' | 'wizard' | 'churniq' | 'customers' | 'commerceiq' | 'retailiq' |
            'creditriskiq' | 'modellab' | 'explainability' | 'features' | 'datasets' |
            'monitoring' | 'api' | 'profile';

const HEADER_MAP: Record<string, { title: string; subtitle: string }> = {
  wizard:        { title: 'Business Analysis Engine',           subtitle: '13-step business onboarding, data validation, and risk evaluation' },
  churniq:       { title: 'ChurnIQ',                           subtitle: 'Customer churn prediction, retention intelligence, and risk scoring' },
  customers:     { title: 'ChurnIQ · Customers',               subtitle: 'Customer-level risk queue and retention recommendations' },
  commerceiq:    { title: 'CommerceIQ',                        subtitle: 'E-Commerce behavior analytics, purchase intent, and funnel conversion' },
  retailiq:      { title: 'RetailIQ',                          subtitle: 'RFM customer segmentation and Customer Lifetime Value (CLV)' },
  creditriskiq:  { title: 'CreditRiskIQ',                      subtitle: 'Loan default risk probability estimation and underwriter analytics' },
  modellab:      { title: 'Model Lab & Benchmarks',            subtitle: 'Cross-validation candidate matrix, Optuna tuning, and metrics' },
  explainability:{ title: 'Explainable AI (SHAP)',              subtitle: 'Feature attribution and individual risk driver waterfalls' },
  features:      { title: 'Feature Store Catalog',             subtitle: 'Documented canonical and domain-specific feature definitions' },
  datasets:      { title: 'Dataset Inventory',                 subtitle: 'Discovered raw datasets in D:\\customer churn prediction' },
  monitoring:    { title: 'Model Monitoring',                   subtitle: 'Population Stability Index (PSI) and feature drift detection' },
  api:           { title: 'REST API Explorer',                 subtitle: 'FastAPI interactive endpoint testing and payloads' },
  profile:       { title: 'Lead ML Engineer Portfolio',        subtitle: 'Full architecture, system design, and technical skills' },
};

/* ── Marketing Nav (landing page only) ────────────────── */
function MarketingNav({
  onNavigate,
  onToggleSidebar,
}: {
  onNavigate: (v: View) => void;
  onToggleSidebar: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 20,
        background: scrolled ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: scrolled ? '1px solid var(--ash)' : '1px solid rgba(226, 232, 240, 0.4)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* 3 Horizontal Lines (Hamburger) Button in Top Left Corner */}
      <button
        id="home-sidebar-toggle-btn"
        onClick={onToggleSidebar}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4.5,
          width: 38,
          height: 38,
          borderRadius: 10,
          background: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid rgba(203, 213, 225, 0.9)',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
        title="Open Navigation Menu"
      >
        <span style={{ width: 19, height: 2, background: '#090d16', borderRadius: 2 }} />
        <span style={{ width: 19, height: 2, background: '#090d16', borderRadius: 2 }} />
        <span style={{ width: 19, height: 2, background: '#090d16', borderRadius: 2 }} />
      </button>

      {/* Logo */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 19,
          fontWeight: 700,
          letterSpacing: '-0.035em',
          color: 'var(--ink)',
          cursor: 'pointer',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: 'var(--brand-grad)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
          }}
        >
          M
        </span>
        MLVerse
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: 28, flex: 1, alignItems: 'center' }}>
        {[
          { l: 'ChurnIQ Flagship', v: 'churniq' as View },
          { l: '7 Models Lab',     v: 'modellab' as View },
          { l: 'Feature Store',    v: 'features' as View },
          { l: 'REST API',         v: 'api' as View },
        ].map(item => (
          <button
            key={item.v}
            className="nav-link"
            onClick={() => onNavigate(item.v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--graphite)',
              padding: '6px 8px',
              borderRadius: 8,
            }}
          >
            {item.l}
          </button>
        ))}
      </div>

      {/* Right CTAs */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          className="btn btn-mist btn-sm"
          onClick={() => onNavigate('wizard')}
          style={{ fontWeight: 600 }}
        >
          Analyze Business
        </button>
        <button
          className="btn btn-cobalt btn-sm"
          onClick={() => onNavigate('churniq')}
          style={{ fontWeight: 600 }}
        >
          Launch ChurnIQ →
        </button>
      </div>
    </nav>
  );
}

/* ================================================================
   ROOT APP
   ================================================================ */
export function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [reportModalData, setReportModalData] = useState<any>(null);
  const [isHomeSidebarOpen, setIsHomeSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Global Tactile Micro-Interaction Handler for all buttons across the entire website
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        'button, [role="button"], .btn, .sidebar-item, .nav-link, .dash-tab, a'
      ) as HTMLElement;
      if (!target) return;

      // Subtle tactile spring compression (Level 1 Micro-Motion: 180-320ms)
      gsap.fromTo(
        target,
        { scale: 0.975 },
        { scale: 1, duration: 0.34, ease: 'back.out(2.2)', overwrite: 'auto' }
      );

      // Tactile ripple shockwave
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'tap-ripple';
      const size = Math.max(rect.width, rect.height) * 1.6;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      target.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    document.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', handleGlobalClick, { capture: true });
  }, []);

  // Smooth route & page transition with specialized supersonic Cloud Fly-Up & Sky Descent
  const navigate = useCallback((v: string) => {
    if (v === currentView) return;

    // "when tapped on analyze my buisness the clouds should fly up and the next page should come down from top with beaurtiful animation"
    if (v === 'wizard' && currentView === 'landing') {
      // Step 1: The clouds fly UP dramatically into the stratosphere (Pure GPU: force3D, zero lag)
      gsap.to(
        '.hero-sky',
        {
          y: -750,
          scale: 1.8,
          duration: 0.55,
          ease: 'power2.in',
          force3D: true,
          overwrite: 'auto',
        }
      );
      gsap.to(
        '.cloud-layer-secondary',
        {
          y: -1000,
          scale: 2.0,
          opacity: 0,
          duration: 0.55,
          ease: 'power2.in',
          force3D: true,
          overwrite: 'auto',
        }
      );
      gsap.to(
        ['.cloud-atmosphere-primary', '.cloud-atmosphere-secondary'],
        {
          y: -600,
          scale: 1.6,
          duration: 0.55,
          ease: 'power2.in',
          force3D: true,
          overwrite: 'auto',
        }
      );
      gsap.to(
        ['.hero-content', '.dashboard-preview-section', '.marketing-nav'],
        {
          y: -120,
          opacity: 0,
          duration: 0.38,
          ease: 'power2.in',
          force3D: true,
          overwrite: 'auto',
        }
      );

      // Step 2: Handoff and next page glides DOWN gracefully from top
      setTimeout(() => {
        setCurrentView('wizard');
        setIsHomeSidebarOpen(false);
        window.scrollTo({ top: 0, behavior: 'instant' });

        if (mainContentRef.current) {
          gsap.fromTo(
            mainContentRef.current,
            {
              y: -80,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out',
              force3D: true,
              clearProps: 'transform',
            }
          );
        }

        // Atmosphere settles gently into wizard's altitude
        gsap.fromTo(
          ['.cloud-atmosphere-primary', '.cloud-atmosphere-secondary'],
          { y: 140, scale: 1.2 },
          { y: 0, scale: 1, duration: 0.8, ease: 'power2.out', force3D: true, overwrite: 'auto' }
        );
      }, 380);
      return;
    }

    if (mainContentRef.current) {
      gsap.to(mainContentRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.18,
        ease: 'power2.in',
        force3D: true,
        onComplete: () => {
          setCurrentView(v as View);
          setIsHomeSidebarOpen(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
          gsap.fromTo(
            mainContentRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', force3D: true, clearProps: 'transform' }
          );
        }
      });
    } else {
      setCurrentView(v as View);
      setIsHomeSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView]);

  const isLanding = currentView === 'landing';

  const headerInfo = HEADER_MAP[currentView] ?? { title: 'MLVerse', subtitle: 'Predict. Explain. Retain.' };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', position: 'relative', color: 'var(--ink)' }}>

      {/* ── Global Dynamic Multi-Mood Atmospheric Cloud Engine ────── */}
      <CloudAtmosphere currentView={currentView} />

      {/* ── App Shell ── */}
      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={navigate}
          isOpen={isLanding ? isHomeSidebarOpen : true}
          isOverlay={isLanding}
          onClose={() => setIsHomeSidebarOpen(false)}
        />

        {/* Main Area */}
        <div ref={mainContentRef} style={{ flex: 1, marginLeft: isLanding ? 0 : 240, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {isLanding ? (
            <>
              <MarketingNav onNavigate={navigate} onToggleSidebar={() => setIsHomeSidebarOpen(prev => !prev)} />
              <div style={{ paddingTop: 0 }}>
                <LandingPage
                  onStartAnalysis={() => navigate('wizard')}
                  onExploreDemo={() => navigate('churniq')}
                  onNavigate={navigate}
                />
              </div>
            </>
          ) : (
            <>
              <Header
                title={headerInfo.title}
                subtitle={headerInfo.subtitle}
                activeModel="churniq_saas"
                onStartAnalysis={() => navigate('wizard')}
                onExploreDemo={() => navigate('churniq')}
              />

              {/* Breadcrumb back navigation */}
              <div style={{ padding: '14px 32px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => navigate('landing')}
                  className="btn-mist"
                  style={{
                    fontSize: 12.5,
                    padding: '5px 14px',
                    borderRadius: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 600,
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    cursor: 'pointer',
                  }}
                >
                  ← Back to Home
                </button>
                <span style={{ color: '#64748b', fontSize: 13 }}>/</span>
                <span style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600 }}>{headerInfo.title}</span>
              </div>

              <main style={{ padding: '24px 32px 64px', flex: 1 }}>
                {currentView === 'wizard' && (
                  <BusinessAnalysisWizard
                    onComplete={(data: any) => console.log('Wizard complete', data)}
                    onOpenReport={(data: any) => setReportModalData(data)}
                  />
                )}
                {(currentView === 'churniq' || currentView === 'customers') && <ChurnIQDashboard />}
                {currentView === 'commerceiq'    && <CommerceIQDashboard />}
                {currentView === 'retailiq'      && <RetailIQDashboard />}
                {currentView === 'creditriskiq'  && <CreditRiskDashboard />}
                {currentView === 'modellab'      && <ModelLab />}
                {currentView === 'explainability'&& <ExplainabilityView />}
                {currentView === 'features'      && <FeatureExplorer />}
                {currentView === 'datasets'      && <DatasetExplorer />}
                {currentView === 'monitoring'    && <ModelMonitoringView />}
                {currentView === 'api'           && <ApiExplorer />}
                {currentView === 'profile'       && <PortfolioProfile />}
              </main>
            </>
          )}
        </div>
      </div>

      {/* ── Executive Report Modal ────────────────────── */}
      {reportModalData && (
        <ReportModal
          reportData={reportModalData}
          onClose={() => setReportModalData(null)}
        />
      )}
    </div>
  );
}

export default App;
