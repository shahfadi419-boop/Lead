import React from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { analytics } from '../../services/analytics';

export function Navbar({ activeRoute, onNavigate, onOpenBooking }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (route, anchorId = null) => {
    setMobileMenuOpen(false);
    onNavigate(route);
    if (anchorId) {
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          
          {/* Brand Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavClick('home')} 
              className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-0.5"
              aria-label="LeadHive AI Home"
            >
              <img 
                src="/leadhive-logo.png" 
                alt="LeadHive AI" 
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:opacity-90"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </button>
          </div>

          {/* Desktop Navigation Links - Uniform Styling, No Overview, No special icons */}
          <nav className="hidden lg:flex items-center justify-self-center space-x-1 xl:space-x-2 text-sm font-medium text-slate-600">
            <button
              onClick={() => handleNavClick('home', 'channels-section')}
              className="px-3 py-2 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-50"
            >
              Multi-Channel
            </button>
            <button
              onClick={() => handleNavClick('home', 'operating-model')}
              className="px-3 py-2 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-50"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                analytics.track('experience_opened', { trigger: 'navbar_link' });
                handleNavClick('home', 'experience');
              }}
              className="px-3 py-2 rounded-lg transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Industries
            </button>
            <button
              onClick={() => handleNavClick('home', 'contact-section')}
              className="px-3 py-2 rounded-lg transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Contact Us
            </button>
          </nav>

          {/* Desktop CTA + Mobile menu toggle */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => onOpenBooking('Navbar')}
              className="hidden lg:inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-[13px] font-bold text-white transition-all hover:-translate-y-px hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
            >
              Book a Demo
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-fadeIn shadow-lg">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavClick('home', 'channels-section')}
              className="px-3 py-2 text-left rounded-lg text-slate-700 font-medium hover:bg-slate-50 text-sm"
            >
              Multi-Channel
            </button>
            <button
              onClick={() => handleNavClick('home', 'operating-model')}
              className="px-3 py-2 text-left rounded-lg text-slate-700 font-medium hover:bg-slate-50 text-sm"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                analytics.track('experience_opened', { trigger: 'mobile_nav' });
                handleNavClick('home', 'experience');
              }}
              className="px-3 py-2 text-left rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Industries
            </button>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenBooking('Mobile Navbar'); }}
              className="w-full rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-600 focus:outline-none"
            >
              Book a Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
