import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Hero } from './components/home/Hero';
import { ChannelGrid } from './components/home/ChannelGrid';
import { OperatingModel } from './components/home/OperatingModel';
import { LeadDashboardPreview } from './components/home/LeadDashboardPreview';
import { HumanCenteredOutcome } from './components/home/HumanCenteredOutcome';
import { FinalCTA } from './components/home/FinalCTA';
import { ExperienceCentre } from './components/experience/ExperienceCentre';
import { BookDemoPage } from './components/demo/BookDemoPage';
import { PageLoader } from './components/common/PageLoader';
import { SharedChannelDashboard } from './dashboards/SharedChannelDashboard';

export function App() {
  const [activeRoute, setActiveRoute] = useState('home');
  const [dashboardPlatform, setDashboardPlatform] = useState('facebook');
  const [isLoading, setIsLoading] = useState(true);
  // Booking modal removed; using dedicated booking page

  // Sync route with URL hash or pathname
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/dashboard') {
        const platform = new URLSearchParams(window.location.search).get('platform');
        setDashboardPlatform(platform === 'whatsapp' ? 'whatsapp' : 'facebook');
        setActiveRoute('dashboard');
      } else if (path === '/book-demo' || hash === '#book-demo') {
        setActiveRoute('booking');
      } else {
        setActiveRoute('home');
        if (path === '/experience' || hash === '#experience') {
          window.setTimeout(() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Update document title and URL when route changes
  const handleNavigate = (route, platform) => {
    setActiveRoute(route);
    if (route === 'dashboard') {
      const selectedPlatform = platform === 'whatsapp' ? 'whatsapp' : 'facebook';
      setDashboardPlatform(selectedPlatform);
      window.history.pushState(null, '', `/dashboard?platform=${selectedPlatform}`);
      document.title = `${selectedPlatform === 'whatsapp' ? 'WhatsApp' : 'Facebook'} Lead Dashboard`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (route === 'experience') {
      setActiveRoute('home');
      window.history.pushState(null, '', '#experience');
      document.title = 'LeadHive AI: Autonomous Sales Intelligence Platform';
      window.setTimeout(() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } else if (route === 'booking') {
      window.history.pushState(null, '', '#book-demo');
      document.title = 'Book a LeadHive AI Demo';
    } else {
      window.history.pushState(null, '', window.location.pathname === '/dashboard' ? '/' : '#');
      document.title = 'LeadHive AI: Autonomous Sales Intelligence Platform';
    }
    if (route !== 'experience' && route !== 'dashboard') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = () => {
    handleNavigate('booking');
  };

  if (activeRoute === 'dashboard') {
    return (
      <SharedChannelDashboard
        platform={dashboardPlatform}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-brand-500 selection:text-white">
      {isLoading && <PageLoader onComplete={() => setIsLoading(false)} />}

      {/* Top Navigation */}
      <Navbar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onOpenBooking={handleOpenBooking}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {activeRoute === 'home' ? (
          <div>
            {/* Section 01: Hero */}
            <Hero onNavigate={handleNavigate} />

            {/* Section 02: One Intelligence. Every Channel. */}
            <ChannelGrid
              onNavigate={handleNavigate}
            />

            {/* Section 03: From Conversation to Conversion */}
            <OperatingModel
              onNavigate={handleNavigate}
            />

            {/* Section 04: Know Which Leads Matter */}
            <LeadDashboardPreview
              onNavigate={handleNavigate}
            />

            {/* Section 05: Your Team Focuses on Closing */}
            <HumanCenteredOutcome
              onNavigate={handleNavigate}
              onOpenBooking={handleOpenBooking}
            />

            {/* Section 06: Full Interactive Experience Centre */}
            <ExperienceCentre
              onOpenBooking={handleOpenBooking}
              onBackToHome={() => handleNavigate('home')}
            />

            {/* Section 08: Final CTA, immediately before the footer */}
            <FinalCTA
              onNavigate={handleNavigate}
              onOpenBooking={handleOpenBooking}
            />
          </div>
        ) : (
          /* Dedicated Booking Page */
          <BookDemoPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}

export default App;
