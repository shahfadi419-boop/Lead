import React, { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, BadgeCheck, Clock3, HeartHandshake, MessageCircle, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';

const OUTCOMES = [
  { icon: BadgeCheck, title: 'Verified before handover', detail: 'Budget, timing and intent are resolved before a rep joins the conversation.', tone: 'bg-cyan-50 text-cyan-700 ring-cyan-100' },
  { icon: Clock3, title: 'Momentum stays intact', detail: 'Every enquiry receives an immediate, context-aware response across every channel.', tone: 'bg-violet-50 text-violet-700 ring-violet-100' },
  { icon: UsersRound, title: 'Humans own the moment', detail: 'Your team arrives ready for the high-value discussion that moves the deal forward.', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
];

const HANDOFFS = [
  { initials: 'TM', name: 'Tariq Mehmood', context: 'DHA Islamabad · WhatsApp', score: 92, action: 'Arrange a priority consultation', time: 'Now', color: 'from-cyan-400 to-blue-500' },
  { initials: 'SJ', name: 'Sarah Jenkins', context: 'Overseas investor · Facebook', score: 89, action: 'Send investor prospectus', time: '2 min', color: 'from-violet-400 to-indigo-500' },
  { initials: 'ZQ', name: 'Zainab Qureshi', context: 'Villa enquiry · Web chat', score: 84, action: 'Share installment options', time: '5 min', color: 'from-emerald-400 to-teal-500' },
];

export function HumanCenteredOutcome() {
  const [activeHandoff, setActiveHandoff] = useState(0);
  const active = HANDOFFS[activeHandoff];

  useEffect(() => {
    const timer = window.setInterval(() => setActiveHandoff((current) => (current + 1) % HANDOFFS.length), 4200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="human-outcome" className="relative isolate overflow-hidden bg-white py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[46rem] -translate-x-1/2 rounded-full bg-cyan-100/50 blur-[130px]" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-violet-100/45 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-800">
              <HeartHandshake className="h-4 w-4" /> Human-centred intelligence
            </div>
            <h2 className="mt-6 max-w-xl text-4xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.04]">
              AI does the prep. <span className="text-cyan-600">Your team builds the relationship.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              LeadHive turns each incoming conversation into a clear, sales-ready brief, so people spend their time advising buyers, not chasing missing details.
            </p>

            <div className="mt-9 grid gap-3">
              {OUTCOMES.map(({ icon: Icon, title, detail, tone }, index) => (
                <div key={title} className="group flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_22px_45px_-30px_rgba(8,145,178,0.3)]">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${tone}`}><Icon className="h-5 w-5" /></div>
                  <div>
                    <div className="flex items-center gap-2"><span className="text-[10px] font-bold tracking-[0.12em] text-slate-300">0{index + 1}</span><h3 className="text-sm font-bold text-slate-900">{title}</h3></div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.25rem] bg-gradient-to-br from-cyan-100 via-transparent to-violet-100 opacity-75 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_34px_80px_-34px_rgba(15,23,42,0.28)] sm:p-7">
              <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(14,165,233,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.06)_1px,transparent_1px)] [background-size:30px_30px]" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-100/80 blur-[90px]" />

              <div className="relative flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-200"><Activity className="h-5 w-5" /><span className="absolute inset-0 rounded-xl border border-cyan-300 animate-ping opacity-20 motion-reduce:animate-none" /></div>
                  <div><p className="text-sm font-bold text-slate-900">Human handover queue</p><p className="mt-0.5 text-xs text-slate-500">Only the conversations worth your time</p></div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" /> LIVE</div>
              </div>

              <div className="relative mt-6 grid gap-3">
                {HANDOFFS.map((handoff, index) => {
                  const selected = index === activeHandoff;
                  return (
                    <button key={handoff.name} type="button" onClick={() => setActiveHandoff(index)} aria-pressed={selected} className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-500 ${selected ? 'border-cyan-300 bg-cyan-50 shadow-[0_12px_30px_rgba(34,211,238,0.16)]' : 'border-slate-200 bg-white hover:border-cyan-200 hover:bg-slate-50'}`}>
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${handoff.color} text-sm font-black text-slate-950`}>{handoff.initials}</div>
                      <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-bold text-slate-900">{handoff.name}</p><span className="text-[10px] font-medium text-slate-500">{handoff.time}</span></div><p className="mt-0.5 truncate text-xs text-slate-500">{handoff.context}</p></div>
                      <span className={`rounded-lg px-2 py-1 text-xs font-black ${selected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>{handoff.score}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950"><Sparkles className="h-4 w-4" /></div><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-700">Rep-ready next step</p><p className="mt-1 text-sm font-semibold leading-relaxed text-slate-900">{active.action}</p></div></div>
              </div>

              <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 text-xs">
                <span className="flex items-center gap-1.5 text-slate-500"><ShieldCheck className="h-4 w-4 text-cyan-600" /> Context verified by LeadHive AI</span>
                <span className="flex items-center gap-1.5 font-semibold text-cyan-700"><MessageCircle className="h-4 w-4" /> Ready for a human reply <ArrowUpRight className="h-3.5 w-3.5" /></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
