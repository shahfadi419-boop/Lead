import React, { useEffect, useState } from 'react';
import {
  Activity,
  Eye,
  FileCheck2,
  MessageCircle,
  Trophy,
} from 'lucide-react';

export function OperatingModel() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    {
      number: '01', title: 'Understand', icon: Eye, signal: 'Signal detected',
      description: 'Turn every incoming message into a clear understanding of customer intent.',
      details: ['Multi-lingual context', 'Buying-signal detection', 'Channel classification'],
    },
    {
      number: '02', title: 'Engage', icon: MessageCircle, signal: 'Context in motion',
      description: 'Respond with timely, natural conversation that stays true to your business.',
      details: ['Approved knowledge', 'Channel-native dialogue', 'Conversation memory'],
    },
    {
      number: '03', title: 'Qualify', icon: FileCheck2, signal: 'Intent verified',
      description: 'Surface the requirements, timing and purchasing power that shape a real opportunity.',
      details: ['Needs & preferences', 'Budget & timeline', 'Readiness validation'],
    },
    {
      number: '04', title: 'Prioritize', icon: Trophy, signal: 'Ready for action',
      description: 'Deliver your team a prioritized next move, with the complete context behind it.',
      details: ['Opportunity scoring', 'Next-best action', 'Sales-ready handover'],
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((currentStep) => (currentStep + 1) % steps.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [steps.length]);

  return (
    <section id="operating-model" className="relative isolate overflow-hidden border-y border-slate-100 bg-gradient-to-b from-white via-sky-50/50 to-white py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(14,165,233,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.055)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute -left-48 top-16 h-96 w-96 rounded-full bg-cyan-300/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-blue-200/35 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-800 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-200" />
              </span>
              Intelligence pipeline
            </div>
            <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
              From signal to <span className="text-cyan-600">sales action.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              LeadHive AI turns high-volume conversations into focused, sales-ready decisions without losing the context that makes every customer unique.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start rounded-2xl border border-white/80 bg-white/85 p-3 shadow-[0_12px_35px_-20px_rgba(8,145,178,0.35)] backdrop-blur-sm lg:self-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
              <Activity className="h-5 w-5 animate-pulse motion-reduce:animate-none" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">System status</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">Processing live signals</p>
            </div>
          </div>
        </div>

        <div className="relative mt-14">
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-12 hidden h-px bg-gradient-to-r from-cyan-200 via-cyan-500 to-emerald-300 lg:block" />
          <div className="pointer-events-none absolute left-[12%] top-[45px] hidden h-3 w-3 rounded-full border-2 border-white bg-cyan-500 shadow-[0_0_18px_5px_rgba(6,182,212,0.48)] animate-process-flow motion-reduce:animate-none lg:block" />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;

              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  aria-pressed={isActive}
                  className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 sm:p-6 ${
                    isActive
                      ? 'border-cyan-400 bg-gradient-to-b from-cyan-50 to-white shadow-[0_24px_70px_-30px_rgba(8,145,178,0.42)] lg:-translate-y-3'
                      : 'border-white/90 bg-white/80 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.28)] hover:-translate-y-1 hover:border-cyan-200 hover:bg-white'
                  }`}
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-500 ${isActive ? 'border-brand-300 bg-brand-500 text-white shadow-[0_0_30px_rgba(43,191,221,0.32)]' : 'border-slate-200 bg-slate-50 text-cyan-600 group-hover:border-cyan-200 group-hover:bg-cyan-50'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold tracking-[0.16em] text-slate-400">{step.number}</span>
                  </div>

                  <div className="mt-8">
                    <p className={`text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${isActive ? 'text-cyan-700' : 'text-slate-400'}`}>{step.signal}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{step.title}</h3>
                    <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-slate-600">{step.description}</p>
                  </div>

                  <ul className="mt-6 space-y-2 border-t border-slate-100 pt-5">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-xs text-slate-500">
                        <span className={`h-1.5 w-1.5 rounded-full transition-colors ${isActive ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.75)]' : 'bg-slate-300'}`} />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] font-medium">
                    <span className="text-slate-500">Stage {index + 1} / 4</span>
                    <span className={`flex items-center gap-1.5 transition-colors ${isActive ? 'text-cyan-700' : 'text-slate-400'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-cyan-500 animate-pulse motion-reduce:animate-none' : 'bg-slate-300'}`} />
                      {isActive ? 'Active' : 'Standby'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
