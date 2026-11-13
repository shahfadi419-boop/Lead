import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  Filter,
  Home,
  MapPin,
  MessageCircleMore,
  Sparkles,
  Target,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { ChannelIcon } from '../common/ChannelIcon';
import { analytics } from '../../services/analytics';

const channels = [
  { name: 'Facebook', channel: 'facebook' },
  { name: 'Instagram', channel: 'instagram' },
  { name: 'WhatsApp Business', channel: 'whatsapp' },
  { name: 'YouTube', channel: 'youtube' },
  { name: 'Website Chat', channel: 'website' },
  { name: 'TikTok', channel: 'tiktok' },
  { name: 'Snapchat', channel: 'snapchat' },
];

const processSteps = [
  { label: 'Engage', detail: 'Responds on every channel', icon: MessageCircleMore },
  { label: 'Understand', detail: 'Identifies intent and needs', icon: BrainCircuit },
  { label: 'Qualify', detail: 'Captures buying signals', icon: Filter },
  { label: 'Prioritize', detail: 'Scores every opportunity', icon: BarChart3 },
  { label: 'Handover', detail: 'Routes leads to your team', icon: UsersRound },
];

export function Hero({ onNavigate }) {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((step) => (step + 1) % processSteps.length);
    }, 1700);
    return () => window.clearInterval(interval);
  }, []);

  const openExperience = () => {
    analytics.track('experience_started', { trigger: 'hero_primary_cta', destination: 'sandboxes' });
    onNavigate('sandboxes');
  };

  return (
    <section className="hero-premium relative isolate overflow-hidden border-b border-slate-100 bg-white">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -left-48 top-24 h-[32rem] w-[32rem] rounded-full bg-cyan-50 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-0 h-[34rem] w-[34rem] rounded-full bg-sky-50 blur-[130px]" />

      <div className="relative mx-auto grid min-h-[calc(100svh-73px)] max-w-[90rem] items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-16 xl:gap-12">
        <div className="lg:col-span-5">
          <div className="hero-reveal inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-800 shadow-[0_8px_28px_-20px_rgba(8,145,178,0.55)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            Autonomous Sales Intelligence
          </div>

          <h1 className="hero-reveal hero-reveal-delay-1 mt-7 text-4xl font-extrabold leading-none tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Every<br />
            Conversation.<br />
            <span className="text-brand-500">An Opportunity.</span>
          </h1>

          <h2 className="hero-reveal hero-reveal-delay-2 mt-7 max-w-xl text-xl font-bold leading-tight tracking-[-0.025em] text-slate-800 sm:text-2xl">
            Autonomous Sales Intelligence Across Every Channel.
          </h2>

          <p className="hero-reveal hero-reveal-delay-2 mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            LeadHive AI understands customer conversations, identifies buying intent, qualifies prospects and prioritizes opportunities, giving your sales team the intelligence to focus on closing.
          </p>

          <div className="hero-reveal hero-reveal-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={openExperience}
              className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-6 text-sm font-bold text-white shadow-[0_18px_42px_-18px_rgba(6,182,212,0.62)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
            >
              <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              Experience the Magic
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <a
              href="#operating-model"
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 shadow-[0_12px_32px_-26px_rgba(15,23,42,0.3)] transition-all duration-300 hover:border-cyan-200 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
            >
              Discover How It Works
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        <div className="hero-reveal hero-reveal-delay-2 relative lg:col-span-7">
          <div className="pointer-events-none absolute -inset-5 rounded-[3rem] bg-cyan-100/60 blur-3xl" />

          <div className="conversion-visual relative overflow-hidden rounded-[2rem] border border-cyan-100 bg-white/95 p-3 shadow-[0_38px_90px_-45px_rgba(8,145,178,0.38)] backdrop-blur sm:p-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_34%,rgba(34,211,238,0.14),transparent_27%),radial-gradient(circle_at_95%_100%,rgba(14,165,233,0.08),transparent_30%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

            <div className="relative flex items-center justify-between border-b border-slate-100 px-2 pb-3 sm:px-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">From conversation to conversion</p>
                <p className="mt-1 text-sm font-extrabold tracking-tight text-slate-900">Multi-channel intelligence, working live</p>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50/80 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-cyan-800 sm:flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500 motion-reduce:animate-none" />
                Live AI processing
              </span>
            </div>

            <div className="relative mt-3 sm:h-[340px]">
              <svg className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block" viewBox="0 0 700 340" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="signalGradient" x1="0" x2="1">
                    <stop offset="0" stopColor="#a5f3fc" />
                    <stop offset="0.62" stopColor="#22d3ee" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                  <filter id="signalGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                {[40, 82, 124, 166, 208, 250, 292].map((y, index) => (
                  <path key={y} d={`M 145 ${y} C 220 ${y}, 216 170, 306 170`} className={`hero-signal-path hero-signal-path-${index + 1}`} />
                ))}
                <path d="M 390 170 C 424 170, 430 170, 462 170" className="hero-output-path" />
                <circle r="4" fill="#22d3ee" filter="url(#signalGlow)" className="hero-signal-dot">
                  <animateMotion dur="3.2s" repeatCount="indefinite" path="M 145 40 C 220 40, 216 170, 306 170" />
                </circle>
                <circle r="4" fill="#22d3ee" filter="url(#signalGlow)" className="hero-signal-dot">
                  <animateMotion dur="3.2s" begin="-1.1s" repeatCount="indefinite" path="M 145 166 C 220 166, 216 170, 306 170" />
                </circle>
                <circle r="4" fill="#22d3ee" filter="url(#signalGlow)" className="hero-signal-dot">
                  <animateMotion dur="3.2s" begin="-2.1s" repeatCount="indefinite" path="M 145 292 C 220 292, 216 170, 306 170" />
                </circle>
                <circle r="4.5" fill="#06b6d4" filter="url(#signalGlow)">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M 390 170 C 424 170, 430 170, 462 170" />
                </circle>
              </svg>

              <div className="relative grid gap-4 sm:h-full sm:grid-cols-[1.05fr_1fr_1.28fr] sm:items-center sm:gap-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-2">
                  {channels.map(({ name, channel }, index) => (
                    <div
                      key={name}
                      className="hero-channel-card flex h-9 items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-2.5 shadow-[0_9px_25px_-22px_rgba(15,23,42,0.45)] sm:h-8"
                      style={{ '--channel-delay': `${index * 140}ms` }}
                    >
                      <ChannelIcon channel={channel} className="h-5 w-5 rounded-md" />
                      <span className="truncate text-[9px] font-bold text-slate-700 lg:text-[10px]">{name}</span>
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_0_3px_rgba(34,211,238,0.12)]" />
                    </div>
                  ))}
                </div>

                <div className="relative mx-auto flex h-40 w-40 items-center justify-center sm:h-40 sm:w-40 lg:h-44 lg:w-44">
                  <span className="hero-core-orbit absolute inset-0 rounded-full border border-cyan-200/80" />
                  <span className="hero-core-orbit-reverse absolute inset-3 rounded-full border border-dashed border-cyan-300/90" />
                  <span className="absolute inset-5 animate-pulse-subtle rounded-full bg-cyan-100/60 blur-xl motion-reduce:animate-none" />
                  <div className="hero-ai-core relative flex h-[7.7rem] w-[7.7rem] flex-col items-center justify-center rounded-full border border-cyan-300 bg-white text-center shadow-[0_18px_45px_-20px_rgba(6,182,212,0.62)] lg:h-[8.4rem] lg:w-[8.4rem]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow-[0_10px_25px_-12px_rgba(6,182,212,0.9)]">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <p className="mt-2 text-base font-black tracking-[-0.04em] text-slate-950">LeadHive AI</p>
                    <p className="mt-1 max-w-[104px] whitespace-nowrap text-[7px] leading-3 font-bold uppercase tracking-[0.06em] text-cyan-700">Engage · Understand</p>
                    <p className="max-w-[104px] whitespace-nowrap text-[7px] leading-3 font-bold uppercase tracking-[0.06em] text-cyan-700">Qualify · Prioritize</p>
                  </div>
                </div>

                <div className="sm:hidden">
                  <ArrowDown className="mx-auto h-5 w-5 animate-bounce text-cyan-500 motion-reduce:animate-none" />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-[0_22px_50px_-30px_rgba(8,145,178,0.55)]">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400" />
                  <div className="border-b border-slate-100 px-3.5 py-3">
                    <p className="text-[8px] font-black uppercase tracking-[0.19em] text-cyan-700">Sales opportunity</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        <Target className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-black text-slate-950">Qualified Lead</p>
                        <p className="mt-0.5 text-[8px] font-semibold text-slate-400">AI confidence 92%</p>
                      </div>
                      <span className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_7px_18px_-8px_rgba(16,185,129,0.9)]">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 px-3.5 py-3">
                    {[
                      { label: 'Intent', value: 'Buying', icon: Target },
                      { label: 'Interest', value: '5 Marla House', icon: Home },
                      { label: 'Location', value: 'DHA Islamabad', icon: MapPin },
                      { label: 'Budget', value: 'PKR 30 Million', icon: WalletCards },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="grid grid-cols-[18px_52px_1fr] items-center gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                        <Icon className="h-3.5 w-3.5 text-cyan-500" />
                        <span className="text-[8px] font-bold text-slate-500">{label}</span>
                        <span className="truncate text-[9px] font-bold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mx-3.5 mb-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Ready for sales handover
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-5">
              {processSteps.map(({ label, detail, icon: Icon }, index) => {
                const isActive = activeStep === index;
                const isComplete = index < activeStep;
                return (
                  <button
                    type="button"
                    key={label}
                    onClick={() => setActiveStep(index)}
                    className={`group relative rounded-xl border px-2 py-2.5 text-left transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      isActive
                        ? 'border-cyan-200 bg-cyan-50/70 shadow-[0_12px_28px_-22px_rgba(6,182,212,0.7)]'
                        : 'border-transparent bg-white/70 hover:border-slate-200'
                    } ${index === processSteps.length - 1 ? 'col-span-2 sm:col-span-1' : ''}`}
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-500 ${isActive || isComplete ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className={`mt-2 block text-[9px] font-black uppercase tracking-[0.1em] ${isActive ? 'text-cyan-800' : 'text-slate-700'}`}>{label}</span>
                    <span className="mt-1 block text-[8px] leading-3 text-slate-400">{detail}</span>
                    {index < processSteps.length - 1 && (
                      <ArrowRight className="absolute -right-2 top-4 z-10 hidden h-3 w-3 text-cyan-300 sm:block" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
