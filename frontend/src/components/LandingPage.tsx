import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onStartAnalysis: () => void;
  onExploreDemo: () => void;
  onNavigate: (view: string) => void;
}

/* ─── SVG Icons ─── */
const IconArrow = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconBolt = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ─── Mini Metric Card ─── */
const MetricTile = ({
  label,
  value,
  delta,
  deltaType = 'up',
  tag,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
  tag?: string;
}) => (
  <div className="metric-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="metric-label">{label}</div>
      {tag && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 6,
            background: 'var(--mist)',
            color: 'var(--slate)',
            border: '1px solid var(--ash)',
          }}
        >
          {tag}
        </span>
      )}
    </div>
    <div className="metric-value">{value}</div>
    {delta && (
      <div
        className={`metric-delta ${deltaType === 'up' ? 'up' : deltaType === 'down' ? 'down' : ''}`}
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <span>{deltaType === 'up' ? '↑' : deltaType === 'down' ? '↓' : '•'}</span>
        <span>{delta}</span>
      </div>
    )}
  </div>
);

/* ================================================================
   LANDING PAGE COMPONENT
   ================================================================ */
export function LandingPage({ onStartAnalysis, onExploreDemo, onNavigate }: LandingPageProps) {
  const rootRef      = useRef<HTMLDivElement>(null);
  const heroRef      = useRef<HTMLDivElement>(null);
  const skyRef       = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef   = useRef<HTMLDivElement>(null);
  const heroCtaRef   = useRef<HTMLDivElement>(null);
  const heroStatsRef = useRef<HTMLDivElement>(null);
  const heroDashRef  = useRef<HTMLDivElement>(null);

  const [activeChartIdx, setActiveChartIdx] = useState<number>(10);
  const [isSoaring, setIsSoaring] = useState<boolean>(false);

  // ================================================================
  // DRAMATIC CLOUD FLY-UP / ROCKET LIFT ON BUTTON CLICK
  // "when we click some button it immediately flies up"
  // ================================================================
  const flyCloudsUp = (callback?: () => void) => {
    setIsSoaring(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsSoaring(false);
      },
    });

    // Supersonic rocket ascent through the clouds (Pure GPU transforms: force3D, zero lag)
    tl.to(
      ['.hero-sky', '.cloud-layer-secondary', '.cloud-atmosphere-primary', '.cloud-atmosphere-secondary'],
      {
        y: -750,
        scale: 1.8,
        duration: 0.55,
        ease: 'power2.in',
        force3D: true,
      }
    )
    .to(
      ['.hero-content', heroDashRef.current, '.marketing-nav'],
      {
        y: -120,
        opacity: 0,
        duration: 0.38,
        ease: 'power2.in',
        force3D: true,
      },
      0
    );

    if (callback) {
      setTimeout(() => {
        callback();
      }, 380);
    } else {
      // Rebound smoothly back to cruising altitude
      tl.to(
        ['.hero-sky', '.cloud-layer-secondary', '.cloud-atmosphere-primary', '.cloud-atmosphere-secondary'],
        {
          y: 0,
          scale: 1.15,
          duration: 0.8,
          ease: 'power2.out',
          force3D: true,
          delay: 0.05,
        }
      )
      .to(
        ['.hero-content', heroDashRef.current, '.marketing-nav'],
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.45,
          ease: 'power2.out',
          force3D: true,
        },
        '-=0.4'
      );
    }
  };

  // Interactive 3D cursor parallax across full-screen clouds
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!skyRef.current || isSoaring) return;
    const { clientX, clientY } = e;
    const xRatio = (clientX / window.innerWidth - 0.5) * 52;
    const yRatio = (clientY / window.innerHeight - 0.5) * 32;
    gsap.to(skyRef.current, {
      x: xRatio,
      y: yRatio,
      rotation: xRatio * 0.02,
      duration: 1.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  // Scroll animations with GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1 | Hero entrance
      const heroTL = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.1 } });
      heroTL
        .from(heroTitleRef.current, { y: 40, opacity: 0, duration: 1.1 }, 0)
        .from(heroSubRef.current,   { y: 20, opacity: 0 },                0.18)
        .from(heroCtaRef.current,   { y: 16, opacity: 0 },                0.3)
        .from(heroStatsRef.current, { y: 20, opacity: 0 },                0.42)
        .from(heroDashRef.current,  { y: 50, opacity: 0, duration: 1.2 }, 0.25);

      // 2 | Dynamic Sky Acceleration & Fly-Up On Scroll
      gsap.to(skyRef.current, {
        yPercent: -35,
        scale: 1.35,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      // 3 | Hero content scale & parallax depth on scroll (reverses naturally)
      gsap.to('.hero-content', {
        yPercent: -15,
        scale: 0.94,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start:   'center top',
          end:     'bottom top',
          scrub:   true,
        },
      });

      // 4 | Product Mockup Reveal: Dashboard rises from below with perspective
      gsap.fromTo(
        heroDashRef.current,
        { y: 60, scale: 0.94 },
        {
          y: 0,
          scale: 1,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: heroDashRef.current,
            start: 'top 95%',
            end: 'top 55%',
            scrub: 1.2,
          },
        }
      );

      // 5 | Stats scrub-in
      gsap.from('.stats-row .stat-block', {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.65,
        ease: 'power2.out',
        clearProps: 'opacity',
        scrollTrigger: {
          trigger: '.stats-section',
          start:   'top 90%',
          once: true,
        },
      });

      // 6 | Feature cells stagger: Crisp 100% opacity, never faded
      gsap.from('[data-feature]', {
        y: 22,
        opacity: 0,
        stagger: 0.06,
        duration: 0.65,
        ease: 'power2.out',
        clearProps: 'opacity',
        scrollTrigger: {
          trigger: '.features-section',
          start:   'top 92%',
          once: true,
        },
      });

      // 7 | Dark band headline reveal
      gsap.from('.dark-headline-word', {
        y: 24,
        opacity: 0,
        stagger: 0.04,
        duration: 0.65,
        ease: 'power2.out',
        clearProps: 'opacity',
        scrollTrigger: {
          trigger: '.dark-section',
          start:   'top 90%',
          once: true,
        },
      });

      // 8 | Model cards fan-in
      gsap.from('.model-card', {
        y: 28,
        scale: 0.97,
        stagger: 0.06,
        duration: 0.7,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '.models-section',
          start:   'top 90%',
          once: true,
        },
      });

      // 9 | Pinned pipeline step reveals
      const pipelineSteps = gsap.utils.toArray<HTMLElement>('.pipeline-step');
      if (pipelineSteps.length) {
        pipelineSteps.forEach((step) => {
          gsap.from(step, {
            x: 20,
            opacity: 0,
            duration: 0.55,
            ease: 'power2.out',
            clearProps: 'opacity',
            scrollTrigger: {
              trigger: step,
              start:   'top 92%',
              once: true,
            },
          });
        });
      }

      // 10 | Dashboard mockup floating cards
      gsap.from('.float-card', {
        y: 25,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '.dashboard-preview-section',
          start:   'top 92%',
          once: true,
        },
      });

      // 11 | CTA inner elements
      gsap.from('.cta-inner > *', {
        y: 20,
        opacity: 0,
        stagger: 0.07,
        duration: 0.7,
        ease: 'power2.out',
        clearProps: 'opacity',
        scrollTrigger: {
          trigger: '.cta-section',
          start:   'top 92%',
          once: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} style={{ overflow: 'hidden' }}>

      {/* ══════════════════════════════════════════════════════════
          SECTION 01 — CINEMATIC HERO WITH PARALLAX SKY
          ══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="hero-section"
        style={{
          minHeight: '100vh',
          width: '100%',
          background: 'transparent',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 80,
          overflow: 'hidden',
        }}
      >
        {/* Layer 1: Primary Sky Background Image with Continuous Fluid Drift */}
        <div
          ref={skyRef}
          className="hero-sky will-change-transform cloud-animated-drift"
          style={{
            backgroundImage: `url('/hero_sky.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
            position: 'absolute',
            inset: '-15%',
            transform: 'scale(1.15)',
            opacity: 0.98,
            transition: 'filter 0.35s ease',
          }}
        />

        {/* Layer 2: Secondary Billowing Translucent Cloud Layer for Depth */}
        <div
          className="cloud-layer-secondary"
          style={{
            backgroundImage: `url('/hero_sky.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 48%',
            position: 'absolute',
            inset: '-15%',
            opacity: 0.45,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        />

        {/* Layer 3: Sunbeam Atmospheric Light Sweep */}
        <div className="sunbeam-glow" />

        {/* Layer 4: 3D Atmospheric Mist Layer */}
        <div className="mist-layer" />

        {/* Ambient Translucent Soft Veil */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.25) 85%, rgba(255,255,255,0.55) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Hero Content */}
        <div
          className="hero-content"
          style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            padding: '130px 24px 0',
            maxWidth: 1040,
            margin: '0 auto',
          }}
        >


          {/* Display Headline - Balanced, Crisp, Elegant SaaS Scale */}
          <h1
            ref={heroTitleRef}
            className="display-xl hero-contrast-text"
            style={{
              marginBottom: 20,
              maxWidth: 860,
              margin: '0 auto 20px',
              fontSize: 'clamp(34px, 4.2vw, 54px)',
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: '#090d16',
            }}
          >
            Turn Customer Data Into{' '}
            <span
              style={{
                display: 'inline-block',
                color: '#1d4ed8',
                fontWeight: 800,
                letterSpacing: '-0.035em',
              }}
            >
              Actionable Intelligence
            </span>
          </h1>

          {/* Subtitle - High contrast, deep, zero fade */}
          <div
            ref={heroSubRef}
            className="body-lg hero-contrast-sub"
            style={{
              maxWidth: 720,
              margin: '0 auto 34px',
              textAlign: 'center',
              fontSize: 17.5,
              lineHeight: 1.6,
              fontWeight: 500,
              color: '#1e293b',
            }}
          >
            Predict churn. Understand customer behavior. Score default risk. Prioritize retention actions.
            Powered by genuine machine learning models, Optuna tuning, and localized SHAP explainability.
          </div>

          {/* Action Button Row - Every Button Triggers Dynamic Cloud Flight */}
          <div
            ref={heroCtaRef}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 56, flexWrap: 'wrap' }}
          >
            <button
              className="btn btn-dark btn-lg"
              onClick={onStartAnalysis}
              style={{
                fontWeight: 700,
                fontSize: 15.5,
                padding: '14px 30px',
                borderRadius: 9999,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22)',
              }}
            >
              <span>Analyze My Business</span>
              <IconArrow />
            </button>
            <button
              className="btn btn-cobalt btn-lg"
              onClick={onExploreDemo}
              style={{
                fontWeight: 700,
                fontSize: 15.5,
                padding: '14px 30px',
                borderRadius: 9999,
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
              }}
            >
              <IconBolt />
              Explore Live Demo •
            </button>
            <button
              className="btn btn-mist btn-lg"
              onClick={() => onNavigate('modellab')}
              style={{
                fontWeight: 600,
                fontSize: 14.5,
                padding: '14px 24px',
                borderRadius: 9999,
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
              }}
            >
              Live Benchmarks →
            </button>
          </div>

          {/* Stats Bar (Glassmorphic High Contrast) */}
          <div
            ref={heroStatsRef}
            className="card"
            style={{
              display: 'flex',
              gap: 36,
              justifyContent: 'space-around',
              padding: '24px 36px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              maxWidth: 820,
              margin: '0 auto',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 16px 40px -10px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(203, 213, 225, 0.8)',
              borderRadius: 22,
            }}
          >
            <div className="stat-block" style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ color: '#1d4ed8', fontWeight: 800, fontSize: 36 }}>7</div>
              <div className="stat-label" style={{ color: '#090d16', fontWeight: 700, fontSize: 13.5 }}>Production Models</div>
            </div>
            <div style={{ width: 1, background: '#cbd5e1' }} />
            <div className="stat-block" style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ color: '#059669', fontWeight: 800, fontSize: 36 }}>94.1%</div>
              <div className="stat-label" style={{ color: '#090d16', fontWeight: 700, fontSize: 13.5 }}>SaaS AUC-ROC</div>
            </div>
            <div style={{ width: 1, background: '#cbd5e1' }} />
            <div className="stat-block" style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ color: '#090d16', fontWeight: 800, fontSize: 36 }}>128k+</div>
              <div className="stat-label" style={{ color: '#090d16', fontWeight: 700, fontSize: 13.5 }}>Training Records</div>
            </div>
            <div style={{ width: 1, background: '#cbd5e1' }} />
            <div className="stat-block" style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ color: '#6d28d9', fontWeight: 800, fontSize: 36 }}>SHAP</div>
              <div className="stat-label" style={{ color: '#090d16', fontWeight: 700, fontSize: 13.5 }}>Explainable AI</div>
            </div>
          </div>
        </div>

        {/* Hero Interactive Dashboard Mockup */}
        <div
          ref={heroDashRef}
          style={{
            position: 'relative',
            zIndex: 10,
            marginTop: 48,
            maxWidth: 920,
            width: '92%',
            margin: '48px auto 0',
          }}
        >
          <div
            className="card"
            style={{
              padding: 24,
              background: '#ffffff',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            }}
          >
            {/* Window Top Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--slate)', marginLeft: 12 }}>
                  ChurnIQ · Model Intelligence Console
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="chip chip-emerald" style={{ fontSize: 11, padding: '3px 9px' }}>
                  <span className="live-dot" style={{ width: 6, height: 6 }} />
                  FastAPI Server 200 OK
                </span>
              </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
              <MetricTile label="High Churn Risk" value="73.2%" delta="4.1pp MoM" deltaType="down" tag="Model XGB" />
              <MetricTile label="At-Risk Accounts" value="2,847" delta="312 flagged" deltaType="down" tag="Queue" />
              <MetricTile label="Protected ARR" value="$412K" delta="30-day forecast" deltaType="up" tag="Saved" />
              <MetricTile label="Production AUC" value="0.941" delta="K-Fold verified" deltaType="up" tag="Live" />
            </div>

            {/* Interactive Trend Chart */}
            <div
              style={{
                background: 'var(--mist)',
                borderRadius: 14,
                padding: '16px 20px',
                border: '1px solid var(--ash)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>
                  12-Month Churn Probability vs. Intervention Impact
                </span>
                <span style={{ fontSize: 12, color: 'var(--cobalt)', fontWeight: 600 }}>
                  Active Cohort #{activeChartIdx + 1}: {activeChartIdx === 10 ? 'Peak Risk (88%)' : 'Standard'}
                </span>
              </div>

              <div
                style={{
                  height: 90,
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 8,
                  padding: '8px 0',
                }}
              >
                {[55, 48, 62, 51, 74, 45, 82, 59, 41, 70, 88, 63].map((h, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveChartIdx(i)}
                    onMouseEnter={() => setActiveChartIdx(i)}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      background:
                        activeChartIdx === i
                          ? 'var(--cobalt-grad)'
                          : i === 10
                          ? 'var(--ink)'
                          : '#cbd5e1',
                      borderRadius: '5px 5px 0 0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: activeChartIdx === i ? 'scaleY(1.06)' : 'scaleY(1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 02 — STATS BAND (HIGH CONTRAST & ACCENTS)
          ══════════════════════════════════════════════════════════ */}
      <section className="stats-section" style={{ padding: '60px 48px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            className="stats-card-container"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              borderRadius: 28,
              padding: '44px 48px',
              boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(203, 213, 225, 0.8)',
            }}
          >
            <div
              className="stats-row"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 40,
              }}
            >
              {[
                {
                  tag: 'MODEL ACCURACY',
                  v: '94.1%',
                  title: 'AUC-ROC Benchmark',
                  sub: 'ChurnIQ SaaS holdout test set',
                  accent: '#1d4ed8',
                },
                {
                  tag: 'FINANCIAL SAVINGS',
                  v: '$412K',
                  title: 'Projected MRR Saved',
                  sub: 'Protected from customer attrition',
                  accent: '#059669',
                },
                {
                  tag: 'PREDICTIVE ENGINES',
                  v: '7',
                  title: 'Production ML Models',
                  sub: 'Tailored across 7 industry sectors',
                  accent: '#090d16',
                },
                {
                  tag: 'AUTHENTIC DATA',
                  v: '128k+',
                  title: 'Training Records',
                  sub: 'Multi-category customer records',
                  accent: '#6d28d9',
                },
              ].map((s, i) => (
                <div className="stat-block" key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase' }}>
                    {s.tag}
                  </div>
                  <div
                    className="stat-number"
                    style={{
                      color: s.accent,
                      fontSize: 'clamp(40px, 4.4vw, 62px)',
                      fontWeight: 800,
                      lineHeight: 1,
                      letterSpacing: '-0.035em',
                    }}
                  >
                    {s.v}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#090d16', marginTop: 4 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#334155' }}>
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 03 — PRODUCT OVERVIEW (EDITORIAL CARDS)
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '60px 48px', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderRadius: 28,
            padding: '52px 48px',
            border: '1px solid rgba(226, 232, 240, 0.95)',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(203, 213, 225, 0.8)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 60,
            alignItems: 'center',
          }}
        >
          <div>
            <div className="section-label" style={{ marginBottom: 16 }}>01 — The Flagship Product</div>
            <h2 className="display-lg" style={{ marginBottom: 22, color: '#090d16' }}>
              Customer retention,<br />powered by mathematics.
            </h2>
            <p className="body-lg" style={{ marginBottom: 18, color: '#1e293b' }}>
              ChurnIQ is the flagship predictive engine in MLVerse. Unlike generic heuristic rules,
              it trains on behavioral feature combinations: contract length, NPS sentiment, support escalation, and usage velocity.
            </p>
            <p className="body-md" style={{ marginBottom: 32, color: '#475569' }}>
              Integrated with SHAP TreeExplainer, every customer score is backed by an exact mathematical attribution of risk drivers.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-cobalt" onClick={onExploreDemo}>
                Open ChurnIQ Console <IconArrow />
              </button>
              <button className="btn btn-light" onClick={() => onNavigate('features')}>
                Explore Feature Store
              </button>
            </div>
          </div>

          {/* Right: Colored Metric Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <MetricTile label="SaaS Churn Rate" value="12.3%" delta="2.4pp retained" deltaType="up" tag="SaaS" />
            <MetricTile label="Customer NPS" value="68" delta="+11 points YoY" deltaType="up" tag="Telecom" />
            <MetricTile label="Model Precision" value="91.4%" delta="Balanced F1" deltaType="up" tag="Banking" />
            <MetricTile label="Average CLV" value="$3,280" delta="+18% optimized" deltaType="up" tag="Retail" />
            <MetricTile label="Engineered Features" value="38" delta="Zero leakage" deltaType="neutral" tag="Catalog" />
            <MetricTile label="Inference Latency" value="22ms" delta="p99 REST endpoint" deltaType="up" tag="FastAPI" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 04 — CAPABILITIES & FEATURE GRID
          ══════════════════════════════════════════════════════════ */}
      <section className="features-section" style={{ padding: '100px 48px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>02 — Platform Architecture</div>
            <h2 className="display-lg">
              Enterprise ML built for<br />production-grade retention.
            </h2>
          </div>

          <div className="feature-grid">
            {[
              {
                icon: '🧠',
                title: 'Model Lab & Benchmarks',
                route: 'modellab',
                body: 'Cross-validation candidate matrix comparing XGBoost, LightGBM, Random Forest, and Logistic Regression with Optuna tuning.',
                color: 'var(--cobalt)',
              },
              {
                icon: '📊',
                title: 'SHAP Explainability',
                route: 'explainability',
                body: 'TreeExplainer attribution for every customer. Global importance rankings and individual waterfall breakdowns.',
                color: 'var(--emerald)',
              },
              {
                icon: '🎯',
                title: 'ChurnIQ Dashboard',
                route: 'churniq',
                body: 'Segment filtering, at-risk customer queue, cohort decay analysis, and automated retention playbooks.',
                color: 'var(--rose)',
              },
              {
                icon: '🔁',
                title: 'Business Analysis Wizard',
                route: 'wizard',
                body: '13-step business onboarding flow: upload CSV, automated EDA, data cleaning, and custom model recommendation.',
                color: 'var(--violet)',
              },
              {
                icon: '📡',
                title: 'Async REST API',
                route: 'api',
                body: 'FastAPI microservice with Swagger documentation. Single-record scoring and batch predictions with sub-30ms p99 latency.',
                color: 'var(--cyan)',
              },
              {
                icon: '📈',
                title: 'Population Drift Monitor',
                route: 'monitoring',
                body: 'Population Stability Index (PSI) tracking and Kolmogorov-Smirnov statistical tests for continuous data drift detection.',
                color: 'var(--amber)',
              },
              {
                icon: '🗄️',
                title: 'Feature Store Catalog',
                route: 'features',
                body: '38 canonical features with domain-specific transformations, SQL templates, and missing value imputation rules.',
                color: 'var(--cobalt)',
              },
              {
                icon: '💳',
                title: 'CreditRiskIQ Module',
                route: 'creditriskiq',
                body: 'Loan default probability modeling, underwriter risk tiering, and exposure-at-default calculations.',
                color: 'var(--emerald)',
              },
              {
                icon: '🛒',
                title: 'CommerceIQ Funnel Engine',
                route: 'commerceiq',
                body: 'Purchase intent probability, cart abandonment risk scoring, and customer lifetime value (CLV) estimations.',
                color: 'var(--rose)',
              },
            ].map((f, i) => (
              <div
                className="feature-cell cursor-pointer group hover:bg-slate-50/80 transition-all"
                key={i}
                data-feature
                onClick={() => onNavigate(f.route)}
                role="button"
                tabIndex={0}
              >
                <div className="feature-icon group-hover:scale-105 transition-transform" style={{ color: f.color }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                    {f.title} →
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#334155', fontWeight: 450 }}>
                    {f.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 05 — DARK BAND: 7 EXPERT MODELS
          ══════════════════════════════════════════════════════════ */}
      <section
        className="dark-section"
        style={{
          background: 'var(--dark-band)',
          padding: '100px 48px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Sapphire Radial Glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 400,
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ marginBottom: 60 }}>
            <div
              className="section-label"
              style={{ marginBottom: 20, color: 'var(--cobalt-light)' }}
            >
              03 — Specialized Intelligence
            </div>
            <h2 style={{ display: 'flex', flexWrap: 'wrap', gap: '0 16px' }}>
              {['7', 'Expert', 'Models.', 'Zero', 'Synthetic', 'Data.'].map((w, i) => (
                <span
                  key={i}
                  className="dark-headline-word"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(42px, 5.5vw, 76px)',
                    fontWeight: 700,
                    letterSpacing: '-0.035em',
                    color: i < 3 ? '#ffffff' : '#e2e8f0',
                  }}
                >
                  {w}
                </span>
              ))}
            </h2>
          </div>

          {/* Model Cards Grid */}
          <div
            className="models-section"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}
          >
            {[
              {
                name: 'ChurnIQ SaaS',
                route: 'churniq',
                auc: '94.1%',
                algo: 'XGBoost',
                domain: 'SaaS & Subscriptions',
                badge: '🏆 Best Model',
                color: 'var(--emerald)',
              },
              {
                name: 'ChurnIQ Telecom',
                route: 'churniq',
                auc: '91.7%',
                algo: 'LightGBM',
                domain: 'Telecommunications',
                badge: '⚡ Sub-20ms',
                color: 'var(--cobalt-light)',
              },
              {
                name: 'ChurnIQ Banking',
                route: 'churniq',
                auc: '89.3%',
                algo: 'XGBoost',
                domain: 'Retail Banking',
                badge: '🛡️ Basel II',
                color: 'var(--violet)',
              },
              {
                name: 'ChurnIQ E-Commerce',
                route: 'commerceiq',
                auc: '87.9%',
                algo: 'RF + LGBM',
                domain: 'Online Commerce',
                badge: '🛒 Conversion',
                color: 'var(--rose)',
              },
              {
                name: 'RetailIQ CLV',
                route: 'retailiq',
                auc: '88.5%',
                algo: 'XGBoost',
                domain: 'RFM & Lifetime Value',
                badge: '📦 Multi-Touch',
                color: 'var(--amber)',
              },
              {
                name: 'CreditRiskIQ',
                route: 'creditriskiq',
                auc: '90.2%',
                algo: 'LightGBM',
                domain: 'Loan Underwriting',
                badge: '💳 Risk Rating',
                color: 'var(--cobalt-light)',
              },
              {
                name: 'CommerceIQ Propensity',
                route: 'commerceiq',
                auc: '86.4%',
                algo: 'XGBoost',
                domain: 'Purchase Intent',
                badge: '🎯 Propensity',
                color: 'var(--emerald)',
              },
            ].map((m, i) => (
              <div
                key={i}
                className="model-card card-dark hover:border-blue-500/50 transition-all cursor-pointer"
                style={{
                  padding: '24px 20px',
                  cursor: 'pointer',
                }}
                onClick={() => onNavigate(m.route)}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 14,
                  }}
                >
                  <div style={{ fontSize: 12.5, color: '#cbd5e1', fontWeight: 600 }}>
                    {m.domain}
                  </div>
                  {m.badge && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        background: 'rgba(255,255,255,0.08)',
                        color: m.color,
                        borderRadius: 9999,
                        padding: '3px 8px',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      {m.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 6 }}>
                  {m.name}
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    letterSpacing: '-0.035em',
                    color: m.color,
                    marginBottom: 4,
                  }}
                >
                  {m.auc}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>AUC-ROC · {m.algo}</div>
              </div>
            ))}

            {/* Custom Architecture Card */}
            <div
              className="card-dark"
              style={{
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed rgba(255,255,255,0.2)',
                cursor: 'pointer',
              }}
              onClick={() => onNavigate('profile')}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>
                Lead ML Engineer
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                View Full Technical Portfolio →
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ marginTop: 48, display: 'flex', gap: 14 }}>
            <button className="btn btn-cobalt" onClick={() => onNavigate('modellab')}>
              View Benchmark Matrix
            </button>
            <button className="btn btn-ghost" onClick={() => onNavigate('explainability')}>
              Inspect SHAP Explainability
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 06 — INTERACTIVE WORKFLOW & LIVE API
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 48px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ marginBottom: 60 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>04 — Developer Workflow</div>
            <h2 className="display-lg">
              From raw telemetry<br />to automated intervention.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 70,
              alignItems: 'start',
            }}
          >
            {/* Left: 5 Workflow Steps */}
            <div>
              {[
                {
                  n: '01',
                  title: 'Data Ingestion & Schema Profiling',
                  body: 'Upload any customer CSV or stream records. The ingestion engine validates types, handles nulls, and auto-detects domain vertical.',
                },
                {
                  n: '02',
                  title: 'Feature Engineering Pipeline',
                  body: 'Transforms raw attributes into 38 canonical behavioral signals: usage momentum, ticket escalation ratios, and contract tenure.',
                },
                {
                  n: '03',
                  title: 'Parallel Model Evaluation',
                  body: 'XGBoost, LightGBM, and Random Forest are trained with stratified K-Fold cross-validation and Optuna hyperparameter sweeps.',
                },
                {
                  n: '04',
                  title: 'SHAP Explainability Calculation',
                  body: 'TreeExplainer attribution identifies exact top drivers per customer, generating personalized retention recommendations.',
                },
                {
                  n: '05',
                  title: 'Production Scoring & Webhooks',
                  body: 'FastAPI serves predictions in under 25ms. Automated webhooks notify CRM and customer success teams for high-risk accounts.',
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="pipeline-step"
                  style={{
                    display: 'flex',
                    gap: 20,
                    padding: '24px 0',
                    borderBottom: i < 4 ? '1px solid var(--ash)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--cobalt)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {s.n}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
                      {s.title}
                    </div>
                    <div className="body-sm">{s.body}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Live Interactive Code Block */}
            <div style={{ position: 'sticky', top: 120 }}>
              <div
                className="card"
                style={{
                  padding: 28,
                  background: 'var(--dark-band)',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--cobalt-light)', letterSpacing: '0.08em' }}>
                    POST /api/predict/churn
                  </span>
                  <span className="chip chip-emerald" style={{ fontSize: 10, padding: '2px 8px' }}>
                    Status: 200 OK
                  </span>
                </div>

                <div style={{ color: '#94a3b8', lineHeight: 1.8 }}>
                  <div>{'{'}</div>
                  <div style={{ paddingLeft: 18 }}>
                    <span style={{ color: 'var(--emerald)' }}>"customer_id"</span>: <span style={{ color: '#93c5fd' }}>"C-0847"</span>,
                  </div>
                  <div style={{ paddingLeft: 18 }}>
                    <span style={{ color: 'var(--emerald)' }}>"tenure_months"</span>: <span style={{ color: '#f59e0b' }}>24</span>,
                  </div>
                  <div style={{ paddingLeft: 18 }}>
                    <span style={{ color: 'var(--emerald)' }}>"monthly_charges"</span>: <span style={{ color: '#f59e0b' }}>89.50</span>,
                  </div>
                  <div style={{ paddingLeft: 18 }}>
                    <span style={{ color: 'var(--emerald)' }}>"support_tickets"</span>: <span style={{ color: '#f59e0b' }}>3</span>,
                  </div>
                  <div style={{ paddingLeft: 18 }}>
                    <span style={{ color: 'var(--emerald)' }}>"domain"</span>: <span style={{ color: '#93c5fd' }}>"saas"</span>
                  </div>
                  <div>{'}'}</div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0' }} />

                <div style={{ color: '#94a3b8', lineHeight: 1.8 }}>
                  <div style={{ color: 'var(--cobalt-light)', fontWeight: 600 }}>Response JSON:</div>
                  <div style={{ paddingLeft: 18 }}>
                    <span style={{ color: 'var(--emerald)' }}>"churn_probability"</span>: <span style={{ color: 'var(--rose)', fontWeight: 700 }}>0.731</span>,
                  </div>
                  <div style={{ paddingLeft: 18 }}>
                    <span style={{ color: 'var(--emerald)' }}>"risk_tier"</span>: <span style={{ color: 'var(--rose)', fontWeight: 700 }}>"HIGH"</span>,
                  </div>
                  <div style={{ paddingLeft: 18 }}>
                    <span style={{ color: 'var(--emerald)' }}>"top_drivers"</span>: [
                  </div>
                  <div style={{ paddingLeft: 36, color: '#93c5fd' }}>"support_ticket_frequency",</div>
                  <div style={{ paddingLeft: 36, color: '#93c5fd' }}>"contract_renewal_status"</div>
                  <div style={{ paddingLeft: 18 }}>],</div>
                  <div style={{ paddingLeft: 18 }}>
                    <span style={{ color: 'var(--emerald)' }}>"latency_ms"</span>: <span style={{ color: '#f59e0b' }}>18.4</span>
                  </div>
                </div>

                <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
                  <button className="btn btn-cobalt btn-sm" onClick={() => onNavigate('api')}>
                    Try REST API Explorer
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={onExploreDemo}>
                    Open Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 07 — CALL TO ACTION (LUMINOUS OBSIDIAN)
          ══════════════════════════════════════════════════════════ */}
      <section
        className="cta-section"
        style={{
          background: 'var(--dark-band)',
          padding: '120px 48px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div className="cta-inner" style={{ maxWidth: 740, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <span
              className="chip chip-cobalt"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                padding: '6px 16px',
              }}
            >
              <span className="live-dot" />
              Live Platform · FastAPI Running on Port 8000
            </span>
          </div>

          <h2 className="display-lg on-dark" style={{ marginBottom: 20 }}>
            Start retaining high-value accounts today.
          </h2>

          <p className="body-lg on-dark" style={{ marginBottom: 40 }}>
            Ready to test on your own data or explore pre-trained benchmarks?
            All 7 expert models are deployed and ready for live scoring.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-cobalt btn-lg"
              onClick={onExploreDemo}
              style={{ fontWeight: 600 }}
            >
              <IconBolt />
              Launch ChurnIQ Dashboard
            </button>
            <button
              className="btn btn-ghost btn-lg"
              onClick={onStartAnalysis}
              style={{ fontWeight: 600 }}
            >
              Run Business Analysis
            </button>
          </div>

          {/* Direct Navigation Links */}
          <div
            style={{
              marginTop: 60,
              display: 'flex',
              justifyContent: 'center',
              gap: 32,
              flexWrap: 'wrap',
            }}
          >
            {[
              { l: 'Model Benchmarks', v: 'modellab' },
              { l: 'SHAP Explainability', v: 'explainability' },
              { l: 'Feature Catalog', v: 'features' },
              { l: 'Drift Monitoring', v: 'monitoring' },
              { l: 'API Explorer', v: 'api' },
              { l: 'ML Portfolio', v: 'profile' },
            ].map(item => (
              <button
                key={item.v}
                onClick={() => onNavigate(item.v)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: 13.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                  padding: '4px 6px',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
              >
                {item.l}
              </button>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '40px 0 24px' }} />

          <div style={{ fontSize: 12.5, color: '#64748b' }}>
            MLVerse Platform · ChurnIQ · Built with FastAPI, XGBoost, LightGBM, React & GSAP.
          </div>
        </div>
      </section>

    </div>
  );
}

export default LandingPage;
