import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flame,
  MessageSquareText,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
  Zap,
} from 'lucide-react';
import { ChannelIcon } from '../common/ChannelIcon';

const LEAD_TABS = ['hot', 'warm', 'followup'];

export function LeadDashboardPreview({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('hot');
  const [liveTick, setLiveTick] = useState(0);
  const sampleCards = {
    hot: {
      prospect: 'Tariq Mehmood', initials: 'TM', channel: 'whatsapp', time: 'Just now',
      requirement: '5-marla house in DHA Islamabad', intent: 'Strong buying intent', leadScore: 92,
      qualificationStatus: '95% complete', completeness: 95, temperature: 'High intent', budget: 'PKR 30M', timeline: 'Within 30 days',
      recommendedAction: 'Arrange a VIP property consultation and share matching DHA Sector F listings.',
      tags: ['Pre-approved', 'Immediate possession', 'High urgency'], color: 'rose',
    },
    warm: {
      prospect: 'Sarah Jenkins', initials: 'SJ', channel: 'facebook', time: '2 min ago',
      requirement: 'Two 1-bed Downtown luxury rental apartments', intent: 'Portfolio expansion', leadScore: 89,
      qualificationStatus: '88% complete', completeness: 88, temperature: 'Priority investor', budget: '$280K USD', timeline: 'Q1 investment',
      recommendedAction: 'Send the overseas investor prospectus and reserve a call with an investment partner.',
      tags: ['Overseas buyer', 'Guaranteed yield', 'Multi-unit'], color: 'amber',
    },
    followup: {
      prospect: 'Zainab Qureshi', initials: 'ZQ', channel: 'tiktok', time: '8 min ago',
      requirement: 'Smart-home 3-bed villa on an installment plan', intent: 'Financing exploration', leadScore: 64,
      qualificationStatus: '60% complete', completeness: 60, temperature: 'Nurture needed', budget: 'PKR 22M', timeline: '6–12 months',
      recommendedAction: 'Send a 36-month installment calculation and begin a tailored nurture sequence.',
      tags: ['Nurture cadence', 'Calculator sent'], color: 'sky',
    },
  };

  const current = sampleCards[activeTab];
  const tabs = LEAD_TABS;
  const currentIndex = tabs.indexOf(activeTab);
  const scoreColor = current.color === 'rose' ? 'text-rose-600' : current.color === 'amber' ? 'text-amber-600' : 'text-sky-600';
  const scoreStroke = current.color === 'rose' ? '#fda4af' : current.color === 'amber' ? '#fcd34d' : '#7dd3fc';

  useEffect(() => {
    const liveTimer = window.setInterval(() => setLiveTick((tick) => tick + 1), 2600);
    return () => window.clearInterval(liveTimer);
  }, []);

  useEffect(() => {
    const rotationTimer = window.setInterval(() => {
      setActiveTab((tab) => tabs[(tabs.indexOf(tab) + 1) % tabs.length]);
    }, 5200);
    return () => window.clearInterval(rotationTimer);
  }, [tabs]);

  const metrics = useMemo(() => [
    { label: 'Live conversations', value: (1428 + liveTick).toLocaleString(), detail: '+18.4% this week', icon: UsersRound, tone: 'text-cyan-600' },
    { label: 'Qualified today', value: 384 + (liveTick % 5), detail: '26.8% qualification rate', icon: Target, tone: 'text-violet-600' },
    { label: 'Closing now', value: 142 + (liveTick % 3), detail: 'High-intent opportunities', icon: Flame, tone: 'text-rose-500' },
    { label: 'Nurture queue', value: 68 + (liveTick % 2), detail: 'Automation is active', icon: Clock3, tone: 'text-amber-500' },
  ], [liveTick]);

  return (
    <section id="lead-dashboard-preview" className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-cyan-50/80 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-800">
            <Radar className="h-3.5 w-3.5 text-cyan-600" />
            Live opportunity intelligence
          </div>
          <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            Know where to focus <span className="text-cyan-600">next.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Every conversation is interpreted in real time, so your team sees the opportunities with the clearest path to revenue.
          </p>
        </div>

        <div className="relative mt-14 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_90px_-42px_rgba(14,116,144,0.35)] sm:p-6 lg:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="pointer-events-none absolute -right-24 -top-40 h-96 w-96 rounded-full bg-cyan-100/70 blur-[110px]" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-violet-100/50 blur-[100px]" />

          <div className="relative flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-600">
                <span className="absolute inset-0 rounded-xl border border-cyan-400 animate-ping opacity-30 motion-reduce:animate-none" />
                <Activity className="relative h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Revenue command center</p>
                <p className="mt-0.5 text-xs text-slate-500">Simulated live intelligence stream</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
              All systems active
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.32)] transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_18px_35px_-25px_rgba(8,145,178,0.3)] sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">{metric.label}</span>
                    <Icon className={`h-4 w-4 ${metric.tone}`} />
                  </div>
                  <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{metric.value}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                    {index === 0 && <TrendingUp className="h-3 w-3 text-emerald-600" />}
                    <span>{metric.detail}</span>
                  </div>
                  <div className="mt-4 flex h-1 gap-1 overflow-hidden rounded-full">
                    {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
                      <span key={bar} className={`flex-1 rounded-full ${bar < 5 + (liveTick + index) % 2 ? 'bg-cyan-400' : 'bg-slate-100'} transition-colors duration-700`} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.5fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.3)] sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-700">Lead focus</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">Opportunity radar</h3>
                </div>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-slate-400">0{currentIndex + 1}/03</span>
              </div>

              <div className="mt-6 flex gap-2 rounded-2xl bg-slate-100 p-1.5">
                {tabs.map((tab) => {
                  const lead = sampleCards[tab];
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      aria-label={`Show ${lead.prospect}'s opportunity`}
                      aria-pressed={isActive}
                      className={`relative flex h-10 flex-1 items-center justify-center rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-brand-500 text-white shadow-[0_8px_24px_rgba(43,191,221,0.24)]' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}
                    >
                      {tab === 'hot' ? <Flame className="h-4 w-4" /> : tab === 'warm' ? <Target className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-lg font-black text-slate-950 shadow-[0_10px_35px_rgba(34,211,238,0.24)]">
                  {current.initials}
                  <span className="absolute -bottom-1 -right-1 rounded-lg border-2 border-white bg-white p-1 shadow-sm">
                    <ChannelIcon channel={current.channel} className="h-4 w-4 rounded" />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-slate-900">{current.prospect}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><MessageSquareText className="h-3.5 w-3.5" /> {current.time} · {current.channel}</p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">AI confidence</span>
                  <span className={`font-bold ${scoreColor}`}>{current.qualificationStatus}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300 transition-all duration-1000" style={{ width: `${current.completeness}%` }} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Automated qualification complete
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.35)] sm:p-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-cyan-100/70 to-transparent animate-dashboard-sweep motion-reduce:animate-none" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-700">Decision brief</p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Ready to act with context.</h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-500">The AI has assembled the details your sales team needs before making contact.</p>
                </div>
                <div className="relative h-20 w-20 shrink-0">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80" aria-label={`Lead score ${current.leadScore} out of 100`}>
                    <circle cx="40" cy="40" r="31" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                    <circle cx="40" cy="40" r="31" fill="none" stroke={scoreStroke} strokeWidth="6" strokeLinecap="round" strokeDasharray="194.8" strokeDashoffset={194.8 - (194.8 * current.leadScore) / 100} className="transition-all duration-1000" />
                  </svg>
                  <span className="absolute inset-0 flex flex-col items-center justify-center text-slate-900"><strong className="text-lg leading-none">{current.leadScore}</strong><small className="mt-1 text-[9px] text-slate-500">SCORE</small></span>
                </div>
              </div>

              <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  ['Budget', current.budget, 'bg-cyan-50 text-cyan-700'],
                  ['Timeline', current.timeline, 'bg-violet-50 text-violet-700'],
                  ['Signal', current.intent, 'bg-emerald-50 text-emerald-700'],
                ].map(([label, value, tone]) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                    <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${tone}`}>{label}</span>
                    <p className="mt-3 truncate text-sm font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="relative mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><Sparkles className="h-4 w-4 text-cyan-600" /> Customer requirement</div>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900">“{current.requirement}”</p>
              </div>

              <div className="relative mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <div className="mt-0.5 text-emerald-600"><Zap className="h-5 w-5" /></div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Next best action</p>
                      <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-900">{current.recommendedAction}</p>
                    </div>
                  </div>
                  <button onClick={() => onNavigate('experience')} className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
                    Simulate handover <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              <div className="relative mt-4 flex flex-wrap gap-2">
                {current.tags.map((tag) => <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-600">{tag}</span>)}
              </div>
            </div>
          </div>

          <div className="relative mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-500"><ShieldCheck className="h-4 w-4 text-cyan-600" /> Demonstration workspace · no customer data is connected</div>
            <button onClick={() => onNavigate('experience')} className="group inline-flex items-center gap-1.5 font-semibold text-cyan-600 hover:text-cyan-700">Open the AI experience <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
