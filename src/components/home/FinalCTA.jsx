import React, { useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, LockKeyhole, Sparkles, UsersRound } from 'lucide-react';
import { analytics } from '../../services/analytics';

const FIELD_STYLE = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100';

export function FinalCTA({ onOpenBooking }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    channel: '',
    volume: '',
  });

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    analytics.track('book_demo_clicked', {
      source: 'final_cta_form',
      company: formData.company,
      primary_channel: formData.channel,
      conversation_volume: formData.volume,
    });
    onOpenBooking('Final CTA Form');
  };

  return (
    <section id="contact-section" className="relative overflow-hidden bg-gradient-to-b from-white via-cyan-50/35 to-white py-16 sm:py-20">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[62rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100/45 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700">Ready to connect</p>
          <p className="mt-2 text-xl font-extrabold tracking-[-0.025em] text-slate-950 sm:text-2xl">Let’s turn your next conversation into a qualified opportunity.</p>
        </div>
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start lg:gap-16">
          <div className="relative overflow-hidden bg-transparent px-2 py-4 sm:px-4 sm:py-8 lg:px-0">
            <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(14,165,233,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-100/70 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-blue-100/70 blur-[100px]" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/60 bg-cyan-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-700">
                <Sparkles className="h-3.5 w-3.5" />
                Instant interactive sandbox
              </div>

              <h2 className="mt-7 max-w-md text-4xl font-extrabold leading-[1.04] tracking-[-0.05em] text-slate-950 sm:text-5xl">
                Ready to Experience Autonomous Sales Intelligence?
              </h2>

              <p className="mt-6 max-w-md text-base leading-relaxed text-slate-600">
                See how LeadHive AI turns conversations into qualified opportunities. No registration, credentials or integrations required to run the simulation.
              </p>

              <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-600">
                {['Zero setup time', 'Simulated real-world scenarios', 'Compliant sandbox environment'].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-transparent px-2 py-4 sm:px-4 sm:py-8 lg:px-0">
            <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-700">Reserve your session</p>
                <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-3xl">Book a tailored demo</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">Tell us about your conversation workflow and we will tailor the walkthrough to your team.</p>
              </div>
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 sm:flex">
                <UsersRound className="h-5 w-5" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name"><input required value={formData.name} onChange={updateField('name')} placeholder="Your name" className={FIELD_STYLE} /></Field>
                <Field label="Work email"><input required type="email" value={formData.email} onChange={updateField('email')} placeholder="name@company.com" className={FIELD_STYLE} /></Field>
              </div>

              <Field label="Company"><input required value={formData.company} onChange={updateField('company')} placeholder="Company name" className={FIELD_STYLE} /></Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Primary channels">
                  <select required value={formData.channel} onChange={updateField('channel')} className={FIELD_STYLE}>
                    <option value="" disabled>Select channels</option>
                    <option>All Channels</option>
                    <option>WhatsApp Business</option>
                    <option>Facebook & Instagram</option>
                    <option>Website chat</option>
                    <option>YouTube & TikTok</option>
                  </select>
                </Field>
                <Field label="Monthly conversation volume">
                  <select required value={formData.volume} onChange={updateField('volume')} className={FIELD_STYLE}>
                    <option value="" disabled>Select volume</option>
                    <option>Less than 500</option>
                    <option>500 - 2,500</option>
                    <option>2,500 - 10,000</option>
                    <option>10,000+</option>
                  </select>
                </Field>
              </div>

              <button type="submit" className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-[0_15px_30px_-14px_rgba(43,191,221,0.9)] transition hover:-translate-y-0.5 hover:bg-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200">
                <CalendarDays className="h-4 w-4" />
                Schedule My Demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <p className="flex items-center justify-center gap-2 pt-1 text-center text-[11px] text-slate-500">
                <LockKeyhole className="h-3.5 w-3.5 text-cyan-600" />
                Your details are used only to arrange your LeadHive AI demo.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
