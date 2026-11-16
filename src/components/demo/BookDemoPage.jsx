import React, { useState } from 'react';
import { ArrowRight, CalendarDays, Check, CheckCircle2, Clock3, LockKeyhole, MessageSquareText, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { analytics } from '../../services/analytics';

const FIELD_STYLE = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100';

const DEMO_POINTS = [
  { icon: Sparkles, title: 'Built around your sales motion', copy: 'We tailor the walkthrough to your industry, qualification rules and team workflow.' },
  { icon: Clock3, title: '20 focused minutes', copy: 'A useful working session, no generic slides or lengthy sales pitch.' },
  { icon: ShieldCheck, title: 'Safe to explore', copy: 'Use illustrative scenarios first; no system connection is required for the demo.' },
];

export function BookDemoPage({ onNavigate }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', industry: 'Real Estate',
    volume: '500 - 2,500 conversations/mo', primaryChannel: 'All Channels', notes: '',
  });

  const updateField = (field) => (event) => setFormData((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    analytics.track('book_demo_clicked', { source: 'dedicated_book_demo_page', industry: formData.industry, company: formData.company, volume: formData.volume });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-50 px-4 py-16 sm:py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[44rem] -translate-x-1/2 rounded-full bg-cyan-100/70 blur-[120px]" />
        <div className="relative mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-[0_34px_90px_-45px_rgba(8,145,178,0.45)] sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60"><CheckCircle2 className="h-8 w-8" /></div>
          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">Request received</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">Thank you, {formData.name}.</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">Your private LeadHive walkthrough for <strong className="text-slate-900">{formData.company}</strong> is in the queue. Our team will contact you within two business hours.</p>

          <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3"><span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Demo brief</span><span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-bold text-cyan-800">PRIVATE SESSION</span></div>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-slate-500">Industry</dt><dd className="mt-1 font-bold text-slate-900">{formData.industry}</dd></div>
              <div><dt className="text-xs text-slate-500">Inbound volume</dt><dd className="mt-1 font-bold text-slate-900">{formData.volume}</dd></div>
              <div><dt className="text-xs text-slate-500">Work email</dt><dd className="mt-1 break-words font-bold text-slate-900">{formData.email}</dd></div>
              <div><dt className="text-xs text-slate-500">Focus channels</dt><dd className="mt-1 font-bold text-slate-900">{formData.primaryChannel}</dd></div>
            </dl>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => onNavigate('experience')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_28px_-14px_rgba(43,191,221,0.8)] transition hover:bg-brand-600"><Sparkles className="h-4 w-4" /> Explore the AI experience</button>
            <button onClick={() => onNavigate('home')} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Return home</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden bg-slate-50 py-10 sm:py-16">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[55rem] -translate-x-1/2 rounded-full bg-cyan-100/60 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_36px_100px_-50px_rgba(15,23,42,0.5)] lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="relative overflow-hidden bg-slate-950 px-6 py-9 sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(103,232,249,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.09)_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/25 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-[90px]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-100"><CalendarDays className="h-3.5 w-3.5" /> Private product walkthrough</div>
              <h1 className="mt-7 max-w-md text-4xl font-extrabold tracking-[-0.05em] text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.04]">Turn more conversations into <span className="text-cyan-300">qualified opportunities.</span></h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-slate-300">See how LeadHive keeps every inbound customer conversation moving, then gives your sales team the exact context to take the next step.</p>

              <div className="mt-9 space-y-3">
                {DEMO_POINTS.map(({ icon: Icon, title, copy }) => (
                  <div key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-200"><Icon className="h-4 w-4" /></div>
                    <div><h2 className="text-sm font-bold text-white">{title}</h2><p className="mt-1 text-xs leading-relaxed text-slate-400">{copy}</p></div>
                  </div>
                ))}
              </div>

              <div className="mt-9 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200"><MessageSquareText className="h-4 w-4" /> Your demo will cover</div>
                <div className="mt-3 flex flex-wrap gap-2">{['Capture', 'Qualify', 'Prioritise', 'Handover'].map((item) => <span key={item} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-200"><Check className="h-3 w-3 text-cyan-300" /> {item}</span>)}</div>
              </div>
            </div>
          </aside>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-7">
              <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-700">Reserve your session</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-3xl">Book a tailored demo</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">Tell us a little about your business. We will prepare a relevant, one-to-one walkthrough.</p></div>
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 sm:flex"><UsersRound className="h-5 w-5" /></div>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" required><input required value={formData.name} onChange={updateField('name')} placeholder="e.g. Tariq Mehmood" className={FIELD_STYLE} /></Field>
                <Field label="Work email" required><input required type="email" value={formData.email} onChange={updateField('email')} placeholder="name@company.com" className={FIELD_STYLE} /></Field>
                <Field label="Phone or WhatsApp" required><input required value={formData.phone} onChange={updateField('phone')} placeholder="+92 300 1234567" className={FIELD_STYLE} /></Field>
                <Field label="Company name" required><input required value={formData.company} onChange={updateField('company')} placeholder="e.g. Apex Holdings" className={FIELD_STYLE} /></Field>
                <Field label="Industry" required><select value={formData.industry} onChange={updateField('industry')} className={FIELD_STYLE}><option>Real Estate</option><option>Healthcare</option><option>Education & EdTech</option><option>Automotive</option><option>B2B & E-commerce</option><option>Professional Services</option></select></Field>
                <Field label="Monthly inbound volume"><select value={formData.volume} onChange={updateField('volume')} className={FIELD_STYLE}><option>Less than 500 conversations</option><option>500 - 2,500 conversations/mo</option><option>2,500 - 10,000 conversations/mo</option><option>10,000+ conversations/mo</option></select></Field>
              </div>

              <Field label="Primary focus channels"><select value={formData.primaryChannel} onChange={updateField('primaryChannel')} className={FIELD_STYLE}><option>All Channels</option><option>WhatsApp Business</option><option>Facebook & Instagram</option><option>Website chat</option><option>YouTube & TikTok</option></select></Field>
              <Field label="What challenge would you like to solve?" hint="Optional"><textarea rows={3} value={formData.notes} onChange={updateField('notes')} placeholder="For example: We need faster replies on WhatsApp and better lead qualification before calls." className={`${FIELD_STYLE} resize-none`} /></Field>

              <div className="pt-2">
                <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(43,191,221,0.85)] transition hover:-translate-y-0.5 hover:bg-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"><CalendarDays className="h-4 w-4" /> Reserve my demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
                <p className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-slate-500"><LockKeyhole className="h-3.5 w-3.5 text-cyan-600" /> Your details are used only to arrange this demo.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, required = false, hint, children }) {
  return <label className="block"><span className="mb-2 flex items-center gap-1 text-xs font-bold text-slate-700">{label}{required && <span className="text-cyan-600">*</span>}{hint && <span className="font-medium text-slate-400">({hint})</span>}</span>{children}</label>;
}
