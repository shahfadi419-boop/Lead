import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Stethoscope, GraduationCap, Car, ShoppingBag, Briefcase,
  Play, Pause, RotateCcw, ArrowRight, ArrowLeft, CheckCircle2, Flame, Clock, 
  AlertCircle, Sparkles, Send, ShieldCheck, ExternalLink, ChevronRight,
  TrendingUp, Users, Target, UserCheck, MessageSquare, Zap
} from 'lucide-react';
import { ChannelIcon } from '../common/ChannelIcon';
import { INDUSTRIES, CHANNELS_INFO } from '../../data/scenarios';
import { analytics } from '../../services/analytics';

const ICON_MAP = {
  Building2,
  Stethoscope,
  GraduationCap,
  Car,
  ShoppingBag,
  Briefcase
};

export function ExperienceCentre({ initialIndustryId = 'real-estate', onOpenBooking, onBackToHome }) {
  // Screen stages: 1: Scenario Selector, 2: Feed, 3: Autonomous Intelligence, 4: Opportunity Dashboard, 5: Handover, 6: Conversion
  const [currentScreen, setCurrentScreen] = useState(1);
  const [selectedIndustryId, setSelectedIndustryId] = useState(initialIndustryId);
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(0);

  // Playback state for Screen 03 (Core demonstration)
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeMessageIndex, setActiveMessageIndex] = useState(1);
  const [timelineProgress, setTimelineProgress] = useState(3);
  const [isTyping, setIsTyping] = useState(false);

  // Handover state
  const [handoverSimulated, setHandoverSimulated] = useState(false);
  const [selectedDashboardOpp, setSelectedDashboardOpp] = useState(null);

  // Mobile drawer / tab state
  const [activeMobileTab, setActiveMobileTab] = useState('conversation'); // 'channels' | 'conversation' | 'intelligence'

  const currentIndustry = INDUSTRIES.find(i => i.id === selectedIndustryId) || INDUSTRIES[0];
  const activeConversation = currentIndustry.channels[selectedConversationIndex] || currentIndustry.channels[0];

  // Sync initial industry if changed from parent
  useEffect(() => {
    if (initialIndustryId) {
      setSelectedIndustryId(initialIndustryId);
    }
  }, [initialIndustryId]);

  // Track initial experience open
  useEffect(() => {
    analytics.track('experience_opened', { industry: selectedIndustryId, screen: currentScreen });
  }, []);

  // Conversation playback loop
  useEffect(() => {
    if (currentScreen !== 3 || !isPlaying) return;

    const timer = setInterval(() => {
      setActiveMessageIndex(prev => {
        const total = activeConversation.messages.length;
        if (prev < total) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 900);
          setTimelineProgress(Math.min(8, (prev + 1) * 2));
          return prev + 1;
        } else {
          // Reached end of messages
          setTimelineProgress(8);
          analytics.track('demo_completed', { conversationId: activeConversation.id, industry: currentIndustry.id });
          return total;
        }
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [currentScreen, isPlaying, activeConversation]);

  // Handle switching screen
  const navigateScreen = (screenNumber, eventName = null, payload = null) => {
    setCurrentScreen(screenNumber);
    if (eventName) {
      analytics.track(eventName, payload);
    }
    document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Replay active conversation
  const handleReplay = () => {
    setActiveMessageIndex(1);
    setTimelineProgress(2);
    setIsPlaying(true);
    analytics.track('demo_replayed', { conversationId: activeConversation.id });
  };

  // Select conversation in Left Panel
  const handleSelectConversation = (idx) => {
    setSelectedConversationIndex(idx);
    setActiveMessageIndex(1);
    setTimelineProgress(3);
    setIsPlaying(true);
    analytics.track('conversation_selected', { 
      index: idx, 
      channel: currentIndustry.channels[idx]?.channel,
      industry: currentIndustry.id 
    });
  };

  return (
    <section id="experience" className="scroll-mt-20 border-t border-slate-100 bg-slate-50/50 pb-20 pt-12 sm:pt-16">
      
      {/* Main Experience Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================
            SCREEN 01: INDUSTRY SCENARIO SELECTION
        ======================================================== */}
        {currentScreen === 1 && (
          <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
            {/* Landing Hero */}
            <div className="text-center space-y-4 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Screen 01 of 06: Business Context Configuration</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                See How Every Conversation Becomes an Opportunity.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Explore how LeadHive AI understands customer conversations across multiple channels, identifies intent, qualifies prospects and delivers actionable sales intelligence.
              </p>
              <p className="text-xs text-slate-400">
                No login, registration, OAuth or external account connection required.
              </p>
            </div>

            {/* Industry Selection Cards */}
            <div id="industry-grid" className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Select a Commercial Vertical:</h3>
                <span className="text-xs text-slate-500">Adapts qualification rules & scoring weights</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {INDUSTRIES.map(ind => {
                  const Icon = ICON_MAP[ind.icon] || Building2;
                  return (
                    <div
                      key={ind.id}
                      className="h-full min-h-[310px] rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 text-left shadow-[0_22px_55px_-30px_rgba(15,23,42,0.38)]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>
                        <h4 className="text-lg font-bold tracking-[-0.02em] text-slate-900">{ind.name}</h4>
                        <p className="text-sm leading-5 text-slate-500 mt-1.5">{ind.tagline}</p>

                        <div className="mt-6 pt-5 border-t border-slate-100">
                          <p className="font-semibold text-sm leading-5 text-slate-800 whitespace-normal">{ind.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            SCREEN 02: MULTI-CHANNEL CONVERSATION FEED
        ======================================================== */}
        {currentScreen === 2 && (
          <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Screen 02 of 06</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Multi-Channel Inbound Feed
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Incoming sample conversations across all 6 supported customer touchpoints for <span className="font-semibold text-slate-900">{currentIndustry.name}</span>.
                </p>
              </div>

              <button
                onClick={() => navigateScreen(3, 'ai_activity_viewed', { screen: 3 })}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-brand flex items-center justify-center gap-2 self-start sm:self-auto"
              >
                <span>Run Autonomous AI Demonstration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Channel-specific compliance notice */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Channel-Specific Interaction Architecture:</p>
                <p className="text-amber-800 mt-0.5">
                  YouTube and TikTok demonstrate authentic public comments and audience engagement workflows. Facebook, Instagram, and WhatsApp demonstrate direct messaging and inquiry flows. Separate channel conversations are not implied to belong to the same person.
                </p>
              </div>
            </div>

            {/* Conversation Feed List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentIndustry.channels.map((item, idx) => {
                const firstMsg = item.messages[0];
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      handleSelectConversation(idx);
                      navigateScreen(3, 'conversation_selected', { channel: item.channel, id: item.id });
                    }}
                    className="group bg-white border border-slate-200 hover:border-brand-300 rounded-2xl p-5 shadow-subtle hover:shadow-card transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Top row: Channel identity + Time */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <ChannelIcon channel={item.channel} className="w-8 h-8 rounded-lg" />
                          <div>
                            <span className="text-xs font-bold text-slate-900 capitalize">{item.channel} Inbound</span>
                            <p className="text-[11px] text-slate-500">{item.customer.name}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {item.time}
                        </span>
                      </div>

                      {/* Customer Message snippet */}
                      <div className="mt-3.5 space-y-1.5">
                        <p className="text-xs font-semibold text-slate-700">Inbound Query:</p>
                        <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2 italic">
                          "{firstMsg?.text}"
                        </p>
                      </div>

                      {/* Extracted initial intent pill */}
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">Initial Intent:</span>
                        <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded text-[11px]">
                          {item.initialIntent}
                        </span>
                      </div>
                    </div>

                    {/* Bottom action row */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        {item.messages.length} messages in thread
                      </span>
                      <span className="font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Select & Process
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation footer */}
            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => navigateScreen(1)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white"
              >
                ← Back to Industry Selection
              </button>
              <button
                onClick={() => navigateScreen(3, 'ai_activity_viewed')}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-brand flex items-center gap-2"
              >
                <span>Proceed to Core 3-Panel AI Demonstration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN 03: AUTONOMOUS AI INTELLIGENCE (CORE 3-PANEL DEMO)
        ======================================================== */}
        {currentScreen === 3 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Screen 03 of 06</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-slate-800 uppercase">{currentIndustry.name} Demonstration</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                  Autonomous AI Intelligence Engine
                </h2>
              </div>

              {/* Simulation Playback & Replay Controls */}
              <div className="flex items-center gap-3 self-start md:self-auto">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                      analytics.track(isPlaying ? 'demo_paused' : 'demo_resumed');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white text-slate-800 font-semibold shadow-xs flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 text-brand-600" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{isPlaying ? 'Pause' : 'Resume'}</span>
                  </button>

                  <button
                    onClick={handleReplay}
                    className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </button>
                </div>

                <button
                  onClick={() => navigateScreen(4, 'opportunity_dashboard_viewed')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <span>Opportunity Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden bg-white border border-slate-200 rounded-xl p-1 gap-1 text-xs font-semibold">
              <button
                onClick={() => setActiveMobileTab('channels')}
                className={`flex-1 py-2 rounded-lg text-center ${activeMobileTab === 'channels' ? 'bg-brand-500 text-white' : 'text-slate-600'}`}
              >
                Channels ({currentIndustry.channels.length})
              </button>
              <button
                onClick={() => setActiveMobileTab('conversation')}
                className={`flex-1 py-2 rounded-lg text-center ${activeMobileTab === 'conversation' ? 'bg-brand-500 text-white' : 'text-slate-600'}`}
              >
                Conversation
              </button>
              <button
                onClick={() => setActiveMobileTab('intelligence')}
                className={`flex-1 py-2 rounded-lg text-center ${activeMobileTab === 'intelligence' ? 'bg-brand-500 text-white' : 'text-slate-600'}`}
              >
                Intelligence
              </button>
            </div>

            {/* THREE PANELS (Desktop: 3 cols / Tablet: collapsible / Mobile: tabs) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              
              {/* ==========================================
                  LEFT PANEL: CHANNEL CONVERSATIONS (3 cols)
              ========================================== */}
              <div className={`md:col-span-3 space-y-3 ${activeMobileTab !== 'channels' ? 'hidden md:block' : 'block'}`}>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Channel Ingestion
                    </span>
                    <span className="text-[10px] font-mono bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold">
                      {currentIndustry.channels.length} ACTIVE
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2">
                    Select a conversation to process live:
                  </p>

                  <div className="space-y-2 mt-3 max-h-[580px] overflow-y-auto pr-1">
                    {currentIndustry.channels.map((c, i) => {
                      const isSelected = selectedConversationIndex === i;
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            handleSelectConversation(i);
                            setActiveMobileTab('conversation');
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-brand-50/80 border-brand-400 ring-1 ring-brand-300 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ChannelIcon channel={c.channel} className="w-6 h-6 rounded-md" />
                              <span className="text-xs font-bold text-slate-900 capitalize">{c.channel}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{c.time.split(' ')[0]}</span>
                          </div>

                          <p className="text-xs font-semibold text-slate-800 mt-1.5 line-clamp-1">
                            {c.customer.name}
                          </p>

                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">
                            "{c.messages[0]?.text}"
                          </p>

                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">{c.initialIntent}</span>
                            <span className={`font-bold px-1.5 py-0.2 rounded ${
                              c.temperature === 'Hot' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {c.score}/100
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ==========================================
                  CENTRE PANEL: CONVERSATION & TIMELINE (5 cols)
              ========================================== */}
              <div className={`md:col-span-5 space-y-4 ${activeMobileTab !== 'conversation' ? 'hidden md:block' : 'block'}`}>
                
                {/* Chat window container */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-subtle flex flex-col h-[520px]">
                  
                  {/* Chat Header: Channel identity + Customer */}
                  <div className="p-3.5 border-b border-slate-200 bg-slate-50/60 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ChannelIcon channel={activeConversation.channel} className="w-8 h-8 rounded-lg" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900">{activeConversation.customer.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400">({activeConversation.customer.handle})</span>
                        </div>
                        <p className="text-[10px] text-slate-500 capitalize">
                          {activeConversation.channel} Interaction • {activeConversation.customer.location}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      Simulated
                    </span>
                  </div>

                  {/* Message Stream */}
                  <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/30">
                    {activeConversation.messages.slice(0, activeMessageIndex).map((m, idx) => {
                      const isCustomer = m.sender === 'customer';
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'} animate-fadeIn`}
                        >
                          <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-mono">
                            {isCustomer ? activeConversation.customer.name : 'LeadHive AI Agent'} • {m.time}
                          </span>
                          <div
                            className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                              isCustomer
                                ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                                : 'bg-brand-500 text-white rounded-tr-xs shadow-xs'
                            }`}
                          >
                            <p>{m.text}</p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex items-center gap-1 p-2 bg-slate-100 text-slate-500 rounded-xl text-xs w-20 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
                      </div>
                    )}
                  </div>

                  {/* Chat Input Simulation footer */}
                  <div className="p-3 border-t border-slate-200 bg-white rounded-b-2xl flex items-center justify-between text-xs text-slate-400">
                    <span className="italic text-[11px]">Autonomous response mode active (simulated channel adapter)</span>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-brand-600">
                      <Zap className="w-3 h-3 text-brand-500" />
                      <span>Zero latency</span>
                    </div>
                  </div>
                </div>

                {/* AI ACTIVITY TIMELINE (8 System Steps per specification) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                      AI Activity Timeline
                    </span>
                    <span className="text-[10px] font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-bold">
                      Step {Math.min(activeConversation.timelineSteps.length, timelineProgress)} of {activeConversation.timelineSteps.length}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3 max-h-48 overflow-y-auto pr-1">
                    {activeConversation.timelineSteps.map((step, idx) => {
                      const isComplete = idx < timelineProgress;
                      const isCurrent = idx === timelineProgress - 1;
                      return (
                        <div
                          key={step.id}
                          className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-all ${
                            isCurrent
                              ? 'bg-brand-50/80 border border-brand-200 text-brand-900 font-semibold'
                              : isComplete
                              ? 'text-slate-700'
                              : 'text-slate-400 opacity-60'
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                            isComplete ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isComplete ? '✓' : idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="leading-tight">{step.step}</p>
                            {step.detail && isComplete && (
                              <p className="text-[10px] text-slate-500 font-normal mt-0.5 font-mono">{step.detail}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* ==========================================
                  RIGHT PANEL: LEAD INTELLIGENCE (4 cols)
              ========================================== */}
              <div className={`md:col-span-4 space-y-4 ${activeMobileTab !== 'intelligence' ? 'hidden md:block' : 'block'}`}>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
                  
                  {/* Panel Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Lead Intelligence
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Structured Data
                    </span>
                  </div>

                  {/* Lead Score Big Metric */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-brand-50/40 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Autonomous Lead Score</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-extrabold text-slate-900">{activeConversation.score}</span>
                        <span className="text-sm font-semibold text-slate-400">/ 100</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">High commercial readiness</p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        <Flame className="w-3.5 h-3.5 text-rose-600" />
                        {activeConversation.temperature} Lead
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">Urgency: High</p>
                    </div>
                  </div>

                  {/* Completeness Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">Qualification Completeness</span>
                      <span className="font-bold text-brand-700">92%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-500 h-full rounded-full transition-all duration-700" style={{ width: '92%' }} />
                    </div>
                  </div>

                  {/* Extracted Attributes Table */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Extracted Attributes</p>
                    
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Intent:</span>
                        <span className="font-semibold text-slate-900">{activeConversation.initialIntent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Industry:</span>
                        <span className="font-semibold text-slate-900">{currentIndustry.name}</span>
                      </div>
                      {Object.entries(activeConversation.attributes).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-semibold text-slate-800">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Next Action Card */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Recommended Sales Action</span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
                      {currentIndustry.defaultLead.recommendedAction}
                    </p>
                  </div>

                  {/* Handover button */}
                  <button
                    onClick={() => navigateScreen(5, 'sales_handover_initiated')}
                    className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-brand flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Proceed to Sales Handover</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <p className="text-[10px] text-slate-400 text-center italic">
                    Demonstration scores are illustrative and are not validated conversion probabilities.
                  </p>

                </div>
              </div>

            </div>

            {/* Bottom Screen Navigation Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => navigateScreen(2)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white"
              >
                ← Back to Feed
              </button>
              <button
                onClick={() => navigateScreen(4, 'opportunity_dashboard_viewed')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-subtle flex items-center gap-2"
              >
                <span>View Consolidated Opportunity Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================
            SCREEN 04: OPPORTUNITY DASHBOARD
        ======================================================== */}
        {currentScreen === 4 && (
          <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Screen 04 of 06</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Consolidated Opportunity Dashboard
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Structured, prioritized pipeline generated autonomously from conversation streams.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => navigateScreen(3)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white"
                >
                  ← Back to AI Demonstration
                </button>
                <button
                  onClick={() => navigateScreen(5)}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-brand flex items-center gap-1.5"
                >
                  <span>Simulate Sales Handover</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Illustrative KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
                <p className="text-xs text-slate-500">Total Conversations</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">1,428</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Across 6 channels</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
                <p className="text-xs text-slate-500">Qualified Leads</p>
                <p className="text-2xl font-extrabold text-brand-600 mt-1">384</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">26.8% conversion</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-subtle bg-rose-50/20">
                <p className="text-xs text-rose-700 font-semibold">High-Intent Opportunities</p>
                <p className="text-2xl font-extrabold text-rose-600 mt-1">142</p>
                <p className="text-[11px] text-rose-700 mt-0.5">Immediate closing priority</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
                <p className="text-xs text-slate-500">Follow-ups Required</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">68</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated cadence active</p>
              </div>
            </div>

            {/* Opportunity Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-subtle overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                <h3 className="text-sm font-bold text-slate-900">Prioritized Opportunity Table</h3>
                <span className="text-xs text-slate-400">Click any row to view full dossier</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Prospect</th>
                      <th className="py-3 px-4">Source Channel</th>
                      <th className="py-3 px-4">Requirement</th>
                      <th className="py-3 px-4">Intent</th>
                      <th className="py-3 px-4">Lead Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentIndustry.channels.map((ch, idx) => {
                      const isHot = ch.score >= 85;
                      const isSelected = selectedDashboardOpp?.id === ch.id;
                      return (
                        <tr
                          key={ch.id}
                          onClick={() => setSelectedDashboardOpp(ch)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-brand-50/70 font-medium' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                            {ch.customer.name}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 capitalize">
                              <ChannelIcon channel={ch.channel} className="w-4 h-4 rounded" />
                              <span>{ch.channel}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-slate-700">
                            {ch.attributes.propertyType || ch.attributes.service || ch.attributes.program || ch.attributes.targetVehicle || ch.attributes.quantity || 'Service Consultation'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                            {ch.initialIntent}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              isHot ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {ch.score}/100
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                              ch.temperature === 'Hot' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {ch.temperature}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-emerald-800 font-medium max-w-xs truncate">
                            {ch.recommendedAction || currentIndustry.defaultLead.recommendedAction}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Opportunity Detail Panel (Selected Row) */}
            {(() => {
              const activeOpp = selectedDashboardOpp || currentIndustry.channels[0] || {
                customer: { name: currentIndustry.defaultLead.prospect },
                channel: currentIndustry.defaultLead.channel,
                score: currentIndustry.defaultLead.score,
                temperature: currentIndustry.defaultLead.temperature,
                attributes: {
                  budget: currentIndustry.defaultLead.budget,
                  timeline: currentIndustry.defaultLead.timeline,
                  location: currentIndustry.defaultLead.location
                },
                recommendedAction: currentIndustry.defaultLead.recommendedAction
              };
              const oppAttr = activeOpp.attributes || {};
              return (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-brand-600" />
                      <h4 className="text-base font-bold text-slate-900">
                        Opportunity Dossier: {activeOpp.customer.name}
                      </h4>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      activeOpp.temperature === 'Hot' ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-blue-700 bg-blue-50 border-blue-200'
                    }`}>
                      {activeOpp.temperature} Lead ({activeOpp.score}/100)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Conversation Summary</p>
                      <p className="mt-1 text-slate-800 leading-relaxed font-medium">
                        Prospect engaged via <span className="capitalize font-semibold">{activeOpp.channel}</span>, validated intent for <span className="font-semibold">{oppAttr.propertyType || oppAttr.service || oppAttr.program || oppAttr.targetVehicle || activeOpp.initialIntent || 'commercial opportunity'}</span>.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Extracted Qualification Details</p>
                      <p className="mt-1 text-slate-800 font-semibold">
                        Budget: {oppAttr.budget || currentIndustry.defaultLead.budget}
                      </p>
                      <p className="text-slate-600">
                        Timeline: {oppAttr.timeline || currentIndustry.defaultLead.timeline}
                      </p>
                      <p className="text-slate-600">
                        Location: {oppAttr.location || currentIndustry.defaultLead.location}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                      <p className="font-bold uppercase tracking-wider text-[10px] text-emerald-800">Human Handover Recommendation</p>
                      <p className="mt-1 font-semibold text-emerald-900">
                        {activeOpp.recommendedAction || currentIndustry.defaultLead.recommendedAction}
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-1">
                        Dossier structured for high-conversion consultative sales handover.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      onClick={() => navigateScreen(5)}
                      className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-brand flex items-center gap-2"
                    >
                      <span>Simulate Sales Handover Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* ========================================================
            SCREEN 05: SALES HANDOVER SIMULATION
        ======================================================== */}
        {currentScreen === 5 && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="text-center space-y-2 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Screen 05 of 06</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Opportunity Identified: Sales Handover Simulation
              </h2>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                A qualified prospect is ready for sales-team attention. Experience how AI packages actionable intelligence for human relationship-building.
              </p>
            </div>

            {/* Handover Dossier Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
              
              {/* Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      HOT LEAD • SCORE 92/100
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                      {currentIndustry.defaultLead.prospect}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500">Channel: WhatsApp Business</span>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">Qualification Level: High (95%)</p>
                </div>
              </div>

              {/* Dossier Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Customer Requirement</p>
                  <p className="text-sm font-bold text-slate-900">{currentIndustry.defaultLead.requirement}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Buying Intent Signal</p>
                  <p className="text-sm font-bold text-slate-900">{currentIndustry.defaultLead.intent}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Budget & Location</p>
                  <p className="text-sm font-bold text-slate-900">{currentIndustry.defaultLead.budget} • {currentIndustry.defaultLead.location}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Purchase Timeline</p>
                  <p className="text-sm font-bold text-slate-900">{currentIndustry.defaultLead.timeline}</p>
                </div>
              </div>

              {/* Suggested Follow-up & Recommended Action */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Recommended Sales Action</p>
                </div>
                <p className="text-sm font-bold text-emerald-900">
                  {currentIndustry.defaultLead.recommendedAction}
                </p>
                <p className="text-xs text-emerald-800 bg-white/70 p-3 rounded-xl border border-emerald-200/80 leading-relaxed">
                  <span className="font-semibold">Handover Note:</span> {currentIndustry.defaultLead.handoverNote}
                </p>
              </div>

              {/* Simulation Trigger Button */}
              <div className="text-center pt-2">
                {!handoverSimulated ? (
                  <button
                    onClick={() => {
                      setHandoverSimulated(true);
                      analytics.track('sales_handover_simulated', { prospect: currentIndustry.defaultLead.prospect });
                    }}
                    className="px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-brand text-sm transition-all inline-flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Simulate Sales Handover</span>
                  </button>
                ) : (
                  <div className="p-4 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl animate-fadeIn space-y-2 max-w-lg mx-auto">
                    <div className="flex items-center justify-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <span>Handover Simulation Complete!</span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Sample sales dossier routed to DHA Senior Property Consultant queue.
                    </p>
                  </div>
                )}
              </div>

              {/* Strict Simulation Disclaimer per specification */}
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-[11px] text-slate-500 text-center">
                <span className="font-semibold text-slate-700">Strict Demonstration Boundary:</span> This is a controlled simulated environment. No actual sales personnel were alerted, no external CRM was updated, and no live assignment occurred.
              </div>

            </div>

            {/* Bottom Nav */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => navigateScreen(4)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white"
              >
                ← Back to Opportunity Dashboard
              </button>
              <button
                onClick={() => navigateScreen(6)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-subtle flex items-center gap-2"
              >
                <span>Final Summary & Consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================
            SCREEN 06: CONVERSION CTA
        ======================================================== */}
        {currentScreen === 6 && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto pt-4 text-center">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Screen 06 of 06: Realize the Value</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Your Next Customer Could Already Be Talking to You.
              </h2>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Let LeadHive AI identify the opportunities hidden in your customer conversations and help your sales team focus on what matters.
              </p>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
              <button
                onClick={() => {
                  analytics.track('book_demo_clicked', { source: 'screen_06_personalized_demo' });
                  onOpenBooking('Personalized Demo (Experience Centre)');
                }}
                className="p-5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white shadow-brand transition-all text-left flex flex-col justify-between group"
              >
                <div>
                  <h4 className="text-base font-bold flex items-center justify-between">
                    <span>Book a Personalized Demo</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-xs text-brand-100 mt-1 leading-relaxed">
                    Custom live walkthrough with your industry channels, custom brand guidelines and CRM integrations.
                  </p>
                </div>
                <span className="text-[11px] text-brand-200 mt-4">Takes 20 minutes</span>
              </button>

              <button
                onClick={() => {
                  analytics.track('consultation_requested', { source: 'screen_06_consultation' });
                  onOpenBooking('Sales Architecture Consultation');
                }}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-900 shadow-subtle transition-all text-left flex flex-col justify-between group"
              >
                <div>
                  <h4 className="text-base font-bold flex items-center justify-between">
                    <span>Request a Consultation</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Discuss your volume, existing channels, team size, and tailored sales qualification criteria.
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 mt-4">Tailored proposal</span>
              </button>
            </div>

            {/* Secondary Option CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs font-semibold">
              <button
                onClick={() => {
                  analytics.track('pricing_clicked', { source: 'screen_06_pricing' });
                  onOpenBooking('Pricing Tier Discussion');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Explore Enterprise Pricing
              </button>

              <button
                onClick={() => {
                  onOpenBooking('Speak with Leadership Team');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Talk to Our Team
              </button>

              <button
                onClick={() => {
                  navigateScreen(1);
                }}
                className="px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Explore Another Industry Scenario</span>
              </button>
            </div>

            {/* Back to Home Link */}
            <div className="pt-6">
              <button
                onClick={onBackToHome}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-4"
              >
                ← Return to LeadHive AI Homepage
              </button>
            </div>

          </div>
        )}

      </div>

    </section>
  );
}

