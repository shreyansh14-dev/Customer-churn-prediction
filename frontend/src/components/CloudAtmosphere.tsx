import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface CloudAtmosphereProps {
  currentView: string;
}

interface CloudModeConfig {
  name: string;
  panDuration: number;
  scale: number;
  filter: string;
  gradientOverlay: string;
  driftDirection: string;
  particleColor: string;
  bloomColor: string;
  speedMultiplier: number;
}

const VIEW_CONFIGS: Record<string, CloudModeConfig> = {
  landing: {
    name: 'Serene Stratosphere',
    panDuration: 20,
    scale: 1.15,
    filter: 'brightness(1.02) contrast(1.02) saturate(1.05)',
    gradientOverlay: 'linear-gradient(180deg, rgba(239, 246, 255, 0.25) 0%, rgba(255, 255, 255, 0.45) 50%, rgba(255, 255, 255, 0.85) 100%)',
    driftDirection: 'pan-horizontal',
    particleColor: 'rgba(255, 255, 255, 0.7)',
    bloomColor: 'rgba(191, 219, 254, 0.45)',
    speedMultiplier: 1.0,
  },
  churniq: {
    name: 'Bloomberg Terminal Storm Horizon',
    panDuration: 9,
    scale: 1.25,
    filter: 'brightness(0.58) contrast(1.35) hue-rotate(212deg) saturate(1.3)',
    gradientOverlay: 'radial-gradient(ellipse at 50% 20%, rgba(14, 165, 233, 0.15) 0%, rgba(10, 15, 29, 0.78) 55%, rgba(6, 9, 18, 0.94) 100%)',
    driftDirection: 'pan-fast-lateral',
    particleColor: 'rgba(56, 189, 248, 0.85)',
    bloomColor: 'rgba(37, 99, 235, 0.65)',
    speedMultiplier: 2.2,
  },
  customers: {
    name: 'Bloomberg Terminal Storm Horizon',
    panDuration: 9,
    scale: 1.25,
    filter: 'brightness(0.58) contrast(1.35) hue-rotate(212deg) saturate(1.3)',
    gradientOverlay: 'radial-gradient(ellipse at 50% 20%, rgba(14, 165, 233, 0.15) 0%, rgba(10, 15, 29, 0.78) 55%, rgba(6, 9, 18, 0.94) 100%)',
    driftDirection: 'pan-fast-lateral',
    particleColor: 'rgba(56, 189, 248, 0.85)',
    bloomColor: 'rgba(37, 99, 235, 0.65)',
    speedMultiplier: 2.2,
  },
  commerceiq: {
    name: 'Golden Hour E-Commerce Jetstream',
    panDuration: 13,
    scale: 1.18,
    filter: 'brightness(1.08) contrast(1.05) hue-rotate(335deg) saturate(1.35)',
    gradientOverlay: 'linear-gradient(135deg, rgba(254, 243, 199, 0.3) 0%, rgba(255, 255, 255, 0.6) 60%, rgba(255, 255, 255, 0.92) 100%)',
    driftDirection: 'pan-diagonal',
    particleColor: 'rgba(251, 191, 36, 0.65)',
    bloomColor: 'rgba(245, 158, 11, 0.4)',
    speedMultiplier: 1.4,
  },
  retailiq: {
    name: 'Royal Cobalt Stratocumulus',
    panDuration: 14,
    scale: 1.2,
    filter: 'brightness(0.92) contrast(1.15) hue-rotate(225deg) saturate(1.4)',
    gradientOverlay: 'linear-gradient(180deg, rgba(224, 231, 255, 0.35) 0%, rgba(243, 244, 246, 0.6) 50%, rgba(255, 255, 255, 0.9) 100%)',
    driftDirection: 'pan-horizontal',
    particleColor: 'rgba(99, 102, 241, 0.7)',
    bloomColor: 'rgba(79, 70, 229, 0.4)',
    speedMultiplier: 1.3,
  },
  creditriskiq: {
    name: 'Severe Underwriter Thunderhead',
    panDuration: 10,
    scale: 1.28,
    filter: 'brightness(0.72) contrast(1.38) sepia(0.2) hue-rotate(195deg)',
    gradientOverlay: 'radial-gradient(circle at 60% 10%, rgba(245, 158, 11, 0.22) 0%, rgba(15, 23, 42, 0.72) 65%, rgba(15, 23, 42, 0.92) 100%)',
    driftDirection: 'pan-turbulent',
    particleColor: 'rgba(245, 158, 11, 0.85)',
    bloomColor: 'rgba(217, 119, 6, 0.55)',
    speedMultiplier: 1.9,
  },
  modellab: {
    name: 'Ionized Matrix Cirrus',
    panDuration: 11,
    scale: 1.22,
    filter: 'brightness(0.68) contrast(1.25) hue-rotate(155deg) saturate(1.3)',
    gradientOverlay: 'radial-gradient(circle at 40% 15%, rgba(16, 185, 129, 0.2) 0%, rgba(11, 19, 32, 0.75) 60%, rgba(6, 11, 19, 0.92) 100%)',
    driftDirection: 'pan-fast-lateral',
    particleColor: 'rgba(52, 211, 153, 0.8)',
    bloomColor: 'rgba(16, 185, 129, 0.5)',
    speedMultiplier: 1.7,
  },
  explainability: {
    name: 'Ultraviolet Auroral High-Sky',
    panDuration: 15,
    scale: 1.2,
    filter: 'brightness(0.72) contrast(1.2) hue-rotate(265deg) saturate(1.45)',
    gradientOverlay: 'radial-gradient(circle at 50% 25%, rgba(168, 85, 247, 0.25) 0%, rgba(15, 12, 28, 0.75) 65%, rgba(9, 7, 18, 0.93) 100%)',
    driftDirection: 'pan-vertical',
    particleColor: 'rgba(192, 132, 252, 0.85)',
    bloomColor: 'rgba(147, 51, 234, 0.55)',
    speedMultiplier: 1.2,
  },
  wizard: {
    name: 'Morning Ascent Cumulus',
    panDuration: 17,
    scale: 1.14,
    filter: 'brightness(1.1) contrast(1.04) saturate(1.15)',
    gradientOverlay: 'linear-gradient(180deg, rgba(224, 242, 254, 0.4) 0%, rgba(255, 255, 255, 0.65) 55%, rgba(255, 255, 255, 0.94) 100%)',
    driftDirection: 'pan-ascending',
    particleColor: 'rgba(255, 255, 255, 0.9)',
    bloomColor: 'rgba(56, 189, 248, 0.4)',
    speedMultiplier: 1.1,
  },
  features: {
    name: 'Wide Horizon Panoramic Drift',
    panDuration: 18,
    scale: 1.16,
    filter: 'brightness(0.96) contrast(1.08) hue-rotate(205deg) saturate(1.1)',
    gradientOverlay: 'linear-gradient(180deg, rgba(241, 245, 249, 0.4) 0%, rgba(255, 255, 255, 0.7) 60%, rgba(255, 255, 255, 0.95) 100%)',
    driftDirection: 'pan-horizontal',
    particleColor: 'rgba(148, 163, 184, 0.7)',
    bloomColor: 'rgba(96, 165, 250, 0.35)',
    speedMultiplier: 1.0,
  },
  datasets: {
    name: 'Deep Troposphere Cloud Floor',
    panDuration: 19,
    scale: 1.15,
    filter: 'brightness(0.98) contrast(1.06) hue-rotate(200deg)',
    gradientOverlay: 'linear-gradient(180deg, rgba(240, 249, 255, 0.4) 0%, rgba(255, 255, 255, 0.72) 60%, rgba(255, 255, 255, 0.96) 100%)',
    driftDirection: 'pan-horizontal',
    particleColor: 'rgba(186, 230, 253, 0.8)',
    bloomColor: 'rgba(59, 130, 246, 0.35)',
    speedMultiplier: 0.9,
  },
  monitoring: {
    name: 'Telemetry Radar Pulse Sky',
    panDuration: 11,
    scale: 1.24,
    filter: 'brightness(0.64) contrast(1.3) hue-rotate(205deg) saturate(1.2)',
    gradientOverlay: 'radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.2) 0%, rgba(10, 18, 30, 0.78) 60%, rgba(5, 10, 18, 0.94) 100%)',
    driftDirection: 'pan-radar',
    particleColor: 'rgba(34, 211, 238, 0.85)',
    bloomColor: 'rgba(6, 182, 212, 0.5)',
    speedMultiplier: 1.8,
  },
  api: {
    name: 'Midnight Terminal Starlight Sky',
    panDuration: 14,
    scale: 1.25,
    filter: 'brightness(0.48) contrast(1.4) hue-rotate(180deg) saturate(1.25)',
    gradientOverlay: 'radial-gradient(circle at 45% 20%, rgba(16, 185, 129, 0.15) 0%, rgba(8, 12, 20, 0.85) 65%, rgba(3, 5, 10, 0.97) 100%)',
    driftDirection: 'pan-fast-lateral',
    particleColor: 'rgba(74, 222, 128, 0.85)',
    bloomColor: 'rgba(16, 185, 129, 0.45)',
    speedMultiplier: 1.5,
  },
  profile: {
    name: 'Executive Twilight Aviation Cloudscape',
    panDuration: 16,
    scale: 1.18,
    filter: 'brightness(0.78) contrast(1.2) hue-rotate(240deg) saturate(1.2)',
    gradientOverlay: 'linear-gradient(180deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.75) 60%, rgba(10, 15, 29, 0.95) 100%)',
    driftDirection: 'pan-diagonal',
    particleColor: 'rgba(165, 180, 252, 0.75)',
    bloomColor: 'rgba(99, 102, 241, 0.45)',
    speedMultiplier: 1.1,
  },
};

export const CloudAtmosphere: React.FC<CloudAtmosphereProps> = ({ currentView }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const primarySkyRef = useRef<HTMLDivElement>(null);
  const secondarySkyRef = useRef<HTMLDivElement>(null);
  const sunbeamRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  const cfg = VIEW_CONFIGS[currentView] || VIEW_CONFIGS.landing;

  // Smooth GSAP transition whenever currentView changes
  useEffect(() => {
    if (!primarySkyRef.current || !secondarySkyRef.current || !maskRef.current) return;

    // Cross-fade atmospheric scale and opacity with GPU acceleration
    gsap.to(primarySkyRef.current, {
      scale: cfg.scale,
      duration: 1.0,
      ease: 'power2.out',
      force3D: true,
    });

    gsap.to(secondarySkyRef.current, {
      opacity: currentView === 'landing' ? 0.45 : 0.65,
      duration: 1.0,
      ease: 'power2.out',
      force3D: true,
    });

    gsap.to(maskRef.current, {
      background: cfg.gradientOverlay,
      duration: 1.4,
      ease: 'power2.out',
    });

    if (sunbeamRef.current) {
      gsap.to(sunbeamRef.current, {
        background: `radial-gradient(ellipse at 50% 25%, ${cfg.bloomColor} 0%, rgba(255, 255, 255, 0) 70%)`,
        duration: 1.4,
        ease: 'power2.out',
      });
    }
  }, [currentView, cfg]);

  // Subtle interactive mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!primarySkyRef.current || !secondarySkyRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 36;
      const y = (e.clientY / window.innerHeight - 0.5) * 22;

      gsap.to(primarySkyRef.current, {
        x: x * 0.8,
        y: y * 0.8,
        duration: 1.8,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      gsap.to(secondarySkyRef.current, {
        x: -x * 0.5,
        y: -y * 0.5,
        duration: 2.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* Layer 1: Primary High-Altitude Cloud Photography */}
      <div
        ref={primarySkyRef}
        className="cloud-atmosphere-primary absolute inset-[-18%] will-change-transform"
        style={{
          backgroundImage: `url('/hero_sky.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 38%',
          filter: cfg.filter,
          transform: `scale(${cfg.scale})`,
          animation: `cloudPanFluid ${cfg.panDuration}s ease-in-out infinite alternate`,
        }}
      />

      {/* Layer 2: Secondary Billowing Translucent Cloud Layer (Counter-Drift for 3D Volume) */}
      <div
        ref={secondarySkyRef}
        className="cloud-atmosphere-secondary absolute inset-[-18%] will-change-transform"
        style={{
          backgroundImage: `url('/hero_sky.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 52%',
          mixBlendMode: currentView === 'churniq' || currentView === 'creditriskiq' ? 'color-dodge' : 'screen',
          opacity: 0.55,
          filter: cfg.filter,
          animation: `cloudBillowDrift ${Math.round(cfg.panDuration * 0.85)}s ease-in-out infinite alternate`,
        }}
      />

      {/* Layer 3: Dynamic Sunbeam & Atmospheric Glow */}
      <div
        ref={sunbeamRef}
        className="absolute inset-[-12%] pointer-events-none will-change-transform"
        style={{
          background: `radial-gradient(ellipse at 50% 25%, ${cfg.bloomColor} 0%, rgba(255, 255, 255, 0) 70%)`,
          animation: 'sunbeamPulse 7s ease-in-out infinite alternate',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 4: Floating Atmospheric Mist */}
      <div
        className="mist-layer"
        style={{
          opacity: currentView === 'churniq' ? 0.35 : 0.6,
        }}
      />

      {/* Layer 5: Dynamic Page Color Grading Gradient Mask */}
      <div
        ref={maskRef}
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: cfg.gradientOverlay,
        }}
      />

      {/* Live Atmospheric Telemetry Pill */}
      <div
        className="absolute top-12 right-6 z-10 px-3 py-1 rounded-full text-[10.5px] font-mono tracking-wider uppercase flex items-center gap-2 border transition-all duration-700 opacity-60 hover:opacity-100"
        style={{
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          color: cfg.particleColor,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-ping"
          style={{ background: cfg.particleColor }}
        />
        <span>ATMOSPHERE · {cfg.name}</span>
      </div>
    </div>
  );
};
