import React, { useEffect, useState } from 'react';

export function PageLoader({ onComplete }) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setIsLeaving(true), 900);
    const completeTimer = window.setTimeout(onComplete, 1250);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`page-loader fixed inset-0 z-[100] flex items-center justify-center bg-white transition-all duration-500 ${
        isLeaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading LeadHive AI"
    >
      <div className="flex flex-col items-center px-6">
        <img src="/leadhive-logo.png" alt="LeadHive AI" className="h-12 w-auto object-contain sm:h-14" />
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">
          Initializing Lead Intelligence
        </p>

        <div className="mt-7 h-[3px] w-60 overflow-hidden rounded-full bg-slate-200 sm:w-72">
          <span className="loader-progress block h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500" />
        </div>
      </div>
      <span className="sr-only">Preparing your experience...</span>
    </div>
  );
}
