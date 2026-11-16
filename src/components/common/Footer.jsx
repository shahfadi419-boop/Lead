import React from 'react';

export function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Proposition */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/leadhive-logo.png" 
                alt="LeadHive AI" 
                className="h-9 w-auto brightness-0 invert" 
              />
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Autonomous Sales Intelligence Platform. Turning multi-channel customer conversations into qualified, prioritized sales opportunities so your team acts on the leads that matter.
            </p>
            <div className="pt-2">
              <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-brand-400">Brand Promise</p>
              <p className="text-sm font-medium text-white mt-1">Your Team Acts on the Opportunities That Matter.</p>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-[11px] font-bold text-white tracking-[0.15em] uppercase mb-5">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('experience')} className="text-slate-400 hover:text-brand-300 flex items-center gap-1">
                  AI Experience Centre
                  <span className="text-[9px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-[0.1em]">LIVE</span>
                </button>
              </li>
              <li>
                <a href="#channels-section" className="text-slate-400 hover:text-white transition-colors">Multi-Channel Ingestion</a>
              </li>
              <li>
                <a href="#operating-model" className="text-slate-400 hover:text-white transition-colors">4-Stage Operating Model</a>
              </li>
              <li>
                <a href="#lead-dashboard-preview" className="text-slate-400 hover:text-white transition-colors">Lead Intelligence Dashboard</a>
              </li>
              <li>
                <a href="#human-outcome" className="text-slate-400 hover:text-white transition-colors">Human + AI Sales Handover</a>
              </li>
            </ul>
          </div>

          {/* Industry Solutions */}
          <div>
            <h4 className="text-[11px] font-bold text-white tracking-[0.15em] uppercase mb-5">Industries</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => { onNavigate('experience'); }} className="text-slate-400 hover:text-white">Real Estate & Developers</button>
              </li>
              <li>
                <button onClick={() => { onNavigate('experience'); }} className="text-slate-400 hover:text-white">Healthcare & Clinics</button>
              </li>
              <li>
                <button onClick={() => { onNavigate('experience'); }} className="text-slate-400 hover:text-white">Higher Education & EdTech</button>
              </li>
              <li>
                <button onClick={() => { onNavigate('experience'); }} className="text-slate-400 hover:text-white">Automotive Dealerships</button>
              </li>
              <li>
                <button onClick={() => { onNavigate('experience'); }} className="text-slate-400 hover:text-white">B2B & E-commerce</button>
              </li>
              <li>
                <button onClick={() => { onNavigate('experience'); }} className="text-slate-400 hover:text-white">Professional Services</button>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal & Regulatory Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-slate-500 gap-4">
          <p className="max-w-3xl leading-relaxed">
            <span className="font-semibold text-slate-400">Illustrative Demonstration Disclaimer:</span> The LeadHive AI Experience Centre and interactive product illustrations use simulated activity and sample datasets to demonstrate automated conversational qualification and prioritization workflows. Demonstration lead scores do not represent validated financial projections. Official social platform logos remain the property of their respective owners.
          </p>
          <div className="flex items-center gap-4 text-slate-400 whitespace-nowrap">
            <span>© {new Date().getFullYear()} LeadHive AI</span>
            <span>•</span>
            <button className="hover:text-white transition-colors focus:outline-none focus-visible:text-white">Privacy Policy</button>
            <span aria-hidden="true">•</span>
            <button className="hover:text-white transition-colors focus:outline-none focus-visible:text-white">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

